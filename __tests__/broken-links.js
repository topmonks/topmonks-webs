import test from "ava";
import check from "check-broken-links";
import "console.table";

test("Broken links", async t => {
  const broken = await check("https://localhost:8000/", [
    "https://localhost:8000/"
  ]);
  console.log(broken);
  if (broken.top.length > 0) console.log("Broken Top levels");
  console.table(broken.top);
  if (broken.crawled.length > 0) console.log("Broken crawled links");
  console.table(broken.crawled);
  t.true(broken.crawled.length === 0);
  t.true(broken.top.length === 0);
});
