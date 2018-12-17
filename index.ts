import * as pulumi from "@pulumi/pulumi";
import * as topmonks from "./.scripts/pulumi-resources/website";

const websites = require("./websites.json");

export const sites = Object.keys(websites)
  .map(domain => topmonks.WebSite.create(domain, websites[domain]))
  .map(site => ({
    [`${site.domain.apply(x => x.replace(".", "-"))}-bucket-uri`]: site.contentBucketUri,
    [`${site.domain.apply(x => x.replace(".", "-"))}-distribution-id`]: site.cloudFrontId
  }))
  .reduce((acc, site) => Object.assign(acc, site), {});
