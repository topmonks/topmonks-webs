import * as pulumi from "@pulumi/pulumi";
import * as topmonks from "./.scripts/pulumi-resources/website";

const websites = require("./websites.json");
export const sites: any = {};
for (const domain in websites) {
  const website = topmonks.Website.create(domain, websites[domain]);
  sites[domain] = {
    url: website.url,
    s3BucketUri: website.s3BucketUri,
    s3WebsiteUrl: website.s3WebsiteUrl,
    cloudFrontId: website.cloudFrontId
  };
}

const redirects = require("./redirects.json");
export const redirectSites: any = {};
for (const domain in redirects) {
  const website = topmonks.Website.createRedirect(domain, redirects[domain]);
  redirectSites[domain] = {
    url: website.url,
    s3BucketUri: website.s3BucketUri,
    cloudFrontId: website.cloudFrontId
  };
}
