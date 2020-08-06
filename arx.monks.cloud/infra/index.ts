import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const docsTable = new aws.dynamodb.Table("arx-documents", {
  attributes: [{ name: "id", type: "S" }],
  hashKey: "id",
  readCapacity: 1,
  writeCapacity: 1
});

const docsBucket = new aws.s3.Bucket("arx-documents", {
  acl: "public-read",
  forceDestroy: true,
  website: {
    indexDocument: "index.html",
    errorDocument: "404.html"
  }
});

const docsBucketPolicy = new aws.s3.BucketPolicy("arx-documents", {
  bucket: docsBucket.bucket,
  policy: docsBucket.bucket.apply(publicReadPolicyForBucket)
});

function publicReadPolicyForBucket(bucketName: string) {
  return JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [
          `arn:aws:s3:::${bucketName}/*` // policy refers to bucket name explicitly
        ]
      }
    ]
  });
}

const docsApi = new awsx.apigateway.API("arx-documents", {
  routes: [
    {
      path: "/create",
      method: "PUT",
      eventHandler: async request => {
        return {
          statusCode: 201,
          body: ""
        };
      }
    }
  ]
});

export const documentsTable = docsTable.arn;
export const documentsBucketUri = docsBucket.bucket.apply(x => `s3://${x}`);
export const documentsBucketEndpoint = docsBucket.websiteEndpoint.apply(
  x => `https://${x}`
);
export const documentsApi = docsApi.url;
