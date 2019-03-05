const globImporter = require("node-sass-glob-importer");

module.exports = {
  images: true,
  fonts: true,
  static: true,
  svgSprite: true,

  javascripts: {
    entry: {
      app: ["./index.js"]
    }
  },

  stylesheets: {
    sass: {
      importer: globImporter()
    },
    autoprefixer: { browsers: ["> 5%", "last 4 versions", "IE 8"] }
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
