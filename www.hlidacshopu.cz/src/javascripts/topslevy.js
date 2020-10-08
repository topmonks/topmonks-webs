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
      const buttonsSection = document.getElementById("below-buttons");
      render(buttonsTemplatePercent(data), buttonsSection);
      document.getElementById("show-more").addEventListener("click", showMore);
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

function showMore() {
  const secondPart = document.querySelectorAll("[id=secondPart]");
  secondPart.forEach(function(o) {
    o.style.display = "";
  });
  const button = document.getElementById("show-more");
  button.style.display = "none";
}

function buttonsTemplatePercent(data) {
  return html`
    <button type="button" class="button" id="show-more">
      Zobrazit další slevy
    </button>
  `;
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
  const rowId = Number(sequenceId);
  let toHide = false;
  if (rowId > 10) {
    toHide = true;
  }
  if (!toHide) {
    return html`
      <tr class="dashboard-row" id="firstPart">
        <th>${sequenceId}</th>
        <td>${formatPercents(salePerc / 100)}</td>
        <td>${formatMoney(Math.round(minPriceTDays))}</td>
        <td>${formatMoney(Math.round(saleAbs))}</td>
        <td>${formatMoney(Math.round(currentPrice))}</td>
        <td style="white-space: nowrap;">${formatedDate}</td>
        <td>${productLinkTemplate(itemName, itemUrl)}</td>
        <td>${productImageTemplate(itemImage)}</td>
        <td>${logoTemplate(shop)}</td>
      </tr>
    `;
  } else {
    return html`
      <tr class="dashboard-row" id="secondPart" style="display: none">
        <th>${sequenceId}</th>
        <td>${formatPercents(salePerc / 100)}</td>
        <td>${formatMoney(Math.round(minPriceTDays))}</td>
        <td>${formatMoney(Math.round(saleAbs))}</td>
        <td>${formatMoney(Math.round(currentPrice))}</td>
        <td style="white-space: nowrap;">${formatedDate}</td>
        <td>${productLinkTemplate(itemName, itemUrl)}</td>
        <td>${productImageTemplate(itemImage)}</td>
        <td>${logoTemplate(shop)}</td>
      </tr>
    `;
  }
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
      <td>${productImageTemplate(itemImage)}</td>
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

function productImageTemplate(itemImage) {
  return html`
    <img src="${itemImage}" style="width:40px;height:40px;" alt="Not Found" />
  `;
}
