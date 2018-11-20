const aws = require("@pulumi/aws");
const pulumi = require("@pulumi/pulumi");

class TopmonksWebPage extends pulumi.ComponentResource {

  constructor(domain, certificateArn, opt) {
    super("topmonks:TopmonksWebPage", domain, {}, opt);
    this.domain = domain;
    this.createBucket();
    this.createCloudFront(certificateArn);
    let recordPromise = this.createAliasRecord();

    this.registerOutputs({
      contentBucketUri: this.contentBucket.bucketDomainName.apply(t => "s3://" +t),
      contentBucketWebsiteEndpoint: this.contentBucket.websiteEndpoint,
      cloudFrontDomain: this.cdn.domainName,
      cloudFrontId: this.cdn.id,
    })
  }

  createBucket() {
    this.contentBucket = new aws.s3.Bucket(this.domain + "-bucket",
      {
        bucket: this.domain,
        website: {
          indexDocument: "index.html"
        }
      }, {parent: this});

    new aws.s3.BucketPolicy(this.domain + "-policy", {
      bucket: this.contentBucket.bucket,
      policy: this.publicReadPolicyForBucket()
    }, {parent: this});
  }

  createCloudFront(certificateArn) {
    this.cdn = new aws.cloudfront.Distribution(this.domain, this.createDistributionArgs(certificateArn), {parent: this});
  }

  createDistributionArgs(certificateArn) {
    const tenMinutes = 60 * 10;

    return aws.cloudfront.DistributionArgs = {
      enabled: true,
      aliases: [this.domain],

      // We only specify one origin for this distribution, the S3 content bucket.
      origins: [
        {
          originId: this.contentBucket.arn,
          domainName: this.contentBucket.websiteEndpoint,
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
        targetOriginId: this.contentBucket.arn,

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
        acmCertificateArn: certificateArn,
        sslSupportMethod: "sni-only",
        minimumProtocolVersion: "TLSv1.2_2018",
      },
      isIpv6Enabled: true,
    };
  }

// Creates a new Route53 DNS record pointing the domain to the CloudFront distribution.
  async createAliasRecord() {
    const domainParts = this.getDomainAndSubdomain();

    const hostedZone = await aws.route53.getZone({name: domainParts.parentDomain});
    return new aws.route53.Record(
      this.domain,
      {
        name: this.domain,
        zoneId: hostedZone.zoneId,
        type: "CNAME",
        ttl: 300,
        records: [this.cdn.domainName]
      }, {parent: this});
  }

  publicReadPolicyForBucket() {
    return JSON.stringify({
      Version: "2012-10-17",
      Id: "PolicyForCloudFrontPrivateContent",
      Statement: [
        {
          Sid: "1",
          Effect: "Allow",
          Principal: {
            "AWS": "*"
          },
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${this.domain}/*`
        }
      ]
    });
  }

// Split a domain name into its subdomain and parent domain names.
// e.g. "www.example.com" => "www", "example.com".
  getDomainAndSubdomain() {
    const parts = this.domain.split(".");
    if (parts.length < 2) {
      throw new Error(`No TLD found on ${this.domain}`);
    }
    // No subdomain, e.g. awesome-website.com.
    if (parts.length === 2) {
      return {subdomain: "", parentDomain: this.domain};
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
}


module.exports.TopmonksWebPage = TopmonksWebPage;
