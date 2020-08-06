import * as pulumi from "@pulumi/pulumi";
import * as topmonks from "./.scripts/pulumi-resources/website";
import { registerAutoTags } from "./.scripts/pulumi-resources/autotag";
import * as arx from "./arx.monks.cloud/infra";

// Automatically inject tags.
registerAutoTags({
  "user:Project": pulumi.getProject(),
  "user:Stack": pulumi.getStack()
});

topmonks.createCertificate("www.ingridapp.io");

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

export const arxDocumentsBucketUri = arx.documentsBucketUri;
export const arxDocumentsBucketEndpoint = arx.documentsBucketEndpoint;
export const arxDocumentsTable = arx.documentsTable;
export const arxDocumentsApi = arx.documentsApi;
