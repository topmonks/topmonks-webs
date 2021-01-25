import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as lambdaBuilder from "../../lambda-builder";
import * as path from "path";

export async function init() {
  const builder = await lambdaBuilder.init();
  const buildAssets = (fileName: string) =>
    builder.buildCodeAsset(path.join(__dirname, "..", "lambdas", fileName));

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

  const api = new awsx.apigateway.API("monksroom-api", {
    stageName: "v1",
    restApiArgs: {
      description: "Monksroom API"
    },
    routes: [
      {
        path: "/now-playing",
        method: "GET",
        eventHandler: new aws.lambda.Function("", {
          publish: true,
          runtime: aws.lambda.Runtime.NodeJS12dX,
          role: defaultLambdaRole.arn,
          handler: "index.handler",
          code: buildAssets("now-playing/index.js")
        })
      }
    ]
  });
  return { api };
}
