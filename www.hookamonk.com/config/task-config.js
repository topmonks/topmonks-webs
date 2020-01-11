const importer = require("node-sass-magic-importer");
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
      importer: importer()
    }
  },

  html: {
    dataFile: "../data/global.json"
  },

  browserSync: {
    server: {
      baseDir: pathConfig.dest
    }
  },

  production: {
    rev: true
  }
});

module.exports = config;
