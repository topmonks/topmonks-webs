const commander = require("commander");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const PATH = path.resolve("create-site");

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
let APP_DIR_NAME = "";
const program = new commander.Command("createApp")
  .version(VERSION)
  .arguments("<project-directory>")
  .action(name => {
    APP_DIR_NAME = name;
  })
  .option("-t, --title [title]", "Set App Title")
  .option("-v, --verbose", "Verbose")
  .parse(process.argv);

const APP_TITLE = program.title || "Topmonks";
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
    value: APP_DIR_NAME
  },
  {
    regex: /%APP_TITLE%/g,
    value: APP_TITLE
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
if (typeof APP_DIR_NAME === "undefined" || !APP_DIR_NAME) {
  console.error("Please specify the project directory:");
  console.log(
    `${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}`
  );
  console.log();
  console.log("For example:");
  console.log(
    `${chalk.cyan(program.name())} ${chalk.green("new-app.topmonks.com")}`
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
    Logger.log("Creating new directory:", APP_DIR_NAME);
    fs.mkdirSync(root);

    generatedDirectories.forEach(dirName => {
      Logger.log("Creating new directory:", `${APP_DIR_NAME}/${dirName}`);
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
        Logger.log("Generating file:", `${APP_DIR_NAME}/${file}`);

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
      `start:${APP_DIR_NAME}`
    ] = `BLENDID_CONFIG_PATH=./${APP_DIR_NAME}/config/ blendid`;
    packageConfig.scripts[
      `build:${APP_DIR_NAME}`
    ] = `BLENDID_CONFIG_PATH=./${APP_DIR_NAME}/config/ blendid -- build`;

    const packageConfigStrigified = JSON.stringify(packageConfig, null, 2);

    return writeFile(packageJsonPath, packageConfigStrigified, "utf8");
  });
}

function create(name) {
  const root = path.resolve(name);

  createDirectories(root)
    .then(() => generateFiles(root))
    .then(() => createPackageJsonScripts())
    .then(() => {
      console.log("Successfully created");
      console.log(
        `Start your app with command: ${chalk.green(
          `yarn start:${APP_DIR_NAME}`
        )}`
      );
      console.log();
      console.log();
      console.log("-----------------------------------------------");
    })
    .catch(e => exitApp(e));
}

create(APP_DIR_NAME);
