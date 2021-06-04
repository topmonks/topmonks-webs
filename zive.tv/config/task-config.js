const esbuild = require("gulp-esbuild");
const mode = require("gulp-mode")();
const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");
const pathConfig = require("./path-config.json");
const projectPath = require("@topmonks/blendid/gulpfile.js/lib/projectPath.js");

const config = createSharedTaskConfig(__dirname, {
  images: true,
  cloudinary: false,
  fonts: true,
  static: true,
  svgSprite: true,
  javascripts: false,
  stylesheets: true,
  workboxBuild: false,

  html: {
    collections: ["caffe"],
    nunjucksRender: {
      filters: {
        year: () => new Date().getFullYear()
      }
    }
  },

  esbuild: {
    extensions: ["js", "mjs"],
    options: {
      bundle: true,
      minify: mode.production(),
      sourcemap: true,
      format: "esm",
      platform: "browser",
      target: ["es2019"],
      charset: "utf8"
    }
  },

  additionalTasks: {
    initialize(gulp, pathConfig, taskConfig) {
      const { src, task, dest } = gulp;
      const paths = {
        src: projectPath(pathConfig.src, pathConfig.esbuild.src, "*.js"),
        dest: projectPath(pathConfig.dest, pathConfig.esbuild.dest)
      };
      task("esbuild-prod", () =>
        src(paths.src)
          .pipe(esbuild(taskConfig.esbuild.options))
          .pipe(dest(paths.dest))
      );
      const gulpEsbuild = esbuild.createGulpEsbuild({ incremental: true });
      task("esbuild", () =>
        src(paths.src)
          .pipe(gulpEsbuild(taskConfig.esbuild.options))
          .pipe(dest(paths.dest))
      );
    },
    development: { code: ["esbuild"] },
    production: { code: ["esbuild-prod"] }
  },

  watch: { tasks: ["esbuild"] },

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
