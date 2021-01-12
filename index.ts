import * as pulumi from "@pulumi/pulumi";
import {
  registerAutoTags,
  createCertificate,
  createGoogleMxRecords,
  createTxtRecord,
  Website
} from "@topmonks/pulumi-aws";
import * as arx from "./arx.monks.cloud/infra";

// Automatically inject tags.
registerAutoTags({
  "user:Project": pulumi.getProject(),
  "user:Stack": pulumi.getStack()
});

createCertificate("www.cbx.cz");
createCertificate("www.chytrybox.cz");
createCertificate("www.hookamonk.com");
createCertificate("www.ingridapp.io");
createCertificate("www.zive.tv");

createGoogleMxRecords("chytrybox.cz");
createTxtRecord(
  "google-site-verification",
  "chytrybox.cz",
  "google-site-verification=KlEgvM1Rx9iOnZm53YPCzRsHkmltTuIEMV63L50gfus"
);

const websites = require("./websites.json");
export const sites: any = {};
for (const domain in websites) {
  const website = Website.create(domain, websites[domain]);
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
  const website = Website.createRedirect(domain, redirects[domain]);
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
