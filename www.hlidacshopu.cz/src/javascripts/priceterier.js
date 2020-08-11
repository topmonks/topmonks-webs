import { html, svg, render } from "lit-html/lit-html";
import { formatPercents } from "./lib/format";
import { fetchPriceterierData } from "./lib/remoting";

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
      <td>${order}</td>
      <td>${realSalePerc}</td>
      <td>${finalPrice}</td>
      <td>${realSaleAbs}</td>
      <td>${itemName}</td>
      <td><img src="${itemImage}" width="50" height="50"></td>
      <td><a hrer="${shop}">${shop}</a></td>
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
    <a href="${url}" class="sprite sprite--${logo}" title="${name}">${image}</a>
  `;
}
