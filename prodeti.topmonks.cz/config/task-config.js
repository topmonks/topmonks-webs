const globImporter = require("node-sass-glob-importer");
const markdown = require("nunjucks-markdown");
const marked = require("marked");

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
    dataFile: "../data/global.json",
    nunjucksRender: {
      manageEnv: function(environment) {
        // The second argument can be any function that renders markdown
        markdown.register(environment, marked);
      }
    }
  },

  browserSync: {
    server: {
      // should match `dest` in
      // path-config.json
      baseDir: "./public/prodeti.topmonks.cz"
    }
  },

  production: {
    rev: true
  }
};
