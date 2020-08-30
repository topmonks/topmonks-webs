const marked = require("marked");
const path = require("path");
const stream = require("stream");
const utils = require("util");
const markdownToJSON = require("gulp-markdown-to-json");
const merge = require("gulp-merge-json");
const projectPath = require("@topmonks/blendid/gulpfile.js/lib/projectPath");
const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");
const pathConfig = require("./path-config.json");

const pipeline = utils.promisify(stream.pipeline);

const config = createSharedTaskConfig(__dirname, {
  images: true,
  cloudinary: true,
  fonts: true,
  static: true,
  svgSprite: true,
  javascripts: false,
  stylesheets: true,
  workboxBuild: false,

  html: {
    collections: ["images", "investments", "news", "team"]
  },

  news: {
    extensions: ["md"]
  },

  additionalTasks: {
    initialize({ task, src, dest, series, watch }, PATH_CONFIG, TASK_CONFIG) {
      const dataPath = projectPath(PATH_CONFIG.src, PATH_CONFIG.data.src);
      const newsSrc = projectPath(dataPath, "news/**/*.md");
      const generateNewsJson = () =>
        pipeline([
          src(newsSrc),
          markdownToJSON(marked),
          merge({
            fileName: "news.json",
            startObj: [],
            concatArrays: true,
            mergeArrays: false,
            edit: x => [{ perex: x.body.split("\n").shift(), ...x }]
          }),
          dest(dataPath)
        ]);

      task("news-data", generateNewsJson);
      task("news:watch", done => {
        watch(newsSrc, generateNewsJson);
        watch(path.resolve(dataPath, "news.json"), series("html"));
        done();
      });
    },
    generateJson: ["news"],
    generateHtml: ["news"],
    development: {
      prebuild: ["news-data"],
      postbuild: ["news:watch"]
    },
    production: {
      prebuild: ["news-data"]
    }
  },

  browserSync: {
    server: {
      baseDir: pathConfig.dest
    }
  },

  production: {
    rev: true
  }
});

module.exports = config;
