import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { response, notFound, withCORS } from "../http.mjs";

/** @typedef { import("@pulumi/awsx/apigateway").Request } APIGatewayProxyEvent */
/** @typedef { import("@pulumi/awsx/apigateway").Response } APIGatewayProxyResult */

/**
 * @param {APIGatewayProxyEvent} event
 * @returns {Promise.<APIGatewayProxyResult>}
 */
export async function handler(event) {
  const track = event.queryStringParameters["track"];
  /** @type Response */
  const resp = await fetch(
    `https://www.beatport.com/search?${new URLSearchParams({
      q: track,
      _pjax: "#pjax-inner-wrapper"
    })}`,
    {
      credentials: "include",
      headers: {
        "X-PJAX": "true",
        "X-PJAX-Container": "#pjax-inner-wrapper"
      },
      referrer: "https://www.beatport.com/",
      method: "GET",
      mode: "cors"
    }
  );
  const html = await resp.text();
  const $ = cheerio.load(html);
  const $tracks = $(".bucket-item.track");
  if (!$tracks.length) {
    return withCORS(["GET"])(notFound());
  }
  const $track = $tracks.first();
  return withCORS(["GET"])(
    response({
      link: `https://www.beatport.com${$track
        .find(".buk-track-title a")
        .attr("href")}`,
      img: $track.find("img").attr("src")
    })
  );
}
