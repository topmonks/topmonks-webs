import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import * as fs from "fs";
import * as mime from "mime";
import * as path from "path";

const stackConfig = new pulumi.Config("static-website");
const config = {
  pathToWebsiteContents: stackConfig.require("pathToWebsiteContents"),
  targetDomain: stackConfig.require("targetDomain"),
  certificateArn: stackConfig.require("certificateArn"),

  originAccessIdentity: stackConfig.require("originAccessIdentity"),
};

function publicReadPolicyForBucket(bucketName: string) {
  return JSON.stringify({
    Version: "2012-10-17",
    Id: "PolicyForCloudFrontPrivateContent",
    Statement: [
      {
        Sid: "1",
        Effect: "Allow",
        Principal: {
          "AWS": `arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${config.originAccessIdentity}`
        },
        Action: [
          "s3:GetObject"
        ],
        Resource: [
          `arn:aws:s3:::${bucketName}/*` // policy refers to bucket name explicitly
        ]
      },
      {
        Sid: "2",
        Effect: "Allow",
        Principal: {
          "AWS": "*"
        },
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${bucketName}/*`
      }
    ]
  });
}

// contentBucket is the S3 bucket that the website's contents will be stored in.
const contentBucket = new aws.s3.Bucket(config.targetDomain,
  {
    bucket: config.targetDomain,
    website: {
      indexDocument: "index.html"
    }
  });

const bucketPolicy = new aws.s3.BucketPolicy("my-bucket-policy", {
  bucket: contentBucket.bucket,
  policy: contentBucket.bucket.apply(publicReadPolicyForBucket)
});

// crawlDirectory recursive crawls the provided directory, applying the provided function
// to every file it contains. Doesn't handle cycles from symlinks.
function crawlDirectory(dir: string, f: (_: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = `${dir}/${file}`;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      crawlDirectory(filePath, f);
    }
    if (stat.isFile()) {
      f(filePath);
    }
  }
}

const webContentsRootPath = path.join(process.cwd(), config.pathToWebsiteContents);
console.log("Syncing contents from local disk at", webContentsRootPath);
crawlDirectory(
  webContentsRootPath,
  (filePath: string) => {
    const relativeFilePath = filePath.replace(webContentsRootPath + "/", "");
    const contentFile = new aws.s3.BucketObject(
      relativeFilePath,
      {
        key: relativeFilePath,

        acl: "public-read",
        bucket: contentBucket,
        contentType: mime.getType(filePath) || undefined,
        source: new pulumi.asset.FileAsset(filePath),
      },
      {
        parent: contentBucket,
      });
  });


const tenMinutes = 60 * 10;

const aliases = [config.targetDomain,
  config.targetDomain.match("^www.*") ? config.targetDomain.substr(4) : "www." + config.targetDomain];

// distributionArgs configures the CloudFront distribution. Relevant documentation:
// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html
// https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html
const distributionArgs: aws.cloudfront.DistributionArgs = {
  enabled: true,
  aliases: aliases,

  // We only specify one origin for this distribution, the S3 content bucket.
  origins: [
    {
      originId: contentBucket.arn,
      domainName: contentBucket.websiteEndpoint,
      customOriginConfig: {
        // Amazon S3 doesn't support HTTPS connections when using an S3 bucket configured as a website endpoint.
        // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesOriginProtocolPolicy
        originProtocolPolicy: "http-only",
        httpPort: 80,
        httpsPort: 443,
        originSslProtocols: ["TLSv1.2"],
      },
    },
  ],

  defaultRootObject: "index.html",

  defaultCacheBehavior: {
    targetOriginId: contentBucket.arn,

    viewerProtocolPolicy: "redirect-to-https",
    allowedMethods: ["GET", "HEAD", "OPTIONS"],
    cachedMethods: ["GET", "HEAD", "OPTIONS"],

    forwardedValues: {
      cookies: {forward: "none"},
      queryString: false,
    },

    minTtl: 0,
    defaultTtl: tenMinutes,
    maxTtl: tenMinutes,
  },

  priceClass: "PriceClass_100",

  restrictions: {
    geoRestriction: {
      restrictionType: "none",
    },
  },

  // CloudFront certs must be in us-east-1, just like API Gateway.
  viewerCertificate: {
    acmCertificateArn: config.certificateArn,
    sslSupportMethod: "sni-only",
    minimumProtocolVersion: "TLSv1.2_2018",
  },
  isIpv6Enabled: true,
};

const cdn = new aws.cloudfront.Distribution("cdn", distributionArgs);

// Split a domain name into its subdomain and parent domain names.
// e.g. "www.example.com" => "www", "example.com".
function getDomainAndSubdomain(domain: string): { subdomain: string, parentDomain: string } {
  const parts = domain.split(".");
  if (parts.length < 2) {
    throw new Error(`No TLD found on ${domain}`);
  }
  // No subdomain, e.g. awesome-website.com.
  if (parts.length === 2) {
    return {subdomain: "", parentDomain: domain};
  }

  if (parts[0] == "www") {
    parts.shift();
  }
  const subdomain = parts[0];
  parts.shift();
  return {
    subdomain,
    parentDomain: parts.join(".") + ".",
  };
}

// Creates a new Route53 DNS record pointing the domain to the CloudFront distribution.
async function createAliasRecord(
  targetDomain: string, distribution: aws.cloudfront.Distribution): Promise<aws.route53.Record> {
  const domainParts = getDomainAndSubdomain(targetDomain);

  const hostedZone = await aws.route53.getZone({name: domainParts.parentDomain});
  return new aws.route53.Record(
    targetDomain,
    {
      name: domainParts.subdomain,
      zoneId: hostedZone.zoneId,
      type: "CNAME",
      ttl: 300,
      records: [distribution.domainName]
    });
}

const aRecord = createAliasRecord(config.targetDomain, cdn);

// Export properties from this stack. This prints them at the end of `pulumi up` and
// makes them easier to access from the pulumi.com.
export const contentBucketUri = contentBucket.bucket.apply(b => `s3://${b}`);
export const contentBucketWebsiteEndpoint = contentBucket.websiteEndpoint;
export const cloudFrontDomain = cdn.domainName;
