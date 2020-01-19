"use strict";

module.exports = {
  // 1. Run your custom tests along with all the default Lighthouse tests.
  extends: "lighthouse:default",

  // 3. Add custom audit to the list of audits 'lighthouse:default' will run.
  audits: [
    "cloudinary-auto-format-audit",
    "cloudinary-auto-quality-audit",
    "cloudinary-dpr-audit",
    "cloudinary-width-audit"
  ],

  categories: {
    cloudinary: {
      title: "Cloudinary",
      description: "Checks for proper use of Cloudinary service",
      auditRefs: [
        { id: "cloudinary-auto-format-audit", weight: 1 },
        { id: "cloudinary-auto-quality-audit", weight: 1 },
        { id: "cloudinary-dpr-audit", weight: 1 },
        { id: "cloudinary-width-audit", weight: 1 }
      ]
    }
  }
};
