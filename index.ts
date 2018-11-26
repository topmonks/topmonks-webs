import * as pulumi from "@pulumi/pulumi";
import * as topmonks from "./.scripts/pulumi-resources/website";

const websites = require( "./websites.json");
Object.keys(websites).map(
  async domain => await topmonks.WebSite.create(domain, websites[domain])
);
