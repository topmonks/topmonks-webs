"use strict";

const { Audit } = require("lighthouse");

class CloudinaryWidthAudit extends Audit {
  static get meta() {
    return {
      id: 'cloudinary-width-audit',
      title: 'Cloudinay images are properly sized',
      failureTitle: 'Cloudinary resize transformation `w_` is not used.',
      description: 'Resize of Cloudinary images helps to deliver the best' +
        ' experience for end users. ' +
        '[Learn more](https://cloudinary.com/documentation/image_optimization#responsive_image_sizing)',

      // The name of the custom gatherer class that provides input to this audit.
      requiredArtifacts: ['ImageElements'],
    };
  }

  static audit(artifacts) {
    const cloudinaryImages = artifacts.ImageElements.filter(
      x => x.src.indexOf("https://res.cloudinary.com") === 0
    );
    const noDpr = cloudinaryImages.filter(
      x => x.src.indexOf("w_") === -1
    );
    const passed = noDpr.length === 0;

    return {
      score: Number(passed),
      warnings: noDpr.map(x => `A Cloudinary image "${x.src}" was found, but "w_" transformation is missing.`)
    };
  }
}

module.exports = CloudinaryWidthAudit;
