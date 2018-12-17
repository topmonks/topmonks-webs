import * as pulumi from "@pulumi/pulumi";
import * as topmonks from "./.scripts/pulumi-resources/website";

const websites = require("./websites.json");

export const sites = Object.keys(websites)
  .map(domain => topmonks.WebSite.create(domain, websites[domain]))
  .map(site => ({
    [`${site.domain}`]: {
      contentBucketUri: site.contentBucketUri,
      cloudFrontId: site.cloudFrontId
    }
  }))
  .reduce((acc, site) => Object.assign(acc, site), {});
