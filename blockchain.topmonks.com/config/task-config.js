const fs = require("fs").promises;
const globImporter = require("node-sass-glob-importer");
const markdownToJSON = require("gulp-markdown-to-json");
const marked = require("marked");
const merge = require("gulp-merge-json");
const path = require("path");
const pathConfig = require("./path-config.json");
const projectPath = require("@topmonks/blendid/gulpfile.js/lib/projectPath");

const dataFile = name => projectPath(pathConfig.src, `data/${name}.json`);
const jsonData = n =>
  fs
    .readFile(dataFile(n), "utf8")
    .then(f => JSON.parse(f))
    .catch(() => {});

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
    dataFile: "../data/global.json",
    dataFunction(_, cb) {
      Promise.all([
        jsonData("articles"),
        jsonData("podcasts")
      ]).then(([articles, podcasts]) => cb(null, { articles, podcasts }));
    },
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
        env.addFilter("longDate", (str, locale) =>
          new Intl.DateTimeFormat(locale, {
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
    },
  },

  browserSync: {
    server: {
      baseDir: pathConfig.dest
    }
  },

  additionalTasks: {
    initialize({ task, src, dest, series, watch }, PATH_CONFIG, TASK_CONFIG) {
      const dataPath = projectPath(PATH_CONFIG.src, "data");
      const articlesSrc = projectPath(PATH_CONFIG.src, "data/articles/**/*.md");
      const podcastsSrc = projectPath(PATH_CONFIG.src, "data/podcasts/**/*.md");
      const generateJson = (collName, collSrc, edit) => () =>
        src(collSrc)
          .pipe(markdownToJSON(marked))
          .pipe(
            merge({
              concatArrays: true,
              fileName: `${collName}.json`,
              edit
            })
          )
          .pipe(dest(dataPath));
      const generateArticlesJson = generateJson(
        "articles",
        articlesSrc,
        json => ({ [json.published.split("-").shift()]: [json] })
      );
      const generatePodcastsJson = generateJson(
        "podcasts",
        podcastsSrc,
        json => ({ [json.published.split("-").shift()]: [json] })
      );

      task("articles-data", generateArticlesJson);
      task("articles:watch", cb => {
        watch(articlesSrc, generateArticlesJson);
        watch(path.resolve(dataPath, "articles.json"), series("html"));
        cb();
      });
      task("podcasts-data", generatePodcastsJson);
      task("podcasts:watch", cb => {
        watch(podcastsSrc, generatePodcastsJson);
        watch(path.resolve(dataPath, "podcasts.json"), series("html"));
        cb();
      });
    },
    development: {
      prebuild: ["articles-data", "podcasts-data"],
      postbuild: ["articles:watch", "podcasts:watch"]
    },
    production: {
      prebuild: ["articles-data", "podcasts-data"]
    }
  },

  production: {
    rev: true
  }
};
