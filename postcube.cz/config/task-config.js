const createSharedTaskConfig = require("../../shared/config/createSharedTaskConfig");
const pathConfig = require("./path-config.json");
const projectPath = require("@topmonks/blendid/gulpfile.js/lib/projectPath");
const csvtojson = require("csvtojson");
const fs = require("fs");
const fetch = require("node-fetch");
const iconv = require("iconv-lite");

const SHOP_LINK = "https://448050.myshoptet.com/?c=";
const SHOP_EXPORT_URL =
  "https://448050.myshoptet.com/export/products.csv?patternId=4&hash=426e0c1d97348728b110e4d17b25c1db2e232722f4da58621d18f081ca83cc1b";

// https://stackoverflow.com/a/34890276/13890034
function groupBy(xs, key) {
  return xs.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

const config = createSharedTaskConfig(__dirname, {
  images: true,
  cloudinary: true,
  fonts: true,
  static: true,
  svgSprite: true,
  javascripts: false,
  stylesheets: true,
  workboxBuild: false,
  html: {
    collections: ["configurator", "images"]
  },

  browserSync: {
    server: {
      baseDir: pathConfig.dest
    }
  },

  additionalTasks: {
    initialize({ task, src, dest, series, watch }, PATH_CONFIG, TASK_CONFIG) {
      const dataPath = projectPath(PATH_CONFIG.src, PATH_CONFIG.data.src);
      const productsRawCsvPath = `${dataPath}/products.raw.csv`;
      const productsCsvPath = `${dataPath}/products.csv`;
      const configuratorJsonPath = `${dataPath}/configurator.json`;

      const download = async fileurl => {
        const response = await fetch(fileurl);
        const buffer = await response.buffer();
        const data = iconv.decode(buffer, "win1250");

        return data;
      };

      const transform = products => {
        if (!products.length) throw "No products to transform!";

        const mainProducts = [];
        for (let product of products) {
          if (product.categoryText === "Schránky > Jednoduché") {
            if (!mainProducts.find(({ name }) => name === product.name))
              mainProducts.push(product);
          }
        }

        const colors = [];
        for (let product of products) {
          const [, code] = product.code.split("/");
          const label = product["variant:Barva"];
          if (code && label) {
            if (!colors.find(({ value }) => value === code))
              colors.push({ value: code, label });
          }
        }

        const accessories = groupBy(
          products.filter(({ categoryText }) =>
            ["Příslušenství", "Služby"].includes(categoryText)
          ),
          "name"
        );

        console.log("Exported products", products);

        const byOrderProperty = (a, b) => {
          const order = ({ textProperty2 }) =>
            textProperty2.startsWith("Poradi;")
              ? parseInt(textProperty2.split(";")[1], 10)
              : 0;
          return order(a) - order(b);
        };

        const tranformSizes = (
          { code, name, textProperty, textProperty2, textProperty3, price },
          index
        ) => ({
          value: code.split("/")[0],
          label: name.replace("PostCube ", ""),
          info: textProperty.startsWith("Velikost;")
            ? textProperty.replace("Velikost;", "")
            : "",
          default: index === 1,
          price,
          disabled: textProperty3 === "meta;disabled"
        });

        return {
          shopLink: SHOP_LINK,
          currency: products[0].currency,
          sizes: mainProducts.sort(byOrderProperty).map(tranformSizes),
          colors,
          accessories: [
            {
              name: "Noha",
              productId: accessories["Noha"][0].code.split("/")[0],
              options: [
                {
                  value: null,
                  label: "žádná",
                  default: true
                },
                ...accessories["Noha"].map(
                  ({ code, price, "variant:Velikost": label }) => ({
                    value: code.split("/")[1],
                    price,
                    label
                  })
                )
              ]
            },
            // {
            //   name: "Stříška",
            //   options: [
            //     {
            //       value: null,
            //       label: "ne",
            //       default: true
            //     },
            //     {
            //       value: accessories["Stříška"][0].code,
            //       price: accessories["Stříška"][0].price,
            //       label: "ano"
            //     }
            //   ]
            // },
            {
              name: "Držák na zeď",
              options: [
                {
                  value: null,
                  label: "ne",
                  default: true
                },
                {
                  value: accessories["Držák na zeď"][0].code,
                  price: accessories["Držák na zeď"][0].price,
                  label: "ano"
                }
              ]
            },
            {
              name: "Dlaždice 50 x 50 cm",
              options: [
                {
                  value: null,
                  label: "ne",
                  default: true
                },
                {
                  value: accessories["Dlaždice 50 x 50 cm"][0].code,
                  price: accessories["Dlaždice 50 x 50 cm"][0].price,
                  label: "ano"
                }
              ]
            },
            {
              name: "Montáž na míru",
              options: [
                {
                  value: null,
                  label: "ne",
                  default: true
                },
                {
                  value: accessories["Montáž na míru"][0].code,
                  price: accessories["Montáž na míru"][0].price,
                  label: "ano"
                }
              ]
            }
          ]
        };
      };

      task("configurator-data", async () => {
        const csv = await download(SHOP_EXPORT_URL);
        const data = await csvtojson({ delimiter: ";" }).fromString(csv);

        return fs.promises.writeFile(
          configuratorJsonPath,
          JSON.stringify(transform(data))
        );
      });
    },
    development: {
      prebuild: ["configurator-data"]
    },
    production: {
      prebuild: ["configurator-data"]
    }
  },

  production: {
    rev: true
  }
});

module.exports = config;
