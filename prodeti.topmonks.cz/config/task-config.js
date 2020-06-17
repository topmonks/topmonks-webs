const pathConfig = require("./path-config.json");
const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");

module.exports = createSharedTaskConfig(__dirname, {
  images: true,
  cloudinary: true,
  javascripts: false,
  fonts: true,
  static: true,
  svgSprite: true,
  stylesheets: true,
  workboxBuild: false,

  html: {
    collections: ["images"]
  },

  browserSync: {
    server: {
      baseDir: pathConfig.dest
    }
  },

  production: {
    rev: true
  }
})
