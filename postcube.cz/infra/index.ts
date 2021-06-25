import * as aws from "@pulumi/aws";
import { URLSearchParams } from "url";

const contactFormLambda = new aws.lambda.CallbackFunction(
  "postcube-contact-form",
  {
    runtime: aws.lambda.Runtime.NodeJS14dX,
    async callback(event, context) {
      // @ts-ignore
      const data = new URLSearchParams(event.body);
      const message = `Ahoj,

      Máme tu zájemce z webu. ${data.get("name")} ${data.get("email")}.
      Měli bychom se mu ozvat. Slíbili jsme to.
      `;

      const ses = new aws.sdk.SES({ region: "eu-central-1" });

      const receivers = ["info@postcube.cz"];
      const sender = "no-reply@topmonks.com";
      // @ts-ignore
      ses
        .sendEmail({
          Destination: {
            ToAddresses: receivers
          },
          ReplyToAddresses: [data.get("email")],
          Message: {
            Body: {
              Text: {
                Data: message,
                Charset: "UTF-8"
              }
            },
            Subject: {
              Data: `Postcube.cz Contact Form: "${data.get("name")}"`,
              Charset: "UTF-8"
            }
          },
          Source: sender
        })
        .promise();

      return {
        statusCode: 202,
        body: "Accepted",
        headers: {
          "Access-Control-Allow-Headers":
            "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
          "Access-Control-Allow-Origin": "*"
        }
      };
    }
  }
);

export const contactFormArn = contactFormLambda.arn;
