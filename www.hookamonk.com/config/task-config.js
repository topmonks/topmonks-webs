const pathConfig = require("./path-config.json");
const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");

const config = createSharedTaskConfig(__dirname, {
  images: true,
  cloudinary: false,
  javascripts: false,
  fonts: false,
  static: true,
  svgSprite: true,
  stylesheets: true,
  workboxBuild: false,

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
