"use strict";

const { Audit } = require("lighthouse");

class CloudinaryDprAudit extends Audit {
  static get meta() {
    return {
      id: 'cloudinary-dpr-audit',
      title: 'Cloudinay images use Device Pixel Ratio optimization',
      failureTitle: 'Cloudinary Device Pixel Ratio optimization `dpr_` is not used.',
      description: 'Device Pixel Ratio optimizationof Cloudinary images helps ' +
        'to deliver the best experience for end users. ' +
        '[Learn more](https://cloudinary.com/blog/how_to_automatically_adapt_website_images_to_retina_and_hidpi_devices)',

      // The name of the custom gatherer class that provides input to this audit.
      requiredArtifacts: ['ImageElements'],
    };
  }

  static audit(artifacts) {
    const cloudinaryImages = artifacts.ImageElements.filter(
      x => x.src.indexOf("https://res.cloudinary.com") === 0
    );
    const noDpr = cloudinaryImages.filter(
      x => x.src.indexOf("dpr_") === -1
    );
    const passed = noDpr.length === 0;

    return {
      score: Number(passed),
      warnings: noDpr.map(x => `A Cloudinary image "${x.src}" was found, but "dpr_" transformation is missing.`)
    };
  }
}

module.exports = CloudinaryDprAudit;
