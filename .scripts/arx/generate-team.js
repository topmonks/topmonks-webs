const fs = require("fs");
const path = require("path");
const slugify = require("slugify");

const data = [
  {
    name: "Brian Wardrop",
    title: "Managing Partner",
    location: "",
    image:
      "https://www.arxequity.com/wp-content/uploads/2016/05/Wardrop_Brian_mod-e1464296711799.jpg",
    "ARX Current Portfolio Responsibility": "TMX, TES Vsetin, Gramex Drinks",
    "ARX Past Portfolio Responsibility":
      "Tomplast, Lanex, Lexum, Flanco, Donit Tesnit, Manag, KVK, Fincentrum, Bochemie, DC Bled",
    "ARX since": "2002",
    "Past Employers": "Baring Communications Equity",
    Education:
      "Boston University (Master’s, Administration), Bishop’s University (B.A., Political Science), Harvard Business School (OPM)",
    "E-mail": "wardrop@arxequity.com"
  },
  {
    name: "Michal Aron",
    title: "Partner",
    location: "",
    image:
      "https://www.arxequity.com/wp-content/uploads/2016/05/Aron_Michal_mod-e1464296443435.jpg",
    "ARX Current Portfolio Responsibility": "Deva Nutrition, TES Vsetin",
    "ARX Past Portfolio Responsibility": "Manag, Fincentrum, Bochemie",
    "ARX since": "2012",
    "Past Employers":
      "Advent International, Dresdner Kleinwort Capital, Baring Communications Equity",
    Education: "C.S. Institute (Corporate Management Degree)",
    "E-mail": "aron@arxequity.com"
  },
  {
    name: "Tomáš Lánský",
    title: "Partner",
    location: "",
    image:
      "https://www.arxequity.com/wp-content/uploads/2016/05/Lansky_Tomas_mod-e1464295537212.jpg",
    "ARX Current Portfolio Responsibility": "Wieden",
    "ARX Past Portfolio Responsibility":
      "Tomplast, Lanex, Lexum, Cenega, KVK, VUES",
    "ARX since": "1999",
    "Past Employers": "Atlantik Corporate Finance",
    Education: "University of Pittsburgh (MBA), Masaryk University (BA)",
    "E-mail": "lansky@arxequity.com"
  },
  {
    name: "Béla Lendvai-Lintner",
    title: "Partner",
    location: "",
    image:
      "https://www.arxequity.com/wp-content/uploads/2016/05/Lendvai-Lintner_Bela_mod-e1464296862792.jpg",
    "ARX Current Portfolio Responsibility": "Gramex, TMX",
    "ARX Past Portfolio Responsibility":
      "AXON, Flanco, Donit Tesnit, Hungarocamion, DC Bled",
    "ARX since": "2001",
    "Past Employers": "KPMG",
    Education:
      "The Ohio State University (Bachelor of Science of Business Administration / Finance)",
    "E-mail": "lintner@arxequity.com"
  },
  {
    name: "Radil Stefovski",
    title: "Investment Director",
    location: "",
    image:
      "https://www.arxequity.com/wp-content/uploads/2016/05/Stefovski_Radil_mod-1-e1464295124371.jpg",
    "ARX Current Portfolio Responsibility": "Gramex, Deva Nutrition, TMX",
    "ARX Past Portfolio Responsibility": "KVK, Fincentrum, DC Bled",
    "ARX since": "2007",
    "Past Employers": "WestLB",
    Education:
      "Varna University of Economics (Bachelor in Accounting); Humboldt University and University of Potsdam (Master of Finance)",
    "E-mail": "stefovski@arxequity.com"
  },
  {
    name: "Ivana Tesařová",
    title: "Investment Manager",
    location: "",
    image:
      "https://www.arxequity.com/wp-content/uploads/2018/02/Tesarova_Ivana-portrait-e1519036625406.jpg",
    "ARX Current Portfolio Responsibility": "Wieden",
    "ARX Past Portfolio Responsibility": "-",
    "ARX since": "2017",
    "Past Employers":
      "Grant Thornton Advisory, PPF Real Estate, PPF Investments",
    Education:
      "University of Economics in Prague (MSc), Richmond University in London (MBA), CFA",
    "E-mail": "tesarova@arxequity.com"
  },
  {
    name: "David Swaim",
    title: "Analyst",
    location: "",
    image:
      "https://www.arxequity.com/wp-content/uploads/2016/11/Swaim_David_2.jpg",
    "ARX Current Portfolio Responsibility": "Deva Nutrition, TMX",
    "ARX Past Portfolio Responsibility": "-",
    "ARX since": "2016",
    "Past Employers": "-",
    Education:
      "University of North Carolina (Bachelor of Business Administration)",
    "E-mail": "swaim@arxequity.com"
  },
  {
    name: "Martin Medo",
    title: "Analyst",
    location: "",
    image:
      "https://www.arxequity.com/wp-content/uploads/2018/07/Medo_Martin-portrait-e1533031312338.jpg",
    "ARX Current Portfolio Responsibility": "TES Vsetin",
    "ARX Past Portfolio Responsibility": "",
    "ARX since": "2018",
    "Past Employers": "Slovnaft, PwC",
    Education: " University of Economics in Prague (Msc)",
    "E-mail": "medo@arxequity.com"
  },
  {
    name: "Jaroslav Horák",
    title: "Investment Committee Chairman",
    location: "",
    image:
      "https://www.arxequity.com/wp-content/uploads/2016/05/Horak_Jaroslav_mod-e1464296083763.jpg",
    "ARX Current Portfolio Responsibility": "",
    "ARX Past Portfolio Responsibility":
      "Cenega, Hungarocamion, Czech On Line, VUES",
    "ARX since": "1996",
    "Past Employers": "Banexi Prague / BNP Group",
    Education:
      "Prague School of Economics (Master’s Degree), Institute of Economics, Prague (PhD)",
    "E-mail": "praha@arxequity.com"
  },
  {
    name: "Jacek Korpała",
    title: "Co-Managing Partner Fund II&III",
    location: "",
    image:
      "https://www.arxequity.com/wp-content/uploads/2016/05/Korpala_Jacek_mod-e1464295709996.jpg",
    "ARX Current Portfolio Responsibility": "Anwis, Komex",
    "ARX Past Portfolio Responsibility":
      "Kakadu, Ergis, Cenega, PWN, Print Polska",
    "ARX since": "1998",
    "Past Employers": "Arthur Andersen (Partner), Ministry of Privatization",
    Education: "Warsaw School of Economics (MSc)",
    "E-mail": "korpala@arxequity.com"
  }
];

const files = data.map((teamMember, index) => {
  const { title, name, image } = teamMember;
  const slug = slugify(name);
  const markdown = `---
name: ${name}
title: ${title}
image: ${image}
email: ${teamMember["E-mail"]}
education: ${teamMember["Education"]}
previousEmployer: ${teamMember["Past Employers"]}
startYear: ${teamMember["ARX since"]}
pastResponsibility: ${teamMember["ARX Past Portfolio Responsibility"]}
currentResponsibility: ${teamMember["ARX Current Portfolio Responsibility"]}
---
`;
  return { index, markdown, slug };
});

for (let { index, slug, markdown } of files) {
  fs.writeFileSync(
    path.resolve(
      `./arx.monks.cloud/src/data/team/${index}-${slug.toLowerCase()}.md`
    ),
    markdown
  );
}
