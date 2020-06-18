import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as inputs from "@pulumi/aws/types/input";

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
      website,
      forceDestroy: true
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
 * @param isSPA {boolean}
 * @returns {aws.cloudfront.Distribution}
 */
function createCloudFront(
  parent: pulumi.ComponentResource,
  domain: string,
  contentBucket: aws.s3.Bucket,
  isPwa: boolean | undefined
) {
  const acmCertificate = getCertificate(domain);
  const customErrorResponses: pulumi.Input<
    inputs.cloudfront.DistributionCustomErrorResponse
  >[] = [];
  if (isPwa)
    customErrorResponses.push({
      errorCode: 404,
      responseCode: 200,
      responsePagePath: "/index.html"
    });
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
      customErrorResponses,
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
              "arn:aws:lambda:us-east-1:661884430919:function:SecurityHeaders:7"
          }
        ]
      },
      orderedCacheBehaviors: [
        {
          allowedMethods: ["GET", "HEAD", "OPTIONS"],
          cachedMethods: ["GET", "HEAD", "OPTIONS"],
          compress: true,
          defaultTtl: 31536000,
          forwardedValues: {
            cookies: {
              forward: "none"
            },
            headers: ["Origin"],
            queryString: false
          },
          maxTtl: 31536000,
          minTtl: 31536000,
          pathPattern: "/assets/*",
          targetOriginId: contentBucket.arn,
          viewerProtocolPolicy: "redirect-to-https",
          lambdaFunctionAssociations: [
            // add lambda edge with cache headers for immutable assets
            {
              eventType: "viewer-response",
              lambdaArn:
                "arn:aws:lambda:us-east-1:661884430919:function:CacheHeaders:2"
            }
          ]
        }
      ],
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
 * Creates a new Route53 DNS record pointing the domain or the CloudFront distribution.
 * For CloudFront distribution ALIAS record is created. Otherwise CNAME.
 * This allowes to have naked domain websites.
 * @param parent {pulumi.ComponentResource} parent component
 * @param domain {string} website domain name
 * @param cdn {aws.cloudfront.Distribution} optional CDN distribution. If defined, ALIAS record will be created.
 * @param cname {pulumi.Output<string>} aliased domain name
 * @returns {aws.route53.Record[]}
 */
function createAliasRecords(
  parent: Website,
  domain: string,
  cname: pulumi.Output<string>
): aws.route53.Record[] {
  const hostedZone = getHostedZone(domain);
  const cdn = parent.cdn;
  if (!cdn) {
    const args: aws.route53.RecordArgs = {
      name: domain,
      zoneId: hostedZone.apply((x) => x.zoneId),
      ttl: 300,
      type: "CNAME",
      records: [cname],
    };
    return [
      new aws.route53.Record(`${domain}/dns-record`, args, { parent })
    ]
  }

  const args = (type: string) => ({
    name: domain,
    zoneId: hostedZone.apply(x => x.zoneId),
    type,
    aliases: [
      {
        evaluateTargetHealth: true,
        name: cdn.domainName,
        zoneId: cdn.hostedZoneId,
      },
    ],
  });
  return [
    new aws.route53.Record(`${domain}/dns-record`, args("A"), { parent }),
    new aws.route53.Record(`${domain}/dns-record-ipv6`, args("AAAA"), { parent })
  ];
}

function getHostedZone(domain: string) {
  const domainParts = getDomainAndSubdomain(domain);
  const hostedZone = aws.route53.getZone({
    name: domainParts.parentDomain
  });
  return pulumi.output(hostedZone);
}

/**
 * Creates Widlcard certificate for top domain.
 * This creates certificate for root domain with wildcard for all subdomains.
 * You will need to have just one instance per all your stacks.
 * @param domain {string} website domain name
 * @returns {pulumi.Output<pulumi.Unwrap<aws.acm.GetCertificateResult>>}
 */
