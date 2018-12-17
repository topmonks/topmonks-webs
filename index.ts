import * as pulumi from "@pulumi/pulumi";
import * as topmonks from "./.scripts/pulumi-resources/website";

const websites = require("./websites.json");

export const sites: any = {};
for (const domain in websites) {
  const website = topmonks.WebSite.create(domain, websites[domain]);
  sites[domain] = {
    url: website.url,
    contentBucketUri: website.contentBucketUri,
    cloudFrontId: website.cloudFrontId
  };
}
