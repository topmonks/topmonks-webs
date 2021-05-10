/* eslint-disable */
import * as pulumi from "@pulumi/pulumi";
import {
  registerAutoTags,
  createCertificate,
  createGoogleMxRecords,
  createTxtRecord,
  Website,
  AssetsCachingLambda,
  SecurityHeadersLambda
} from "@topmonks/pulumi-aws";
// import * as arx from "./arx.monks.cloud/infra";
//import * as monksroom from "./room.monks.cloud/infra";

export = async () => {
  // Automatically inject tags.
  registerAutoTags({
    "user:Project": pulumi.getProject(),
    "user:Stack": pulumi.getStack()
  });

  createCertificate("www.cbx.cz");
  createCertificate("www.hookamonk.com");
  createCertificate("www.ingridapp.io");
  //createCertificate("monks.cloud");
  createCertificate("www.postcube.cz");
  createCertificate("www.postcube.com");
  createCertificate("www.zive.tv");

  createCertificate("www.hackercamp.cz");
  createGoogleMxRecords("hackercamp.cz");
  createTxtRecord(
    "hc-google-site-verification",
    "hackercamp.cz",
    "google-site-verification=eIaBVqhznPV-0AAEEbFJN82j3w063w_tW0-DUZWX5C0"
  );

  createCertificate("www.chytrybox.cz");
  createGoogleMxRecords("chytrybox.cz");
  createTxtRecord(
    "google-site-verification",
    "chytrybox.cz",
    "google-site-verification=KlEgvM1Rx9iOnZm53YPCzRsHkmltTuIEMV63L50gfus"
  );
  const assetsCachingLambda = AssetsCachingLambda.create(
    "topmonks-webs-caching"
  );

  const securityHeadersLambda = SecurityHeadersLambda.create(
    "topmonks-webs-security"
  );

  const assetsCachingLambdaArn = assetsCachingLambda.arn;
  const securityHeadersLambdaArn = securityHeadersLambda.arn;

  const websites = require("./websites.json");
  const sites: any = {};
  for (const domain in websites) {
    const website = Website.create(
      domain,
      Object.assign(
        {
          assetsCachingLambdaArn: assetsCachingLambda.arn,
          securityHeadersLambdaArn: securityHeadersLambda.arn
        },
        websites[domain]
      )
    );
    sites[domain] = {
      url: website.url,
      s3BucketUri: website.s3BucketUri,
      s3WebsiteUrl: website.s3WebsiteUrl,
      cloudFrontId: website.cloudFrontId
    };
  }

  const redirects = require("./redirects.json");
  const redirectSites: any = {};
  for (const domain in redirects) {
    const website = Website.createRedirect(domain, redirects[domain]);
    redirectSites[domain] = {
      url: website.url,
      s3BucketUri: website.s3BucketUri,
      cloudFrontId: website.cloudFrontId
    };
  }

  // const monksroomInfra = await monksroom.init();
  // await monksroomInfra.stop();
  // const monksroomApiHost = monksroomInfra.apiDistribution.url;

  // const arxDocumentsBucketUri = arx.documentsBucketUri;
  // const arxDocumentsBucketEndpoint = arx.documentsBucketEndpoint;
  // const arxDocumentsTable = arx.documentsTable;
  // const arxDocumentsApi = arx.documentsApi;
  return {
    sites,
    redirectSites,
    assetsCachingLambdaArn,
    securityHeadersLambdaArn
    // arxDocumentsBucketUri,
    // arxDocumentsBucketEndpoint,
    // arxDocumentsTable,
    // arxDocumentsApi
    // monksroomApiHost
  };
};
