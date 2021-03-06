const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");
const pathConfig = require("./path-config.json");

const config = createSharedTaskConfig(__dirname, {
  images: false,
  cloudinary: false,
  fonts: false,
  static: true,
  svgSprite: true,
  javascripts: false,
  stylesheets: true,
  workboxBuild: false,

  html: {
    collections: []
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
