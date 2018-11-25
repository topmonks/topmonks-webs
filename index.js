"use strict";

const pulumi = require("@pulumi/pulumi");
const topmonks = require("./.scripts/pulumi-resources/website");
const websites = require("./websites.json");

Object.keys(websites).map(
  async domain => await topmonks.WebSite.create(domain, websites[domain])
);
