const path = require("path");
const fs = require("fs");
const ApiClient = require("@lhci/utils/src/api-client.js");

async function generateLighthouseToken(name) {
  const config = path.resolve("./lighthouserc.json");
  const file = await fs.promises.readFile(config, "utf8");
  const { ci } = JSON.parse(file);
  const api = new ApiClient({
    rootURL: ci.upload.serverBaseUrl,
    extraHeaders: ci.upload.extraHeaders
  });
  const project = await api.createProject({
    name,
    externalUrl: "https://github.com/topmonks/topmonks-webs",
    slug: ""
  });
  return project.token;
}

async function addLhciTokens() {
  const filePath = path.resolve("./websites.json");
  const data = await fs.promises.readFile(filePath, "utf8");
  const websites = JSON.parse(data);

  for (const name in websites) {
    console.log("generating token for:", name);
    if (websites[name].lhci?.upload?.token) continue;
    websites[name] = Object.assign({}, websites[name], {
      lhci: { upload: { token: await generateLighthouseToken(name) } }
    });
  }
  return fs.promises.writeFile(
    filePath,
    JSON.stringify(websites, null, 2),
    "utf8"
  );
}

addLhciTokens().catch(ex => console.error(ex));
