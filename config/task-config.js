const globImporter = require("node-sass-glob-importer");
const markdown = require("nunjucks-markdown");
const marked = require("marked");

module.exports = {
  images: true,
  fonts: true,
  "static": true,
  svgSprite: true,
  ghPages: true,

  javascripts: {
    entry: {
      // files paths are relative to
      // javascripts.dest in path-config.json
      app: ["./app.js"]
    }
  },

  stylesheets: {
    sass: {
      importer: globImporter()
    }
  },

  html: {
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
      baseDir: "public"
    }
  },

  production: {
    rev: true
  }
};
