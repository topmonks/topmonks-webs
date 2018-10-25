const globImporter = require("node-sass-glob-importer");

const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");

const config = createSharedTaskConfig(__dirname, {
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
    dataFile: "../data/global.json"
  },

  browserSync: {
    server: {
      // should match `dest` in
      // path-config.json
      baseDir: "./public/example-with-shared"
    }
  },

  production: {
    rev: true
  }
});

module.exports = config;
