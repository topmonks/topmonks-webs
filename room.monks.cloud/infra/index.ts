import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const api = new awsx.apigateway.API("monksroom-api", {
  routes: [
    {
      path: "/now-playing",
      method: "GET",
      eventHandler: async request => {
        return {
          statusCode: 200,
          body: "Nutin"
        };
      }
    }
  ]
});

export const apiHost = api.url;
