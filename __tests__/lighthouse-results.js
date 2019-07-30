import test from "ava";
import results from "../results/lh.report.json";

const assertThreshold = ({ score }, threshold) => t =>
  t.true(
    score >= threshold,
    `Score should be at least ${100 * threshold}%. Actual: ${100 * score}%`
  );

test(
  "Lighthouse Accessibility",
  assertThreshold(results.categories.accessibility, 0.75)
);

test(
  "Lighthouse Best practices",
  assertThreshold(results.categories["best-practices"], 0.75)
);

test(
  "Lighthouse Performance",
  assertThreshold(results.categories.performance, 0.75)
);

test("Lighthouse SEO", assertThreshold(results.categories.seo, 0.75));

test("Lighthouse Vulnerable libraries", t => {
  const audit = results.audits["no-vulnerable-libraries"];
  t.true(
    audit.score === 1,
    audit.details &&
      "Contains vulnerable libraries: " +
        audit.details.items.map(x => x.detectedLib.text).join()
  );
});
