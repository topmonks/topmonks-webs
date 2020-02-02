const pathConfig = require("./path-config.json");
const marked = require("marked");
const markdownToJSON = require("gulp-markdown-to-json");
const merge = require("gulp-merge-json");
const path = require("path");
const projectPath = require("@topmonks/blendid/gulpfile.js/lib/projectPath");
const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");

module.exports = createSharedTaskConfig(__dirname, {
  images: true,
  javascripts: false,
  fonts: true,
  static: true,
  svgSprite: true,
  stylesheets: true,
  workboxBuild: false,
  cloudinary: {
    manifest: "posters.json"
  },

  html: {
    collections: ["events", "posters"]
  },

  browserSync: {
    server: {
      baseDir: pathConfig.dest
    }
  },

  additionalTasks: {
    initialize({ task, src, dest, series, watch }, PATH_CONFIG, TASK_CONFIG) {
      const dataPath = projectPath(PATH_CONFIG.src, PATH_CONFIG.data.src);
      const eventsSrc = projectPath(dataPath, "events/**/*.md");
      const generateEventsJson = () =>
        src(eventsSrc)
          .pipe(markdownToJSON(marked))
          .pipe(
            merge({
              fileName: "events.json",
              edit: json => ({ [json.sessionNumber]: json })
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
});
