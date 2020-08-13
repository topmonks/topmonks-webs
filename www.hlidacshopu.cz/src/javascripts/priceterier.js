import { html, svg, render } from "lit-html/lit-html";
import { formatPercents } from "./lib/format";
import { formatMoney } from "./lib/format";
import {fetchPriceterierData, fetchShopsStats} from "./lib/remoting";
import { shops } from "./lib/shops.js";

const tableRoot = document.getElementById("table-root");

addEventListener("DOMContentLoaded", async e => {
  try {
    const data = await fetchPriceterierData();
    console.log("fetched data from fetchPriceterierData() ")
    console.log(data);//TODO remove
    render(tableTemplate(data), tableRoot);
  } catch (ex) {
    console.error(ex);
  }
});

function tableTemplate(data) {
  //return data.sort((a, b) => a.sortKey - b.sortKey).map(shopTemplate);
  return data.map(shopTemplate);
}

function shopTemplate({
                        order,
                        realSalePerc,
                        finalPrice,
                        realSaleAbs,
                        itemName,
                        itemImage,
                        itemUrl,
                        fromDate,
                        shop
}) {
  return html`
    <tr class="dashboard-row">
      <th>${order}</th>
      <td>${formatPercents(realSalePerc/100)}</td>
      <td>${formatMoney(finalPrice)}</td>
      <td>${formatMoney(realSaleAbs)}</td>
      <td>${productLinkTemplate(shops.get(shop), itemName, itemUrl)}</td>

      <td><img src="${itemImage}" width="50" height="50"></td>
      <td>${logoTemplate(shops.get(shop))}</td>

    </tr>
  `;
}

function logoTemplate({ logo, name, url, viewBox }) {
  const image = svg`
      <svg viewBox="${viewBox}">
        <title>${name}</title>
        <use href="#${logo}"/>
      </svg>
    `;
  return html`
    <a href="${url}" class="sprite sprite--${logo}" title="${name}" target="_blank">${image}</a>
  `;
}

function productLinkTemplate({ logo, name, url, viewBox }, itemName, itemUrl) {
  const productUrl = url + "/" + itemUrl
  return html`
    <a href="${productUrl}" target="_blank">${itemName}</a>
  `;
}
