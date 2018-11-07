const globImporter = require("node-sass-glob-importer");
const pathConfig = require("./path-config.json");
const marked = require("marked");
const markdownToJSON = require("gulp-markdown-to-json");
const merge = require("gulp-merge-json");
const watch = require("gulp-watch");
const path = require("path");
const gulp = require("gulp");

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
    dataFile: "../data/team.json",
    src: "html",
    excludeFolders: ["layouts", "shared", "macros"]
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
    initialize: function(gulpInjected, PATH_CONFIG, TASK_CONFIG) {
      const rootPath = `${path.resolve(__dirname, "../src/data")}`;
      const teamSrc = `${rootPath}/team/**/*.md`;

      const generateTeamDataTask = () => {
        return gulp
          .src(teamSrc)
          .pipe(markdownToJSON(marked))
          .pipe(
            merge({
              fileName: "team.json",
              edit: function(parsedJson) {
                let editedJson = { members: {} };
                editedJson.members[parsedJson.id] = parsedJson;
                return editedJson;
              }
            })
          )
          .pipe(gulp.dest(rootPath)); // it doesn't work with injected gulp, idkw
      };

      /**
       * Task generate team data
       */
      gulp.task("team-data", generateTeamDataTask);

      /**
       * Watch src/data/team/* changes
       */
      gulp.task("team-data:watch", () => {
        watch(teamSrc, generateTeamDataTask);
      });

      /**
       * Watch src/data/team.json changes
       * We use the same gulp task used for html (we need to generate new html after new team.json is created)
       */
      gulp.task("team-json:watch", () => {
        watch(
          path.resolve(rootPath, "team.json"),
          require("blendid/gulpfile.js/tasks/html") // the code is so shit we need to use require
        );
      });
    },
    development: {
      prebuild: ["team-data"],
      postbuild: ["team-data:watch", "team-json:watch"]
    },
    production: {
      prebuild: ["team-data"]
    }
  }
};
