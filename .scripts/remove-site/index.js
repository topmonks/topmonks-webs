const commander = require("commander");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

const Promise = require("bluebird");
const writeFile = Promise.promisify(fs.writeFile);
const readFile = Promise.promisify(fs.readFile);

/**re
 * CONSTS
 */

const VERSION = "0.0.1";

/************************************************************************
 * Commander
 */
let SITE_DIR_NAME = "";
const program = new commander.Command("removeSite")
  .version(VERSION)
  .arguments("<project-directory>")
  .action(name => {
    SITE_DIR_NAME = name;
  })
  .option("-v, --verbose", "Verbose")
  .parse(process.argv);

const IS_VERBOSE = !!program.verbose;

/*
 * Commander End
 ************************************************************************/


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
    `${chalk.cyan(program.name())} ${chalk.green("existing-site.topmonks.com")}`
  );
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  exitApp();
}

/**
 * @return {Promise}
 */
function removePackageJsonScripts() {
  const packageJsonPath = path.resolve("./package.json");
  Logger.log();
  Logger.log("Removing package.json scripts");
  Logger.log();

  return readFile(packageJsonPath, "utf8").then(data => {
    const packageConfig = JSON.parse(data);

    delete packageConfig.scripts[
      `start:${SITE_DIR_NAME}`
    ];
    delete packageConfig.scripts[
      `build:${SITE_DIR_NAME}`
    ];
    delete packageConfig.scripts[
      `test:broken-links:${SITE_DIR_NAME}`
    ];

    const packageConfigStrigified = JSON.stringify(packageConfig, null, 2);

    return writeFile(packageJsonPath, packageConfigStrigified, "utf8");
  });
}

function removeSiteFromIaaC(name) {
  const filePath = path.resolve("./websites.json");
  Logger.log();
  Logger.log(`Removing website ${name} from websites.json manifest`);
  Logger.log();

  return readFile(filePath, "utf8").then(data => {
    const websites = JSON.parse(data);
    // remove website configuration
    delete websites[name];
    return writeFile(filePath, JSON.stringify(websites, null, 2), "utf8");
  });
}

function deleteSiteDirectory(root) {

  Logger.log();
  Logger.log(`Removing website ${root} directory`);
  Logger.log();

  rimraf.sync(root);
}

function remove(name) {
  const root = path.resolve(name);

    deleteSiteDirectory(root);
    removeSiteFromIaaC(name)
    .then(() => removePackageJsonScripts())
    .then(() => {
      console.log(
        `Site ${chalk.green(
          `${SITE_DIR_NAME}`
        )} succesfully removed`
      );
      console.log();
      console.log();
      console.log("-----------------------------------------------");
    })
    .catch(e => exitApp(e));
}

remove(SITE_DIR_NAME);
