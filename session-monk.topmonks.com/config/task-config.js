const pathConfig = require("./path-config.json");
const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");

module.exports = createSharedTaskConfig(__dirname, {
  images: false,
  cloudinary: false,
  javascripts: false,
  fonts: false,
  static: true,
  svgSprite: false,
  stylesheets: false,
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
    rev: false
  }
});
