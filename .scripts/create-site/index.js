require("dotenv").config();
const commander = require("commander");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const { strOptions } = require("yaml/types");
const ApiClient = require("@lhci/utils/src/api-client.js");

const templateDir = path.resolve(".scripts/create-site");
const VERSION = "0.0.1";

/************************************************************************
 * Commander
 */
let SITE_DIR_NAME = "";
const program = new commander.Command("createSite")
  .version(VERSION)
  .arguments("<project-directory>")
  .action(name => {
    SITE_DIR_NAME = name;
  })
  .option("-t, --title [title]", "Set Site Title")
  .option("-v, --verbose", "Verbose")
  .parse(process.argv);

const SITE_TITLE = program.title || "TopMonks";
const IS_VERBOSE = !!program.verbose;

/*
 * Commander End
 ************************************************************************/

/**
 * Files and directories to create
 */

const generatedDirectories = [
  "config",
  "src",
  "src/data",
  "src/html",
  "src/images",
  "src/javascripts",
  "src/static",
  "src/stylesheets"
];

const generatedFiles = [
  "config/task-config.js",
  "config/path-config.json",
  "src/data/global.json",
  "src/html/index.html",
  "src/javascripts/index.js",
  "src/stylesheets/main.scss"
];

/**
 * Replacing template keys
 *************************************
 * Array of pair <regex, value>
 */
const replaceKeys = [
  {
    regex: /%APP_DIR_NAME%/g,
    value: SITE_DIR_NAME
  },
  {
    regex: /%APP_TITLE%/g,
    value: SITE_TITLE
  }
];

/**
 * Find all keys (regex) in the files and replace them with a given value
 *
 * @param {String} data
 * @param {Array} regexValueArray
 */
function replaceTemplateKey(data, regexValueArray) {
  let res = data;
  regexValueArray.forEach(item => {
    res = res.replace(item.regex, item.value);
  });
  return res;
}

/**
 * Verbose logger
 */

const Logger = {
  log: (...params) => {
    if (IS_VERBOSE) {
      console.log(...params);
    }
  }
};

/**
 * Start consoling out
 */

console.log("-----------------------------------------------");
console.log();
console.log();

const exitApp = message => {
  console.error(`⚠ ${chalk.red(message)}`);
  console.log();
  console.log();
  console.log("-----------------------------------------------");
  process.exit(1);
};

/**
 * Check if we received directory name
 */
if (typeof SITE_DIR_NAME === "undefined" || !SITE_DIR_NAME) {
  console.error("Please specify the project directory:");
  console.log(
    `${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}`
  );
  console.log();
  console.log("For example:");
  console.log(
    `${chalk.cyan(program.name())} ${chalk.green("new-site.topmonks.com")}`
  );
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  exitApp();
}

/**
 * @param {String} root
 * @returns {Promise}
 */
function createDirectories(root, name) {
  if (!fs.existsSync(root)) {
    Logger.log("Creating new directory:", name);
    fs.mkdirSync(root);

    generatedDirectories.forEach(dirName => {
      Logger.log("Creating new directory:", `${name}/${dirName}`);
      fs.mkdirSync(`${root}/${dirName}`);
    });

    return Promise.resolve();
  } else {
    return Promise.reject("Directory already exists");
  }
}

/**
 * @return {Promise}
 */
function generateFiles(root, name) {
  Logger.log();

  return Promise.all(
    generatedFiles.map(file =>
      fs.promises.readFile(`${templateDir}/${file}`, "utf8").then(data => {
        Logger.log("Generating file:", `${name}/${file}`);
        const result = replaceTemplateKey(data, replaceKeys);
        return fs.promises.writeFile(`${root}/${file}`, result, "utf8");
      })
    )
  );
}

/**
 * @return {Promise}
 */
async function createPackageJsonScripts(name) {
  const packageJsonPath = path.resolve("./package.json");
  Logger.log();
  Logger.log("Creating package.json scripts");
  Logger.log();

  const data = await fs.promises.readFile(packageJsonPath, "utf8");
  const packageConfig = JSON.parse(data);

  packageConfig.scripts[
    `start:${name}`
  ] = `BLENDID_CONFIG_PATH=./${name}/config/ dotenv blendid`;
  packageConfig.scripts[
    `build:${name}`
  ] = `BLENDID_CONFIG_PATH=./${name}/config/ dotenv blendid -- build`;

  return fs.promises.writeFile(
    packageJsonPath,
    JSON.stringify(packageConfig, null, 2),
    "utf8"
  );
}

async function generateLighthouseToken(name) {
  const config = path.resolve("./lighthouserc.json");
  const file = await fs.promises.readFile(config, "utf8");
  const { ci } = JSON.parse(file);
  const buffer = Buffer.from(process.env["LHCI_BASIC_AUTH"], "base64");
  const [username, password] = buffer.toString("ascii").split(":");
  const basicAuth = { username, password };
  const api = new ApiClient({ rootURL: ci.upload.serverBaseUrl, basicAuth });
  const project = await api.createProject({
    name,
    externalUrl: "https://github.com/topmonks/topmonks-webs",
    slug: ""
  });
  return project.token;
}

async function addSiteToIaaC(name) {
  const filePath = path.resolve("./websites.json");
  Logger.log();
  Logger.log(`Adding website ${name} to websites.json manifest`);
  Logger.log();

  const data = await fs.promises.readFile(filePath, "utf8");
  const websites = JSON.parse(data);
  // add default website configuration
  if (process.env["CI"]) {
    websites[name] = {};
  } else {
    websites[name] = {
      lhci: {
        upload: {
          token: await generateLighthouseToken(name)
        }
      }
    };
  }
  return fs.promises.writeFile(
    filePath,
    JSON.stringify(websites, null, 2),
    "utf8"
  );
}

function addSiteToCI(name) {
  Logger.log();
  Logger.log(`Adding website ${name} to .circleci/config.yml build script`);
  Logger.log();
  const siteName = name.replace(/\./g, "-");
  const testJob = {
    test_site: {
      name: `test-${siteName}`,
      site_name: name,
      context: "org-global",
      requires: ["build"]
    }
  };
  const deployJob = {
    deploy_site: {
      name: `deploy-${siteName}`,
      site_name: name,
      context: "org-global",
      requires: ["provision", `test-${siteName}`],
      filters: {
        branches: { only: "trunk" }
      }
    }
  };
  const filePath = path.resolve("./.circleci/config.yml");
  return fs.promises.readFile(filePath, "utf-8").then(data => {
    const yamlData = YAML.parseDocument(data);
    yamlData.addIn(["workflows", "build_and_deploy", "jobs"], testJob);
    yamlData.addIn(["workflows", "build_and_deploy", "jobs"], deployJob);
    strOptions.fold.lineWidth = 0;
    return fs.promises.writeFile(filePath, yamlData.toString(), "utf-8");
  });
}

function create(name) {
  const root = path.resolve(name);

  createDirectories(root)
    .then(() => generateFiles(root, name))
    .then(() => createPackageJsonScripts(name))
    .then(() => addSiteToIaaC(name))
    .then(() => addSiteToCI(name))
    .then(() => {
      console.log("Successfully created");
      console.log(
        `Start your site with command: ${chalk.green(`yarn start:${name}`)}`
      );
      console.log();
      console.log();
      console.log("-----------------------------------------------");
    })
    .catch(e => exitApp(e));
}

create(SITE_DIR_NAME);
