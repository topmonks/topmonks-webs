const commander = require("commander");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const PATH = path.resolve(".scripts/create-site");

const Promise = require("bluebird");
const writeFile = Promise.promisify(fs.writeFile);
const readFile = Promise.promisify(fs.readFile);

/**
 * CONSTS
 */

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
  "src/stylesheets/xixoio.scss"
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
function createDirectories(root) {
  if (!fs.existsSync(root)) {
    Logger.log("Creating new directory:", SITE_DIR_NAME);
    fs.mkdirSync(root);

    generatedDirectories.forEach(dirName => {
      Logger.log("Creating new directory:", `${SITE_DIR_NAME}/${dirName}`);
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
function generateFiles(root) {
  Logger.log();

  return Promise.all(
    generatedFiles.map(file =>
      readFile(`${PATH}/${file}`, "utf8").then(data => {
        Logger.log("Generating file:", `${SITE_DIR_NAME}/${file}`);

        const result = replaceTemplateKey(data, replaceKeys);

        return writeFile(`${root}/${file}`, result, "utf8");
      })
    )
  );
}

/**
 * @return {Promise}
 */
function createPackageJsonScripts() {
  const packageJsonPath = path.resolve("./package.json");
  Logger.log();
  Logger.log("Creating package.json scripts");
  Logger.log();

  return readFile(packageJsonPath, "utf8").then(data => {
    const packageConfig = JSON.parse(data);

    packageConfig.scripts[
      `start:${SITE_DIR_NAME}`
    ] = `BLENDID_CONFIG_PATH=./${SITE_DIR_NAME}/config/ blendid`;
    packageConfig.scripts[
      `build:${SITE_DIR_NAME}`
    ] = `BLENDID_CONFIG_PATH=./${SITE_DIR_NAME}/config/ blendid -- build`;
    packageConfig.scripts[
      `test:broken-links:${SITE_DIR_NAME}`
    ] = `blcl ./public/${SITE_DIR_NAME} -ro --exclude linkedin.com --exclude maps.googleapis.com --exclude insight.topmonks.com/avatar/ --exclude caffe.topmonks.cz --exclude blog.topmonks.com`;

    const packageConfigStrigified = JSON.stringify(packageConfig, null, 2);

    return writeFile(packageJsonPath, packageConfigStrigified, "utf8");
  });
}

function addSiteToIaaC(name) {
  const filePath = path.resolve("./websites.json");
  Logger.log();
  Logger.log("Adding website to websites.json manifest");
  Logger.log();

  return readFile(filePath, "utf8").then(data => {
    const websites = JSON.parse(data);
    // add default website configuration
    websites[name] = {};
    return writeFile(filePath, JSON.stringify(websites, null, 2), "utf8");
  });
}

function create(name) {
  const root = path.resolve(name);

  createDirectories(root)
    .then(() => generateFiles(root))
    .then(() => createPackageJsonScripts())
    .then(() => addSiteToIaaC(name))
    .then(() => {
      console.log("Successfully created");
      console.log(
        `Start your site with command: ${chalk.green(
          `yarn start:${SITE_DIR_NAME}`
        )}`
      );
      console.log();
      console.log();
      console.log("-----------------------------------------------");
    })
    .catch(e => exitApp(e));
}

create(SITE_DIR_NAME);
