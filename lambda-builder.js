import * as pulumi from "@pulumi/pulumi";
import { build } from "esbuild";

export async function init() {
  const buildTasks = [];

  return {
    build(entrypoint, minify) {
      const promise = build({
        bundle: true,
        minify,
        charset: "utf8",
        platform: "node",
        target: "node14",
        mainFields: ["module", "main"],
        external: ["aws-sdk"],
        entryPoints: [entrypoint],
        write: false
      }).then(result => result?.outputFiles?.[0].text ?? "");
      buildTasks.push(promise);
      return promise;
    },
    buildCodeAsset(entrypoint, minify = false) {
      return new pulumi.asset.AssetArchive({
        "index.js": new pulumi.asset.StringAsset(this.build(entrypoint, minify))
      });
    },
    stop() {
      return Promise.allSettled(buildTasks);
    }
  };
}
