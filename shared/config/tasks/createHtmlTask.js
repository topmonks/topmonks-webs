/**
 * For research
 */

const browserSync = require("browser-sync");
const data = require("gulp-data");
const gulp = require("gulp");
const gulpif = require("gulp-if");
const handleErrors = require("blendid/gulpfile.js/lib/handleErrors");
const projectPath = require("blendid/gulpfile.js/lib/projectPath");
const htmlmin = require("gulp-htmlmin");
const nunjucksRender = require("gulp-nunjucks-render");
const fs = require("fs");

const getSrcPath = (PATH_CONFIG, TASK_CONFIG, src) =>
  projectPath(
    PATH_CONFIG.src,
    src,
    "**/*.{" + TASK_CONFIG.html.extensions + "}"
  );

const getExcludedSrcPath = (PATH_CONFIG, TASK_CONFIG, src) =>
  projectPath(
    PATH_CONFIG.src,
    src,
    "**/{" + TASK_CONFIG.html.excludeFolders.join(",") + "}/**"
  );

const getSrcPaths = (src, PATH_CONFIG, TASK_CONFIG, isExcluded) => {
  const getSrc = isExcluded ? getExcludedSrcPath : getSrcPath;

  if (Array.isArray(src)) {
    return src.map(itemSrc => getSrc(PATH_CONFIG, TASK_CONFIG, itemSrc));
  }

  return [getSrc(PATH_CONFIG, TASK_CONFIG, PATH_CONFIG.html.src)];
};

/**
 * Don't use injected gulp from blendid, it's broken, dunno why
 */
module.exports = (__GULP__, PATH_CONFIG, TASK_CONFIG) => () => {
  const src = [PATH_CONFIG.html.src, PATH_CONFIG.html.shared];

  const paths = {
    src: [
      ...getSrcPaths(src, PATH_CONFIG, TASK_CONFIG),
      ...getSrcPaths(src, PATH_CONFIG, TASK_CONFIG, true)
    ],
    dest: projectPath(PATH_CONFIG.dest, PATH_CONFIG.html.dest)
  };

  const dataFunction =
    TASK_CONFIG.html.dataFunction ||
    function (file) {
      const dataPath = projectPath(
        PATH_CONFIG.src,
        PATH_CONFIG.html.src,
        TASK_CONFIG.html.dataFile || file
      );
      return JSON.parse(fs.readFileSync(dataPath, "utf8"));
    };

  const nunjucksRenderPath = [
    projectPath(PATH_CONFIG.src, PATH_CONFIG.html.src)
  ];

  TASK_CONFIG.html.nunjucksRender.path =
    TASK_CONFIG.html.nunjucksRender.path || nunjucksRenderPath;

  console.log("----");
  console.log(paths.src);
  console.log("----");
  console.log(TASK_CONFIG.html.nunjucksRender.path);

  return gulp
    .src(paths.src)
    .pipe(data(dataFunction))
    .on("error", handleErrors)
    .pipe(nunjucksRender(TASK_CONFIG.html.nunjucksRender))
    .on("error", handleErrors)
    .pipe(gulpif(global.production, htmlmin(TASK_CONFIG.html.htmlmin)))
    .pipe(gulp.dest(paths.dest))
    .pipe(browserSync.stream());
};