export function createCertificate(domain: string) {
  const parentDomain = getParentDomain(domain);
  const usEast1 = new aws.Provider(`${domain}/provider/us-east-1`, {
    profile: aws.config.profile,
    region: aws.USEast1Region,
  });

  const certificate = new aws.acm.Certificate(
    `${parentDomain}-certificate`,
    {
      domainName: `*.${parentDomain}`,
      subjectAlternativeNames: [parentDomain],
      validationMethod: "DNS",
    },
    { provider: usEast1 }
  );
  const hostedZoneId = aws.route53
    .getZone({ name: parentDomain }, { async: true })
    .then((zone) => zone.zoneId);

  /**
   *  Create a DNS record to prove that we _own_ the domain we're requesting a certificate for.
   *  See https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-validate-dns.html for more info.
   */
  const certificateValidationDomain = new aws.route53.Record(
    `${parentDomain}-validationRecord`,
    {
      name: certificate.domainValidationOptions[0].resourceRecordName,
      zoneId: hostedZoneId,
      type: certificate.domainValidationOptions[0].resourceRecordType,
      records: [certificate.domainValidationOptions[0].resourceRecordValue],
      ttl: 600,
    }
  );

  const certificateValidation = new aws.acm.CertificateValidation(
    `${parentDomain}-certificateValidation`,
    {
      certificateArn: certificate.arn,
      validationRecordFqdns: [certificateValidationDomain.fqdn],
    },
    { provider: usEast1 }
  );
  return certificateValidation.certificateArn;
}

/**
 * Gets Widlcard certificate for top domain
 * @param domain {string} website domain name
 * @returns {pulumi.Output<pulumi.Unwrap<aws.acm.GetCertificateResult>>}
 */
function getCertificate(domain: string) {
  const parentDomain = getParentDomain(domain);
  const usEast1 = new aws.Provider(`${domain}/get-provider/us-east-1`, {
    profile: aws.config.profile,
    region: aws.USEast1Region
  });
  const certificate = aws.acm.getCertificate(
    { domain: `*.${parentDomain}`, mostRecent: true, statuses: ["ISSUED"] },
    { provider: usEast1, async: true }
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
export class Website extends pulumi.ComponentResource {
  contentBucket: aws.s3.Bucket;
  contentBucketPolicy: aws.s3.BucketPolicy;
  cdn?: aws.cloudfront.Distribution;
  dnsRecords: aws.route53.Record[];
  public domain: pulumi.Output<string>;
  public url: pulumi.Output<string>;

  get s3BucketUri(): pulumi.Output<string> {
    return this.contentBucket.bucket.apply(x => `s3://${x}`);
  }

  get s3WebsiteUrl(): pulumi.Output<string> {
    return this.contentBucket.websiteEndpoint.apply(x => `http://${x}`);
  }

  get cloudFrontId(): pulumi.Output<string> | undefined {
    return this.cdn && this.cdn.id;
  }

  /**
   *
   * @param domain {string} domain name of the website
   * @param settings {*} optional overrides of website configuration
   * @param opts {pulumi.ComponentResourceOptions}
   */
  constructor(
    domain: string,
    settings: WebsiteSettings,
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
    settings: WebsiteSettings,
    opts?: pulumi.ComponentResourceOptions
  ) {
    const website = new Website(domain, settings, opts);
    const contentBucket = createBucket(website, domain, settings.bucket || {});
    website.contentBucket = contentBucket;
    website.contentBucketPolicy = createBucketPolicy(
      website,
      domain,
      contentBucket
    );
    if (!(settings.cdn?.disabled)) {
      website.cdn = createCloudFront(website, domain, contentBucket, settings.isPwa);
    }
    if (!(settings.dns?.disabled)) {
      website.dnsRecords = createAliasRecords(
        website,
        domain,
        contentBucket.bucketDomainName
      );
    }

    const outputs: pulumi.Inputs = {
      contentBucketUri: website.s3BucketUri,
      s3WebsiteUrl: website.s3WebsiteUrl,
      url: website.url,
      domain: website.domain,
      cloudFrontId: website.cloudFrontId
    };
    website.registerOutputs(outputs);
    return website;
  }

  static createRedirect(
    domain: string,
    settings: RedirectWebsiteSettings,
    opts?: pulumi.ComponentResourceOptions
  ): Website {
    const bucketSettings = {
      website: {
        redirectAllRequestsTo: settings.target
      }
    };
    const website = new Website(domain, { bucket: bucketSettings }, opts);
    const bucket = (website.contentBucket = createBucket(
      website,
      domain,
      bucketSettings
    ));
    website.contentBucketPolicy = createBucketPolicy(website, domain, bucket);
    website.cdn = createCloudFront(website, domain, bucket, false);
    website.dnsRecords = createAliasRecords(
      website,
      domain,
      bucket.bucketDomainName
    );
    return website;
  }
}

interface WebsiteSettings {
  isPwa?: boolean;
  bucket?: aws.s3.BucketArgs;
  cdn?: DisableSetting;
  dns?: DisableSetting;
  "lh-token"?: string;
}

interface RedirectWebsiteSettings {
  target: string;
}

interface DisableSetting {
  disabled: boolean;
}
