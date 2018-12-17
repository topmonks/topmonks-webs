import * as pulumi from "@pulumi/pulumi";
import * as topmonks from "./.scripts/pulumi-resources/website";

const websites = require("./websites.json");

export const sites: any = {};
for (const domain of Object.keys(websites)) {
  const website = topmonks.WebSite.create(domain, websites[domain]);
  sites[domain] = {
    contentBucketUri: website.contentBucketUri,
    cloudFrontId: website.cloudFrontId
  };
}
