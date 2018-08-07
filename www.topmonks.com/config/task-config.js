const globImporter = require("node-sass-glob-importer");
const marked = require("marked");
const markdownToJSON = require("gulp-markdown-to-json");
const pathConfig = require("./path-config.json");
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
    dataFile: "../data/team.json"
  },

  browserSync: {
    server: {
      // should match `dest` in
      // path-config.json
      baseDir: pathConfig.dest
    }
  },

  production: {
    rev: true
  },

  additionalTasks: {
    initialize: function(gulp) {
      gulp.task("prepareTeamData", () => {
        let itr = 0;
        gulp
          .src("../../www.topmonks.com/src/data/team/**/*.md")
          .pipe(markdownToJSON(marked))
          .pipe(
            merge({
              fileName: "team.json",
              edit: function(parsedJson) {
                let editedJson = { users: [] };
                editedJson["users"][itr++] = parsedJson;
                return editedJson;
              }
            })
          )
          .pipe(gulp.dest("../../www.topmonks.com/src/data/"));
      });
    },
    development: {
      prebuild: ["prepareTeamData"]
    }
  }
};
