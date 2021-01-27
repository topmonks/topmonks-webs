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
  /** @type Response */
  const resp = await fetch("https://serato.com/playlists/Alessio_Busta/live");
  const html = await resp.text();
  const $ = cheerio.load(html);
  const $playlist = $(".playlist-trackname");
  if (!$playlist.length) {
    return withCORS(["GET"])(notFound("Not playing"));
  }
  const currentSong = $playlist
    .last()
    .text()
    .trim();
  return withCORS(["GET"])(response(currentSong));
}
