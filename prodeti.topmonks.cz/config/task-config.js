const globImporter = require("node-sass-glob-importer");

module.exports = {
  images: true,
  javascripts: false,
  fonts: true,
  static: true,
  svgSprite: true,

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
      baseDir: "./public/prodeti.topmonks.cz"
    }
  },

  production: {
    rev: true
  }
};
