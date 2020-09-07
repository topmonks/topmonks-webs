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

  generate: {
    json: [
      {
        collection: "news",
        mergeOptions: {
          startObj: [],
          concatArrays: true,
          mergeArrays: false,
          edit: x => [{ perex: x.body.split("\n").shift(), ...x }]
        }
      },
      {
        collection: "investments",
        mergeOptions: {
          startObj: [],
          concatArrays: true,
          mergeArrays: false
        }
      }
    ],
    html: [
      {
        collection: "news",
        template: "shared/news-entry.njk",
        route: x => `news/${x.date.replace("T00:00:00.000Z", "")}/index.html`
      }
    ],
    redirects: [
      {
        collection: "news",
        host: "https://www.arxequity.com",
        route: x => [
          x.originalUrl.replace("https://www.arxequity.com/", ""),
          `/news/${x.date.replace("T00:00:00.000Z", "")}/`
        ]
      }
    ]
  },

  html: {
    collections: ["images", "investments", "news", "team"]
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
