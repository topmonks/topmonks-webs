const globImporter = require("node-sass-glob-importer");
const pathConfig = require("./path-config.json");
const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");
const projectPath = require("@topmonks/blendid/gulpfile.js/lib/projectPath");

const config = createSharedTaskConfig(__dirname, {
  images: true,
  javascripts: false,
  fonts: true,
  static: true,
  svgSprite: false,

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
      baseDir: pathConfig.dest
    }
  },

  production: {
    rev: true
  }
});

module.exports = config;

// module.exports = createSharedTaskConfig(__dirname, config); // <- Use if you want to enable access to shared assets
