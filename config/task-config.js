var globImporter   = require('node-sass-glob-importer')
var markdown       = require('nunjucks-markdown')
var marked         = require('marked')

module.exports = {
  html        : true,
  images      : true,
  fonts       : true,
  static      : true,
  svgSprite   : true,
  ghPages     : true,
  stylesheets : true,

  javascripts: {
    entry: {
      // files paths are relative to
      // javascripts.dest in path-config.json
      app: ["./app.js"]
    }
  },

  stylesheets: {
    sass: {
      importer: globImporter()
    }
  },

  html: {
    nunjucksRender: {
      manageEnv: function(environment) {
          // The second argument can be any function that renders markdown
            markdown.register(environment, marked);
        }
    }
  },

  browserSync: {
    server: {
      // should match `dest` in
      // path-config.json
      baseDir: 'public'
    }
  },

  production: {
    rev: true
  }
}
