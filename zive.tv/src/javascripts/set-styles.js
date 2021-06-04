export default function setStyles(params) {
  const setCssProperty = name =>
    document.documentElement.style.setProperty(`--${name}`, params.get(name));

  const allowedProperties = [
    "color",
    "background-color",
    "font-family",
    "font-size",
    "font-weight"
  ];
  for (const prop of allowedProperties) {
    if (params.has(prop)) setCssProperty(prop);
  }

  if (params.has("gfonts")) {
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?${new URLSearchParams({
      family: params.get("gfonts"),
      display: "swap"
    })}`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
}
