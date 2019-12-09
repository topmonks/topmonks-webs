/**
 * merges original config with a some extra configuration, adding support to import shared files
 */

const path = require("path");
const merge = require("lodash.merge");

/**
 *
 * @param {String} dirname just send __dirname
 * @param {*} config your custom config
 * @returns {Object} new config object
 */
const withShared = function(dirname, config) {
  return merge(config, {
    stylesheets: {
      sass: {
        includePaths: [
          path.resolve(dirname, "../../shared/src"),
          path.resolve(dirname, "../../node_modules")
        ]
      }
    },

    html: {
      excludeFolders: ["layouts", "shared", "macros"],
      src: "html",
      nunjucksRender: {
        path: [
          path.resolve(dirname, "../src/html"),
          path.resolve(dirname, "../../shared/src") // <- add if you want to use shared html
        ]
      }
    },

    // overwritten by incoming config
    production: {
      rev: true
    },

    additionalTasks: {
      initialize(gulp, PATH_CONFIG, TASK_CONFIG) {
        if (config.additionalTasks && config.additionalTasks.initialize) {
          config.additionalTasks.initialize(gulp, PATH_CONFIG, TASK_CONFIG);
        }

        const { task, watch, series } = gulp;

        task("shared:watch", cb => {
          watch(
            path.resolve(dirname, "../../shared/src", "**/*.{css,scss}"),
            series("stylesheets")
          );
          watch(
            path.resolve(dirname, "../../shared/src", "**/*.{html,njk,json}"),
            series("html")
          );
          cb();
        });
      },
      development: {
        postbuild: ["shared:watch"]
      }
    }
  });
};

module.exports = withShared;
