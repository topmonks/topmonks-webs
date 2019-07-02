const globImporter = require("node-sass-glob-importer");
const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");

const config = createSharedTaskConfig(__dirname, {
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
      baseDir: "./public/balehu.topmonks.com"
    }
  },

  production: {
    rev: true
  }
});

module.exports = config;

// module.exports = createSharedTaskConfig(__dirname, config); // <- Use if you want to enable access to shared assets
