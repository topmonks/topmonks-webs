const globImporter = require("node-sass-glob-importer");
const pathConfig = require("./path-config.json");
const marked = require("marked");
const markdownToJSON = require("gulp-markdown-to-json");
const merge = require("gulp-merge-json");

module.exports = {
  images: true,
  fonts: true,
  static: true,
  svgSprite: true,
  ghPages: false,

  javascripts: {
    entry: {
      app: ["./index.js"]
    }
  },

  stylesheets: {
    sass: {
      importer: globImporter()
    }
  },

  html: {
    dataFile: "../data/events.json"
  },

  browserSync: {
    server: {
      // should match `dest` in
      // path-config.json
      baseDir: pathConfig.dest
    }
  },

  additionalTasks: {
    initialize: function(gulp) {
      gulp.task("prepareTeamData", () => {
        gulp
          .src("../../caffe.topmonks.cz/src/data/events/**/*.md")
          .pipe(markdownToJSON(marked))
          .pipe(
            merge({
              fileName: "events.json",
              edit: function(parsedJson) {
                let editedJson = { events: {} };
                editedJson.events[parsedJson.sessionNumber] = parsedJson;
                return editedJson;
              }
            })
          )
          .pipe(gulp.dest("../../caffe.topmonks.cz/src/data/"));
      });
    },
    development: {
      prebuild: ["prepareTeamData"]
    }
  },

  production: {
    rev: true
  }
};
