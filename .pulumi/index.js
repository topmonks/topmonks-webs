"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
var pulumi = require("@pulumi/pulumi");
var topmonks = require("./topmonks-web-page");

const topmonksComCertificate = "arn:aws:acm:us-east-1:661884430919:certificate/28904d8f-c561-4a5b-a96f-1f5b764f8528";
const webs = ["test42-pulumi.topmonks.com", "life-pulumi.topmonks.com"]

for (const webName of webs) {
  var resource = new topmonks.TopmonksWebPage(webName, topmonksComCertificate);
}

const topmonksCzCertificate = "arn:aws:acm:us-east-1:661884430919:certificate/bf49d706-7548-4106-b757-378fee2a7e8b";
const czWebs = ["test42-pulumi.topmonks.cz", "life-pulumi.topmonks.cz"]

for (const webName of czWebs) {
  var resource = new topmonks.TopmonksWebPage(webName, topmonksCzCertificate);
}
