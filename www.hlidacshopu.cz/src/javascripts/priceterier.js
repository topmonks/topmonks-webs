import {html, render, svg} from "lit-html/lit-html";
import {formatMoney, formatPercents} from "./lib/format";
import {fetchPriceterierDataPercent} from "./lib/remoting";
import {fetchPriceterierDataKc} from "./lib/remoting";
import {shops} from "./lib/shops.js";

const tableRootPercent = document.getElementById("table-root-percent");
if (tableRootPercent) {
  addEventListener("DOMContentLoaded", async e => {
    try {
      let data = await fetchPriceterierDataPercent();
      console.log("fetched data from fetchPriceterierData() ");
      console.log(data);
      //add sequenceId
      let a = data;
      for (let i = 0; i < a.length; i++) {
        let obj = a[i];
        obj.sequenceId = i + 1;
      }
      data = a;
      render(tableTemplatePercent(data), tableRootPercent);
    } catch (ex) {
      console.error(ex);
    }
  });
}
const tableRootKc = document.getElementById("table-root-kc");
if (tableRootKc) {
  addEventListener("DOMContentLoaded", async e => {
    try {
      let data = await fetchPriceterierDataKc();
      console.log("fetched data from fetchPriceterierData() ");
      console.log(data);
      //add sequenceId
      let a = data;
      for (let i = 0; i < a.length; i++) {
        let obj = a[i];
        obj.sequenceId = i + 1;
      }
      data = a;
      render(tableTemplateKc(data), tableRootKc);
    } catch (ex) {
      console.error(ex);
    }
  });
}

function tableTemplatePercent(data) {
  console.log(data.map(shopTemplatePercent));
  return data.map(shopTemplatePercent);
}

function tableTemplateKc(data) {
  console.log(data.map(shopTemplateKc));
  return data.map(shopTemplateKc);
}

function shopTemplatePercent({
                               sequenceId,
                               historyItems30Days,
                               date,
                               shop,
                               itemId,
                               itemName,
                               itemUrl,
                               minPrice30Days,
                               currentPrice,
                               max_price,
                               sale_abs,
                               sale_perc
                             }) {
  return html`
     <tr class="dashboard-row">
      <th>${sequenceId}</th>
      <td>${formatPercents(sale_perc / 100)}</td>
      <td>${formatMoney(Math.round(minPrice30Days))}</td>
      <td>${formatMoney(Math.round(sale_abs))}</td>
      <td>${formatMoney(Math.round(currentPrice))}</td>
      <td>${date}</td>
      <td>${productLinkTemplate(shops.get(shop), itemName, itemUrl)}</td>
      <td>${logoTemplate(shops.get(shop))}</td>
    </tr>
  `;
}

function shopTemplateKc({
                          sequenceId,
                          historyItems30Days,
                          date,
                          shop,
                          itemId,
                          itemName,
                          itemUrl,
                          minPrice30Days,
                          currentPrice,
                          max_price,
                          sale_abs,
                          sale_perc
                        }) {
  return html`
    <tr class="dashboard-row">
      <th>${sequenceId}</th>
      <td>${formatMoney(Math.round(sale_abs))}</td>
      <td>${formatMoney(Math.round(currentPrice))}</td>
      <td>${formatMoney(Math.round(minPrice30Days))}</td>
      <td>${formatPercents(sale_perc / 100)}</td>
      <td>${date}</td>
      <td>${productLinkTemplate(shops.get(shop), itemName, itemUrl)}</td>
      <td>${logoTemplate(shops.get(shop))}</td>
    </tr>
  `;
}


function logoTemplate({logo, name, url, viewBox}) {
  const image = svg`
      <svg viewBox="${viewBox}">
        <title>${name}</title>
        <use href="#${logo}"/>
      </svg>
    `;
  return html`
    <a
      href="${url}"
      class="sprite sprite--${logo}"
      title="${name}"
      target="_blank"
      >${image}</a
    >
  `;
}

function productLinkTemplate({logo, name, url, viewBox}, itemName, itemUrl) {
  return html`
    <a href="${itemUrl}" target="_blank">${itemName}</a>
  `;
}
