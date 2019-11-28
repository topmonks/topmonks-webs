const globImporter = require("node-sass-glob-importer");

module.exports = {
  images: false,
  javascripts: false,
  fonts: false,
  static: false,
  svgSprite: false,
  stylesheets: false,

  html: {
    dataFile: "../data/global.json"
  },

  browserSync: {
    server: {
      // should match `dest` in
      // path-config.json
      baseDir: "./public/session-monk.topmonks.com"
    }
  },

  production: {
    rev: false
  }
};
