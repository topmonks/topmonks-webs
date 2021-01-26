import * as cheerio from "cheerio";
import fetch from "node-fetch";

/** @typedef { import("@pulumi/awsx/apigateway").Request } APIGatewayProxyEvent */
/** @typedef { import("@pulumi/awsx/apigateway").Response } APIGatewayProxyResult */

/**
 * @param {Record<string, any> | string} body
 * @param {Record<string, boolean | number | string>} [headers]
 * @returns {APIGatewayProxyResult}
 */
function response(body, headers) {
  return {
    statusCode: 200,
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers
  };
}

/**
 * @param {Record<string, any>} body
 * @returns {APIGatewayProxyResult}
 */
export function notFound(body = { error: "Data not found" }) {
  return {
    statusCode: 404,
    body: JSON.stringify(body)
  };
}

/**
 * @callback ResponseTransformer
 * @param {APIGatewayProxyResult} in
 * @returns {APIGatewayProxyResult}
 */
/**
 * @param {string | string[]} methods
 * @param {string} [origin]
 * @return {ResponseTransformer}
 */
function withCORS(methods, origin = "*") {
  const allowMethods = Array.isArray(methods) ? methods.join(",") : methods;
  return x => ({
    ...x,
    headers: {
      ...x.headers,
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": allowMethods,
      "Access-Control-Allow-Headers":
        "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token"
    }
  });
}

/**
 * @param {APIGatewayProxyEvent} event
 * @returns {Promise.<APIGatewayProxyResult>}
 */
export async function handler(event) {
  /** @type Response */
  const resp = await fetch("https://serato.com/playlists/Alessio_Busta/live");
  const html = await resp.text();
  const $ = cheerio.load(html);
  let $playlist = $(".playlist-trackname");
  if (!$playlist.length) {
    return withCORS(["GET"])(notFound("Not playing"));
  }
  const currentSong = $playlist
    .last()
    .text()
    .trim();
  return withCORS(["GET"])(response(currentSong));
}
