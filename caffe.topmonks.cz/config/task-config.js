const fs = require("fs").promises;
const globImporter = require("node-sass-glob-importer");
const pathConfig = require("./path-config.json");
const marked = require("marked");
const cloudinaryUpload = require("gulp-cloudinary-upload");
const markdownToJSON = require("gulp-markdown-to-json");
const merge = require("gulp-merge-json");
const path = require("path");
const projectPath = require("@topmonks/blendid/gulpfile.js/lib/projectPath");

module.exports = {
  images: true,
  javascripts: false,
  fonts: true,
  static: true,
  svgSprite: true,

  stylesheets: {
    sass: {
      importer: globImporter()
    }
  },

  html: {
    collections: ["events", "posters"],
    nunjucksRender: {
      manageEnv(env) {
        env.addFilter("split", (str, seperator) => str.split(seperator));
        env.addFilter(
          "transformation",
          (s, t) => s && s.replace("/upload/", `/upload/${t}/`)
        );
      }
    }
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

      task("upload-posters", () =>
        src(
          projectPath(
            PATH_CONFIG.src,
            PATH_CONFIG.static.src,
            "images/posters-small/*.*"
          )
        )
          .pipe(
            cloudinaryUpload({
              params: {
                folder: "caffe.topmonks.cz/posters",
                use_filename: true,
                unique_filename: false,
                overwrite: false
              }
            })
          )
          .pipe(
            cloudinaryUpload.manifest({
              path: projectPath(PATH_CONFIG.src, "data/posters.json")
            })
          )
          .pipe(dest(projectPath(PATH_CONFIG.src, "data")))
      );
    },
    development: {
      prebuild: ["events-data"],
      postbuild: ["events:watch"]
    },
    production: {
      prebuild: ["events-data", "upload-posters"]
    }
  },

  production: {
    rev: true
  }
};
