const importer = require("node-sass-magic-importer");
const markdownToJSON = require("gulp-markdown-to-json");
const marked = require("marked");
const merge = require("gulp-merge-json");
const path = require("path");
const pathConfig = require("./path-config.json");
const projectPath = require("@topmonks/blendid/gulpfile.js/lib/projectPath");
const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");

const config = createSharedTaskConfig(__dirname, {
  locales: ["cs", "cs-CZ"],
  images: true,
  javascripts: false,
  fonts: true,
  static: true,

  svgSprite: {
    svgstore: {
      inlineSvg: true
    }
  },

  stylesheets: {
    sass: {
      importer: importer()
    }
  },

  html: {
    collections: ["media", "mediaImages"],
    htmlmin: {
      collapseBooleanAttributes: true,
      decodeEntities: true,
      minifyCSS: true,
      minifyJS: true,
      removeAttributeQuotes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    },
    nunjucksRender: {
      manageEnv(env) {
        env.addFilter("longDate", str =>
          new Intl.DateTimeFormat("cs", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }).format(new Date(str))
        );
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
      const mediaSrc = projectPath(dataPath, "media/**/*.md");
      const generateMediaJson = () =>
        src(mediaSrc)
          .pipe(markdownToJSON(marked))
          .pipe(
            merge({
              concatArrays: true,
              fileName: "media.json",
              edit: json => ({ [json.published.split("-").shift()]: [json] })
            })
          )
          .pipe(dest(dataPath));

      task("media-data", generateMediaJson);
      task("media:watch", cb => {
        watch(mediaSrc, generateMediaJson);
        watch(path.resolve(dataPath, "media.json"), series("html"));
        cb();
      });
    },
    development: {
      prebuild: ["media-data"],
      postbuild: ["media:watch"]
    },
    production: {
      prebuild: ["media-data"]
    }
  },

  production: {
    rev: true
  }
});

module.exports = config;
