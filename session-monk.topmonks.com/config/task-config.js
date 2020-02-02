const pathConfig = require("./path-config.json");

module.exports = {
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
};
