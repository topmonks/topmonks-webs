const fs = require("fs");
const path = require("path");

const data = [
  {
    title: "TES Vsetin",
    description:
      "TES designs and manufactures proprietary machines, such as generators and electric motors, and related components. TES possesses fully integrated capabilities ranging from own design through in-house manufacturing and assembly, to testing, installation and certification of final own products.",
    Country: "Czech Republic",
    Transaction: "MBO",
    "Investment year": "2019",
    Status: "Current",
    Business: "Manufacturer of electrical machines and related components",
    Website: "http://www.tes.cz"
  },
  {
    title: "Fontana",
    description:
      "Medical Thermal Centre Fontana comprises 17 specialized outpatient services, supplemented by radiology diagnostics and a well equipped diagnostics laboratory.",
    Country: "Slovenia",
    Transaction: "Add-on to DC Bled",
    "Investment year": "2019",
    Status: "Current",
    Business: "Diagnostic healthcare clinic operator",
    Website: "https://www.fontana.si/"
  },
  {
    title: "Skanska LOP",
    description:
      "Provider of complex aluminium-glass façade solutions, including design, production and installation, serving both local and international markets.",
    Country: "Czech Republic",
    Transaction: "Add-on to Wieden",
    "Investment year": "2019",
    Status: "Current",
    Business: "Aluminium-glass façade solutions",
    Website: "https://www.wieden.cz/"
  },
  {
    title: "Wieden",
    description:
      "Provider of complex aluminium-glass façade solutions, including design, production and installation, serving both local and international markets.",
    Country: "Czech Republic",
    Transaction: "Buyout",
    "Investment year": "2019",
    Status: "Current",
    Business: "Aluminium-glass façade solutions",
    Website: "https://www.wieden.cz/"
  },
  {
    title: "TMX Mobile Solution",
    description:
      "Provider of mobile phone repairs, localization, software installation and logistics services for OEM warranty clients and insurance providers in domestic and international markets.",
    Country: "Hungary",
    Transaction: "Buyout",
    "Investment year": "2018",
    Status: "Current",
    Business: "Mobile phone after-sales services",
    Website: "http://www.tmx.hu"
  },
  {
    title: "Deva Nutrition",
    description:
      "Deva Nutrition is a former Danone-owned high-quality facility producing baby fruit desserts and fruit drinks in glass jars and glass bottles possessing strong fresh fruit processing competencies and multiple bio and organic certifications.",
    Country: "Czech Republic",
    Transaction: "Buyout",
    "Investment year": "2017",
    Status: "Current",
    Business: "FMCG (baby food)",
    Website: "http://www.deva.cz"
  },
  {
    title: "Diagnostic Center Bled",
    description:
      "DC Bled is the largest private healthcare service operator in Slovenia providing comprehensive outpatient and inpatient medical services and laboratory diagnostics in four locations.",
    Country: "Slovenia",
    Transaction: "buy-and-build",
    "Investment year": "2015",
    Status: "Realised",
    Business: "Diagnostic healthcare clinics operator",
    Website: "http://www.dc-bled.si"
  },
  {
    title: "Anwis",
    description:
      "Anwis is a producer of custom-made interior window coverings and window covering related components. Its offer includes dozens of products within own and third-party interior and exterior systems, including: horizontal, vertical, roller and pleated blinds.",
    Country: "Poland",
    Transaction: "MBI",
    "Investment year": "2014",
    Status: "Realized",
    Business: "Manufacturer of window covers and related components",
    Website: "http://www.anwis.pl"
  },
  {
    title: "Gramex Drinks",
    description:
      "Gramex Drinks is bottler of soft drinks and fruit juices for retailers and A-brand producers utilizing PET packaging. Drinks include carbonated soft drinks, fruit beverages, ready-to-drink iced-teas, lemonades, energy drinks, sports drinks, and syrups.",
    Country: "Hungary",
    Transaction: "MBI",
    "Investment year": "2014",
    Status: "Current",
    Business: "Soft drinks bottler",
    Website: "http://www.gramexdrinks.com"
  },
  {
    title: "Fincentrum",
    description:
      "Fincentrum is a financial advisory company, based in the Czech and Slovak Republics. The core of its business is independent financial advisory to households and private individuals.",
    Country: "Czech Republic ",
    Transaction: "Buy-out",
    "Investment year": "2013",
    Status: "Realized",
    Business: "Independent financial advisory",
    Website: "http://www.fincentrum.com"
  },
  {
    title: "Manag",
    description:
      "Manag is focused on design, manufacturing and assembly of low- and high-power electrical equipment and related measurement, regulation and control systems for all types of operating environments.",
    Country: "Czech Republic ",
    Transaction: "Succession/MBI",
    "Investment year": "2011",
    Status: "Realized",
    Business: "Industrial measurement and control systems",
    Website: "http://www.manag.com"
  },
  {
    title: "Biolit",
    description:
      "At the time Bochemie acquired the Biolit brand it was the largest insecticides brand in the Czech and Slovak Republics.",
    Country: "Czech Republic ",
    Transaction: "Add-on to Bochemie",
    "Investment year": "2011",
    Status: "Realized",
    Business: "Insecticides"
  },
  {
    title: "KRPA Dechtochema",
    description:
      "At the time KVK acquired KRPA it was the largest Czech bitumen sheets producer which combined with the Parabit division (which was the strong number two at that time) allowed KVK to become the dominant market player and realize significant sales, purchasing and production synergies.",
    Country: "Czech Republic ",
    Transaction: "Add-on to KVK",
    "Investment year": "2011",
    Status: "Realized",
    Business: "Construction materials",
    Website: "http://www.kvkparabit.com"
  },
  {
    title: "Penopol",
    description:
      "At the time KVK acquired Penopol it was a medium-sized producer of external insulation materials for walls and roofs applications. The Penopol acquisition allowed KVK to add complementary expanded polystyrene sheets to its product range and to develop a closed system of insulation solutions which completely eliminate wet processes.",
    Country: "Czech Republic",
    Transaction: "Add-on to KVK",
    "Investment year": "2011",
    Status: "Realized",
    Business: "Construction materials",
    Website: "http://www.penopol.cz"
  },
  {
    title: "TeleKarma",
    description:
      "At the time that Kakadu acquired TeleKarma, it was the largest Polish internet retailer of pet products.",
    Country: "Poland",
    Transaction: "Add-on to Kakadu",
    "Investment year": "2010",
    Status: "Realized",
    Business: "Online pet store"
  },
  {
    title: "Bochemie",
    description:
      "Bochemie was a diversified consumer and specialty chemicals company, with a product portfolio including  bleach, kitchen, bathroom & universal cleaners, anti-mildew products, hand dishwashing products and laundry bleaches. Due to its long-term tradition, Bochemie’s multiproduct brand SAVO was a household name in the Czech Republic and Slovakia while the Hungarian brand ULTRA had a similar position in its market.",
    Country: "Czech Republic ",
    Transaction: "Buy and Build",
    "Investment year": "2010",
    Status: "Realised",
    Business: "Household care and specialty chemicals"
  },
  {
    title: "KVK",
    description:
      "KVK is a construction materials business operating in the Czech Republic. KVK’s products consist primarily of mortars, adhesives and bitumen membranes. KVK also operates two quarries.",
    Country: "Czech Republic ",
    Transaction: "Succession/MBO",
    "Investment year": "2010",
    Status: "Realized",
    Business: "Construction materials",
    Website: "http://www.kvkholding.com"
  },
  {
    title: "Intermedica",
    description:
      "Intermedica was an add-on acquisition for Lexum, which has integrated into Lexum. At the time Intermedica was the largest eye clinic network in Poland.",
    Country: "Poland",
    Transaction: "Add-on to Lexum",
    "Investment year": "2010",
    Status: "Realized",
    Business: "Healthcare (ophthalmology clinics operator)"
  },
  {
    title: "Lexum",
    description:
      "Lexum was the leading Czech eye surgery clinic with operations in three cities at the time of the initial ARX investment.  At exit, Lexum was operating 10 clinics in the Czech Republic and Poland.",
    Country: "Czech Republic ",
    Transaction: "Succession/MBO",
    "Investment year": "2009",
    Status: "Realized",
    Business: "Healthcare (ophthalmology clinics operator)"
  },
  {
    title: "Kakadu",
    description:
      "Kakadu was the leading retailer of pet products in Poland. During the term of the ARX investment in Kakadu, the company acquired and integrated the leading Polish internet retailer of pet products.",
    Country: "Poland",
    Transaction: "Buy and Build",
    "Investment year": "2009",
    Status: "Realized",
    Business: "Pet store operator"
  },
  {
    title: "Unitplast",
    description:
      "Unitplast was an add-on for Tomplast. Unitplast was a Slovenian manufacturer of plastic injection moulded components, which primarily served export markets.",
    Country: "Slovenia",
    Transaction: "Add-on to Tomplast",
    "Investment year": "2008",
    Status: "Current",
    Business: "Rubber and plastic components"
  },
  {
    title: "Lanex",
    description:
      "Lanex was a specialized producer of ropes and fibres with wide assortment range covering climbing, industrial safety, marine and hobby applications. Lanex products were exported globally and the company was among the top five global producers in certain product categories.",
    Country: "Czech Republic ",
    Transaction: "Succession/MBO",
    "Investment year": "2008",
    Status: "Realized",
    Business: "Manufacturer of ropes and flexible packaging"
  },
  {
    title: "Singing Rock",
    description:
      "At the time of Lanex’s acquisition of Singing Rock, it was the leading Czech producer of climbing harnesses and related assortment for both industrial and sport applications, with significant global market share in its target markets.",
    Country: "Czech Republic ",
    Transaction: "Add-on to Lanex",
    "Investment year": "2008",
    Status: "Realized",
    Business: "Producer of climbing and fall protection equipment"
  },
  {
    title: "Tomplast",
    description:
      "Tomplast was a Slovenian producer of plastic components primarily for the automotive industry, which primarily served export markets.",
    Country: "Slovenia",
    Transaction: "MBI",
    "Investment year": "2007",
    Status: "Realized",
    Business: "Manufacturer of plastic-moulded components"
  },
  {
    title: "AXON",
    description:
      "AXON was the largest non-bank owned financial leasing company in Hungary. AXON also owned and operated a separate real estate leasing company and an operational leasing business.",
    Country: "Hungary",
    Transaction: "Expansion",
    "Investment year": "2007",
    Status: "Realized",
    Business: "Leasing and financial services"
  },
  {
    title: "5.10.15 (Komex)",
    description:
      "5.10.15 is a leading Polish retailer of children’s apparel. 5.10.15 operates its own retail network in addition to significant franchise and internet channels.",
    Country: "Poland",
    Transaction: "MBO/Expansion",
    "Investment year": "2006",
    Status: "Current",
    Business: "Children’s clothing retailer",
    Website: "http://www.51015kids.eu"
  },
  {
    title: "Donit Tesnit",
    description:
      "Donit Tesnit was a leading European producer of industrial gasket sealing material and finished industrial gaskets, which were used for static sealing applications in sectors such as the power and petrochemical industries.",
    Country: "Slovenia",
    Transaction: "Succession/MBO",
    "Investment year": "2006",
    Status: "Realized",
    Business: "Producer of gasket material and industrial gaskets"
  },
  {
    title: "VUES",
    description:
      "VUES is a producer of custom made electrical motors, servomotors, linear motors and for multiple industries in export markets. VUES’ products possess a high degree of specialized design and development, which are not met by standard mass-produced products.",
    Country: "Czech Republic ",
    Transaction: "Succession/MBO",
    "Investment year": "2006",
    Status: "Realized",
    Business: "Manufacturer of specialized electric motors",
    Website: "http://www.vues.cz"
  },
  {
    title: "Flanco",
    description:
      "Flanco was one of the largest retailers of consumer home electronics and white goods in Romania.",
    Country: "Romania",
    Transaction: "Buy-out",
    "Investment year": "2004",
    Status: "Realized",
    Business: "IT and household electricals retailer and distributor"
  },
  {
    title: "Ergis",
    description:
      "Ergis was a plastics processing firm with six manufacturing plants, with four situated in Poland and two in Germany. It primarily manufactured packaging for food (PET and PVC based barrier laminates and films and printed multilayer laminates) and industrial packaging (LLDPE stretch films, thermo-shrinking PVC films and PET straps).",
    Country: "Poland",
    Transaction: "MBO",
    "Investment year": "2003",
    Status: "Realized",
    Business: "Plastics processor"
  },
  {
    title: "Insty-Prints (Print Polska)",
    description:
      "Print Polska was a quick printing business operating quick printing services on the basis of master franchise agreement with US-based Insty Prints.",
    Country: "Poland",
    Transaction: "Expansion",
    "Investment year": "2000",
    Status: "Realized",
    Business: "Insty-Prints’ quick printing Master Franchise"
  },
  {
    title: "Cenega",
    description:
      "Cenega was the largest distributor of computer games in Central Europe, operating in the Czech Republic, Poland, Slovakia and Hungary.",
    Country: "Czech Republic ",
    Transaction: "Expansion",
    "Investment year": "2000",
    Status: "Realized",
    Business: "Publisher and distributor of computer games"
  },
  {
    title: "Hungarocamion",
    description:
      "Hungarocamion was the largest international transportation provider in Central Eastern Europe, which offered a wide range of services, including transportation management, international road transport, distribution and logistics, groupage and freight forwarding, as well as customs and border services.",
    Country: "Hungary",
    Transaction: "MBI/Expansion",
    "Investment year": "1998",
    Status: "Realized",
    Business: "Trucking and logistics firm"
  },
  {
    title: "PWN",
    description:
      "PWN was a leading Polish publishing business offering scientific, educational and professional titles, such as dictionaries, encyclopaedias and textbooks.",
    Country: "Poland",
    Transaction: "Buy-out/Expansion",
    "Investment year": "1998",
    Status: "Realized",
    Business: "Publishing group"
  },
  {
    title: "Czech on Line",
    description:
      "Czech On Line was the largest commercial Internet service provider in the Czech Republic.",
    Country: "Czech Republic ",
    Transaction: "MBO/Expansion",
    "Investment year": "1998",
    Status: "Realized",
    Business: "Telecom and internet service provider"
  }
];

const files = data.reverse().map((investment, index) => {
  const { title, description } = investment;
  const markdown = `---
title: "${title}"
country: ${investment["Country"]}
transaction: ${investment["Transaction"]}
year: ${investment["Investment year"]}
status: ${investment["Status"]}
business: "${investment["Business"]}"
website: ${investment["Website"] ?? ""}
---

${description}
`;
  return { index, markdown };
});

for (let { index, markdown } of files) {
  fs.writeFileSync(
    path.resolve(`./arx.monks.cloud/src/data/investments/${index}.md`),
    markdown
  );
}
