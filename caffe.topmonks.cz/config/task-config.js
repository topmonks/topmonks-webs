const globImporter = require("node-sass-glob-importer");
const pathConfig = require("./path-config.json");
const marked = require("marked");
const markdownToJSON = require("gulp-markdown-to-json");
const merge = require("gulp-merge-json");
const watch = require("gulp-watch");
const path = require("path");

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
    nunjucksRender: {
      manageEnv: function(env) {
        env.addFilter("split", function(str, seperator) {
          return str.split(seperator);
        });
      }
    },
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
      const dataPath = `${path.resolve(__dirname, "../src/data")}`;
      const eventsSrc = `${dataPath}/events/**/*.md`;
      const generateEventsJson = () => {
        gulp
          .src(eventsSrc)
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
          .pipe(gulp.dest(dataPath));
      };
      /**
       * Task generate team data
       */
      gulp.task("events-data", generateEventsJson);
      /**
       * Watch src/data/team/* changes
       */
      gulp.task("events-data:watch", () => {
        watch(eventsSrc, generateEventsJson);
      });

      /**
       * Watch src/data/events.json changes
       * We use the same gulp task used for html (we need to generate new html after new team.json is created)
       */
      gulp.task("events-json:watch", () => {
        watch(
          path.resolve(dataPath, "events.json"),
          require("blendid/gulpfile.js/tasks/html") // the code is so shit we need to use require
        );
      });
    },
    development: {
      prebuild: ["events-data"],
      postbuild: ["events-data:watch", "events-json:watch"]
    },
    production: {
      prebuild: ["events-data"]
    }
  },

  production: {
    rev: true
  }
};
