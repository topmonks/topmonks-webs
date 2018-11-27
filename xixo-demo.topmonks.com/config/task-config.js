const globImporter = require("node-sass-glob-importer");
const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");

const config = createSharedTaskConfig(__dirname, {
  images: true,
  fonts: true,
  static: true,
  svgSprite: true,
  ghPages: false,

  javascripts: {
    entry: {
      //app: ["./index.js"]
      app: [
        // "./runtime.ec2944dd8b20ec099bf3.js",
        // "./polyfills.f769d3dd0ac22fc8bfc7.js",
        // "./main.6998b14f6f91ddc82ce9.js"
      ]
    }
  },

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
      baseDir: "./public/xixo-demo.topmonks.com"
    }
  },

  production: {
    rev: true
  }
});

module.exports = config;

// module.exports = createSharedTaskConfig(__dirname, config); // <- Use if you want to enable access to shared assets
