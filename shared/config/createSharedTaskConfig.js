/**
 * merges original config with a some extra configuration, adding support to import shared files
 */

const globImporter = require("node-sass-glob-importer");
const watch = require("gulp-watch");
const path = require("path");
const gulp = require("gulp");

/**
 *
 * @param {String} dirname just send __dirname
 * @param {*} config your custom config
 * @returns {Object} new config object
 */
const withShared = function(dirname, config) {
  return {
    ...config,
    stylesheets: {
      ...config.stylesheets,
      sass: {
        importer: globImporter(),
        includePaths: [
          path.resolve(dirname, "../../shared/src"),
          path.resolve(dirname, "../../node_modules")
        ]
      }
    },

    html: {
      ...config.html,
      excludeFolders: ["layouts", "shared", "macros"],
      src: "html",
      nunjucksRender: {
        ...config.html.nunjucksRender,
        path: [
          path.resolve(dirname, "../src/html"),
          path.resolve(dirname, "../../shared/src") // <- add if you want to use shared html
        ]
      }
    },

    // overwritten by incoming config
    production: {
      rev: true,
      ...config.production
    },

    additionalTasks: {
      ...config.additionalTasks,
      initialize: function(gulpInjected, PATH_CONFIG, TASK_CONFIG) {
        if (config.additionalTasks && config.additionalTasks.initialize) {
          config.additionalTasks.initialize(
            gulpInjected,
            PATH_CONFIG,
            TASK_CONFIG
          );
        }

        gulp.task("shared-html:watch", () => {
          watch(
            path.resolve(dirname, "../../shared/src", "**/*.{html,njk,json}"),
            require("blendid/gulpfile.js/tasks/html") // the code is so shit we need to use require
          );
        });
        gulp.task("shared-css:watch", () => {
          watch(
            path.resolve(dirname, "../../shared/src", "**/*.{css,scss}"),
            require("blendid/gulpfile.js/tasks/stylesheets") // the code is so shit we need to use require
          );
        });

        // initSharedWatcher();
      },
      development: {
        ...(config.additionalTasks && config.additionalTasks.development
          ? config.additionalTasks.development
          : {}),
        postbuild: [
          ...(config.additionalTasks &&
          config.additionalTasks.development &&
          config.additionalTasks.development.postbuild
            ? config.additionalTasks.development.postbuild
            : []),
          "shared-html:watch",
          "shared-css:watch"
        ]
      }
    }
  };
};

module.exports = withShared;
