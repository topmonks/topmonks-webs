const commander = require("commander");
const chalk = require("chalk");
const fs = require("fs");
const { pull } = require("lodash");
const path = require("path");
const rimraf = require("rimraf");
const YAML = require("yaml");
const { strOptions } = require("yaml/types");

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
function removePackageJsonScripts(name) {
  const packageJsonPath = path.resolve("./package.json");
  Logger.log();
  Logger.log("Removing package.json scripts");
  Logger.log();

  return fs.promises.readFile(packageJsonPath, "utf8").then(data => {
    const packageConfig = JSON.parse(data);

    delete packageConfig.scripts[`start:${name}`];
    delete packageConfig.scripts[`build:${name}`];

    return fs.promises.writeFile(
      packageJsonPath,
      JSON.stringify(packageConfig, null, 2),
      "utf8"
    );
  });
}

function removeSiteFromIaaC(name) {
  const filePath = path.resolve("./websites.json");
  Logger.log();
  Logger.log(`Removing website ${name} from websites.json manifest`);
  Logger.log();

  return fs.promises.readFile(filePath, "utf8").then(data => {
    const websites = JSON.parse(data);
    // remove website configuration
    delete websites[name];
    return fs.promises.writeFile(
      filePath,
      JSON.stringify(websites, null, 2),
      "utf8"
    );
  });
}

function removeSiteFromCI(name) {
  Logger.log();
  Logger.log(`Removing website ${name} from .circleci/config.yml build script`);
  Logger.log();
  const siteName = name.replace(/\./g, "-");
  const filePath = path.resolve("./.circleci/config.yml");
  return fs.promises.readFile(filePath, "utf-8").then(data => {
    const yamlData = YAML.parseDocument(data);
    const jobs = yamlData.getIn(["workflows", "build_and_deploy", "jobs"]);
    const siteJobs = jobs.items
      .filter(x => x.has("deploy_site") || x.has("test_site"))
      .filter(x => x.items[0].value.get("site_name") === siteName);
    pull(jobs.items, ...siteJobs);
    strOptions.fold.lineWidth = 0;
    return fs.promises.writeFile(filePath, yamlData.toString(), "utf-8");
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
    .then(() => removePackageJsonScripts(name))
    .then(() => removeSiteFromCI(name))
    .then(() => {
      console.log(`Site ${chalk.green(`${name}`)} succesfully removed`);
      console.log();
      console.log();
      console.log("-----------------------------------------------");
    })
    .catch(e => exitApp(e));
}

remove(SITE_DIR_NAME);
