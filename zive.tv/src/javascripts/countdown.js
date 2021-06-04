import parseDuration from "parse-duration";
import { interval } from "rxjs";
import { defAtom } from "@thi.ng/atom";
import { render, html } from "lit-html";
import setStyles from "./set-styles.js";

const countdown = document.getElementById("countdown");
const state = defAtom(0);

const formatDuration = x =>
  new Date(x).toLocaleTimeString("cs", {
    timeStyle: "medium",
    timeZone: "UTC"
  });

state.addWatch("render", (id, prev, curr) =>
  requestAnimationFrame(() =>
    render(
      html`<data value="${curr}">${formatDuration(curr)}</data>`,
      countdown
    )
  )
);

addEventListener("DOMContentLoaded", e => {
  const url = new URL(location.href);
  setStyles(url.searchParams);
  const duration = parseDuration(url.searchParams.get("duration") ?? "5m");
  state.reset(duration);
  const secInterval = interval(1000);
  const dec = x => (x > 0 ? x - 1000 : 0);
  secInterval.subscribe(x => state.swap(dec));
});
