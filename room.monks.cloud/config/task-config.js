const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");
const pathConfig = require("./path-config.json");

const config = createSharedTaskConfig(__dirname, {
  images: false,
  cloudinary: false,
  fonts: true,
  static: true,
  svgSprite: false,
  javascripts: false,
  stylesheets: false,
  workboxBuild: false,
  html: false,

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
