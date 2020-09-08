const fs = require("fs");
const path = require("path");

let targetFolder = path.resolve("./arx.monks.cloud/src/data/news/");
const files = fs.readdirSync(targetFolder);

for (let file of files) {
  const filePath = path.resolve(targetFolder, file);
  let content = fs.readFileSync(filePath).toString("utf-8");
  content = content.replace(
    "image:",
    "image: news/" + file.replace("md", "png")
  );
  fs.writeFileSync(filePath, content);
}
