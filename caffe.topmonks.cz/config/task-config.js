const globImporter = require("node-sass-glob-importer");
const pathConfig = require("./path-config.json");
const marked = require("marked");
const markdownToJSON = require("gulp-markdown-to-json");
const merge = require("gulp-merge-json");
const path = require("path");

module.exports = {
  images: true,
  fonts: true,
  static: true,
  svgSprite: true,

  javascripts: {
    entry: {
      app: ["./index.js"]
    }
  },

  stylesheets: {
    sass: {
      importer: globImporter()
    },
    autoprefixer: { browsers: ["> 5%", "last 4 versions", "IE 8"] }
  },

  html: {
    nunjucksRender: {
      manageEnv(env) {
        env.addFilter("split", (str, seperator) => str.split(seperator));
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
    initialize({ task, src, dest, series, watch }, PATH_CONFIG, TASK_CONFIG) {
      const dataPath = `${path.resolve(__dirname, "../src/data")}`;
      const eventsSrc = `${dataPath}/events/**/*.md`;
      const generateEventsJson = () =>
        src(eventsSrc)
          .pipe(markdownToJSON(marked))
          .pipe(
            merge({
              fileName: "events.json",
              edit: json => ({ events: { [json.sessionNumber]: json } })
            })
          )
          .pipe(dest(dataPath));

      task("events-data", generateEventsJson);
      task("events:watch", cb => {
        watch(eventsSrc, generateEventsJson);
        watch(path.resolve(dataPath, "events.json"), series("html"));
        cb();
      });
    },
    development: {
      prebuild: ["events-data"],
      postbuild: ["events:watch"]
    },
    production: {
      prebuild: ["events-data"]
    }
  },

  production: {
    rev: true
  }
};
