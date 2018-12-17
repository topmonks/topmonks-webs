import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

/**
 * Creates S3 bucket with static website hosting enabled
 * @param parent {pulumi.ComponentResource} parent component
 * @param domain {string} website domain name
 * @param settings {aws.s3.BucketArgs}
 * @returns {aws.s3.Bucket}
 */
function createBucket(
  parent: pulumi.ComponentResource,
  domain: string,
  settings: aws.s3.BucketArgs
) {
  const website = settings.website || {
    indexDocument: "index.html",
    errorDocument: "404.html"
  };
  return new aws.s3.Bucket(
    `${domain}/bucket`,
    {
      bucket: domain,
      acl: "public-read",
      website
    },
    { parent }
  );
}

/**
 * Creates Public read bucket policy
 * @param parent {pulumi.ComponentResource} parent component
 * @param domain {string} website domain name
 * @param bucket {aws.s3.Bucket}
 * @returns {aws.s3.BucketPolicy}
 */
function createBucketPolicy(
  parent: pulumi.ComponentResource,
  domain: string,
  bucket: aws.s3.Bucket
) {
  return new aws.s3.BucketPolicy(
    `${domain}/bucket-policy`,
    {
      bucket: bucket.bucket,
      policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "1",
            Effect: "Allow",
            Principal: {
              AWS: "*"
            },
            Action: "s3:GetObject",
            Resource: `arn:aws:s3:::${domain}/*`
          }
        ]
      })
    },
    { parent }
  );
}

/**
 * Creates CloudFront distribution on top of S3 website
 * @param parent {pulumi.ComponentResource} parent component
 * @param domain {string} website domain name
 * @param contentBucket {aws.s3.Bucket}
 * @returns {aws.cloudfront.Distribution}
 */
function createCloudFront(
  parent: pulumi.ComponentResource,
  domain: string,
  contentBucket: aws.s3.Bucket
) {
  const acmCertificate = getCertificate(domain);
  return new aws.cloudfront.Distribution(
    `${domain}/cdn-distribution`,
    {
      enabled: true,
      aliases: [domain],
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
            originSslProtocols: ["TLSv1.2"]
          }
        }
      ],
      defaultRootObject: "index.html",
      defaultCacheBehavior: {
        targetOriginId: contentBucket.arn,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        forwardedValues: {
          cookies: { forward: "none" },
          queryString: false
        },
        minTtl: 0,
        defaultTtl: 86400,
        maxTtl: 31536000,
        // enable gzip
        compress: true,
        lambdaFunctionAssociations: [
          // add lambda edge with security headers for A+ SSL Grade
          {
            eventType: "viewer-response",
            lambdaArn:
              "arn:aws:lambda:us-east-1:661884430919:function:SecurityHeaders:6"
          }
        ]
      },
      priceClass: "PriceClass_100",
      restrictions: {
        geoRestriction: {
          restrictionType: "none"
        }
      },
      viewerCertificate: {
        acmCertificateArn: acmCertificate.apply(x => x.arn),
        sslSupportMethod: "sni-only",
        minimumProtocolVersion: "TLSv1.2_2018"
      },
      isIpv6Enabled: true
    },
    {
      parent,
      dependsOn: [contentBucket]
    }
  );
}

/**
 * Creates a new Route53 DNS record pointing the domain to the CloudFront distribution.
 * @param parent {pulumi.ComponentResource} parent component
 * @param domain {string} website domain name
 * @param cname {pulumi.Output<string>} aliased domain name
 * @returns {Promise<aws.route53.Record>}
 */
function createAliasRecord(
  parent: pulumi.ComponentResource,
  domain: string,
  cname: pulumi.Output<string>
) {
  const hostedZone = getHostedZone(domain);
  return new aws.route53.Record(
    `${domain}/dns-record`,
    {
      name: domain,
      zoneId: hostedZone.apply(x => x.zoneId),
      type: "CNAME",
      ttl: 300,
      records: [cname]
    },
    { parent }
  );
}

