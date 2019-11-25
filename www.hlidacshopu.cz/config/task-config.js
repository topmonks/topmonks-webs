const fs = require("fs").promises;
const globImporter = require("node-sass-glob-importer");
const markdownToJSON = require("gulp-markdown-to-json");
const marked = require("marked");
const merge = require("gulp-merge-json");
const path = require("path");
const pathConfig = require("./path-config.json");
const projectPath = require("@topmonks/blendid/gulpfile.js/lib/projectPath");
const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");

const dataFile = name => projectPath(pathConfig.src, `data/${name}.json`);
const jsonData = n =>
  fs
    .readFile(dataFile(n), "utf8")
    .then(f => JSON.parse(f))
    .catch(() => {});

const config = createSharedTaskConfig(__dirname, {
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
      importer: globImporter()
    }
  },

  html: {
    dataFile: "../data/global.json",
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
          new Date(Date.parse(str)).toLocaleString("cs", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        );
        env.addFilter("split", (str, seperator) => str.split(seperator));
        env.addFilter(
          "transformation",
          (s, t) => s && s.replace("/upload/", `/upload/${t}/`)
        );
      }
    },
    dataFunction(_, cb) {
      Promise.all([
        jsonData("media"),
        jsonData("mediaImages")
      ]).then(([media, mediaImages]) => cb(null, { media, mediaImages }));
    }
  },

  browserSync: {
    server: {
      // should match `dest` in
      // path-config.json
      baseDir: "./public/www.hlidacshopu.cz"
    }
  },

  additionalTasks: {
    initialize({ task, src, dest, series, watch }, PATH_CONFIG, TASK_CONFIG) {
      const dataPath = projectPath(PATH_CONFIG.src, "data");
      const mediaSrc = projectPath(PATH_CONFIG.src, "data/media/**/*.md");
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

// module.exports = createSharedTaskConfig(__dirname, config); // <- Use if you want to enable access to shared assets
