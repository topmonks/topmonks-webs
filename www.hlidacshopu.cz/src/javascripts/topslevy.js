import { html, render, svg } from "lit-html/lit-html";
import { formatMoney, formatPercents } from "./lib/format";
import { fetchDiscountDataPercent } from "./lib/remoting";
import { fetchDiscountDataCZK } from "./lib/remoting";
import { shops } from "./lib/shops.js";

const tableRootPercent = document.getElementById("table-root-percent");
if (tableRootPercent) {
  addEventListener("DOMContentLoaded", async e => {
    try {
      let data = await fetchDiscountDataPercent();
      //add sequenceId
      let a = data;
      for (let i = 0; i < a.length; i++) {
        let obj = a[i];
        obj.sequenceId = i + 1;
        obj.formatedDate = new Intl.DateTimeFormat("cs").format(
          Date.parse(obj.date)
        );
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
      let data = await fetchDiscountDataCZK();
      //add sequenceId
      let a = data;
      for (let i = 0; i < a.length; i++) {
        let obj = a[i];
        obj.sequenceId = i + 1;
        obj.formatedDate = new Intl.DateTimeFormat("cs").format(
          Date.parse(obj.date)
        );
      }
      data = a;
      render(tableTemplateKc(data), tableRootKc);
    } catch (ex) {
      console.error(ex);
    }
  });
}

function tableTemplatePercent(data) {
  return data.map(shopTemplatePercent);
}

function tableTemplateKc(data) {
  return data.map(shopTemplateKc);
}

function shopTemplatePercent({
  sequenceId,
  historyItemsTDays,
  formatedDate,
  shop,
  itemId,
  itemImage,
  itemName,
  itemUrl,
  minPriceTDays,
  currentPrice,
  maxPrice,
  saleAbs,
  salePerc
}) {
  return html`
    <tr class="dashboard-row">
      <th>${sequenceId}</th>
      <td>${formatPercents(salePerc / 100)}</td>
      <td>${formatMoney(Math.round(minPriceTDays))}</td>
      <td>${formatMoney(Math.round(saleAbs))}</td>
      <td>${formatMoney(Math.round(currentPrice))}</td>
      <td style="white-space: nowrap;">${formatedDate}</td>
      <td>${productLinkTemplate(itemName, itemUrl)}</td>
      <td>${logoTemplate(shop)}</td>
    </tr>
  `;
}

function shopTemplateKc({
  sequenceId,
  historyItemsTDays,
  formatedDate,
  shop,
  itemId,
  itemImage,
  itemName,
  itemUrl,
  minPriceTDays,
  currentPrice,
  maxPrice,
  saleAbs,
  salePerc
}) {
  return html`
    <tr class="dashboard-row">
      <th>${sequenceId}</th>
      <td>${formatMoney(Math.round(saleAbs))}</td>
      <td>${formatMoney(Math.round(currentPrice))}</td>
      <td>${formatMoney(Math.round(minPriceTDays))}</td>
      <td>${formatPercents(salePerc / 100)}</td>
      <td style="white-space: nowrap;">${formatedDate}</td>
      <td>${productLinkTemplate(itemName, itemUrl)}</td>
      <td>${logoTemplate(shop)}</td>
    </tr>
  `;
}

function logoTemplate(shop) {
  const foundShop = shops.get(shop);
  if (foundShop) {
    const { logo, name, url, viewBox } = shops.get(shop);

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
  } else {
    return html`
      <p>${shop}</p>
    `;
  }
}

function productLinkTemplate(itemName, itemUrl) {
  return html`
    <a href="${itemUrl}" target="_blank">${itemName}</a>
  `;
}