function getHostedZone(domain: string) {
  const domainParts = getDomainAndSubdomain(domain);
  const hostedZone = aws.route53.getZone({
    name: domainParts.parentDomain
  });
  return pulumi.output(hostedZone);
}

/**
 * Gets Widlcard certificate for top domain
 * @param domain {string} website domain name
 * @returns {pulumi.Output<pulumi.Unwrap<aws.acm.GetCertificateResult>>}
 */
function getCertificate(domain: string) {
  const parentDomain = getParentDomain(domain);
  const usEast1 = new aws.Provider(`${domain}/provider/us-east-1`, {
    region: aws.USEast1Region
  });
  const certificate = aws.acm.getCertificate(
    { domain: `*.${parentDomain}` },
    { provider: usEast1 }
  );
  return pulumi.output(certificate);
}

function getParentDomain(domain: string) {
  const rootDomain = getDomainAndSubdomain(domain).parentDomain;
  return rootDomain.substr(0, rootDomain.length - 1);
}

/**
 * Split a domain name into its subdomain and parent domain names.
 * e.g. "www.example.com" => "www", "example.com".
 * @param domain
 * @returns {*}
 */
function getDomainAndSubdomain(domain: string) {
  const parts = domain.split(".");
  if (parts.length < 2) {
    throw new Error(`No TLD found on ${domain}`);
  }
  if (parts.length === 2) {
    return { subdomain: "", parentDomain: `${domain}.` };
  }

  const subdomain = parts[0];
  parts.shift();
  return {
    subdomain,
    parentDomain: `${parts.join(".")}.`
  };
}

/**
 * WebSite component resource represents logical unit of static web site
 * hosted in AWS S3 and distributed via CloudFront CDN with Route53 DNS Record.
 */
export class WebSite extends pulumi.ComponentResource {
  contentBucket: aws.s3.Bucket;
  contentBucketPolicy: aws.s3.BucketPolicy;
  cdn?: aws.cloudfront.Distribution;
  dnsRecord: aws.route53.Record;
  public domain: pulumi.Output<string>;
  public url: pulumi.Output<string>;
  public contentBucketUri: pulumi.Output<string>;
  public cloudFrontId?: pulumi.Output<string>;

  /**
   *
   * @param domain {string} domain name of the website
   * @param settings {*} optional overrides of website configuration
   * @param opts {pulumi.ComponentResourceOptions}
   */
  constructor(
    domain: string,
    settings: any,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("topmonks-webs:WebSite", domain, settings, opts);
    this.domain = pulumi.output(domain);
    this.url = pulumi.output(`https://${domain}/`);
  }

  /**
   * Asynchronously creates new WebSite Resource
   * @param domain {string} website domain name
   * @param settings {*} optional overrides of website configuration
   * @param opts {pulumi.ComponentResourceOptions}
   * @returns {WebSite}
   */
  static create(
    domain: string,
    settings: any,
    opts?: pulumi.ComponentResourceOptions
  ) {
    const website = new WebSite(domain, settings, opts);
    const contentBucket = (website.contentBucket = createBucket(
      website,
      domain,
      settings.bucket || {}
    ));
    website.contentBucketPolicy = createBucketPolicy(
      website,
      domain,
      contentBucket
    );
    let cdn;
    if (!(settings.cdn && settings.cdn.disabled)) {
      cdn = website.cdn = createCloudFront(website, domain, contentBucket);
    }
    const cname = cdn ? cdn.domainName : contentBucket.bucketDomainName;
    website.dnsRecord = createAliasRecord(website, domain, cname);

    const outputs: pulumi.Inputs = {
      contentBucketUri: contentBucket.bucketDomainName.apply(t => `s3://${t}`),
      url: website.url,
      domain: website.domain
    };
    if (cdn) {
      outputs["cloudFrontId"] = cdn.id;
    }
    website.registerOutputs(outputs);
    return website;
  }
}
