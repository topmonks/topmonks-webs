import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as lambdaBuilder from "../../lambda-builder";
import * as path from "path";
import { CustomDomainDistribution } from "@topmonks/pulumi-aws/apigateway";

const codeAsset = (fileName: string) =>
  lambdaBuilder.buildCodeAsset(path.join(__dirname, "..", "lambdas", fileName));

const defaultLambdaRole = new aws.iam.Role("monksroom-default-lambda-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(
    aws.iam.Principals.LambdaPrincipal
  )
});

new aws.iam.RolePolicyAttachment(
  "monksroom-lambda-basic-execution-attachment",
  {
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
    role: defaultLambdaRole
  }
);

export const api = new awsx.apigateway.API("monksroom-api", {
  stageName: "v1",
  restApiArgs: {
    description: "Monksroom API"
  },
  routes: [
    {
      path: "/now-playing",
      method: "GET",
      eventHandler: new aws.lambda.Function("monksroom-now-playing", {
        publish: true,
        runtime: aws.lambda.Runtime.NodeJS14dX,
        role: defaultLambdaRole.arn,
        handler: "index.handler",
        code: codeAsset("now-playing/index.js")
      })
    },
    {
      path: "/beatport",
      method: "GET",
      eventHandler: new aws.lambda.Function("monksroom-beatport", {
        publish: true,
        runtime: aws.lambda.Runtime.NodeJS14dX,
        role: defaultLambdaRole.arn,
        handler: "index.handler",
        code: codeAsset("beatport/index.js"),
        timeout: 20
      })
    }
  ]
});

export const apiDistribution = new CustomDomainDistribution(
  "monksroom-api",
  {
    gateway: api,
    domainName: "room-api.monks.cloud",
    basePath: "v1"
  },
  { dependsOn: [api] }
);
