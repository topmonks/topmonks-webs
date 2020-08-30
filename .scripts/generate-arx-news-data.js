const puppeteer = require("puppeteer");
const origNews = require("../arx.monks.cloud/src/data/orig-news.json");
const fs = require("fs");
const path = require("path");

async function getContent(link) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(link);
  const content = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("section.post-content p"))
      .map(x => x.innerText)
      .join("/n/n");
  });

  await browser.close();
  return content;
}

(async () => {
  for (let news of origNews) {
    const { title, date, link } = news;
    const content = await getContent(link);
    const markdown = `---
title: ${title}
date: ${date}
originalUrl: ${link}
image:
---

${content}
`;
    fs.writeFileSync(
      path.resolve(`./arx.monks.cloud/src/data/news/${date}.md`),
      markdown
    );
  }
})();
