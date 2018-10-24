const globImporter = require("node-sass-glob-importer");

// const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig"); // <- Use if you want to enable access to shared assets

const config = {
  images: true,
  fonts: true,
  static: true,
  svgSprite: true,
  ghPages: false,

  javascripts: {
    entry: {
      app: ["./index.js"]
    },
    extractSharedJs: true,
    hot: {
      enabled: true,
      reload: true,
      quiet: true,
      react: false
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
      baseDir: "./public/%APP_DIR_NAME%"
    }
  },

  production: {
    rev: true
  }
};

module.exports = config;

// module.exports = createSharedTaskConfig(__dirname, config); // <- Use if you want to enable access to shared assets
