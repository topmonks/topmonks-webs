"use strict";

const { Audit } = require("lighthouse");

class CloudinaryAutoFormatAudit extends Audit {
  static get meta() {
    return {
      id: 'cloudinary-auto-format-audit',
      title: 'Cloudinay images use auto-format feature',
      failureTitle: 'Cloudinary auto-format feature `f_auto` is not used.',
      description: 'Auto-format of Cloudinary images helps to deliver the best' +
        ' experience for end users. ' +
        '[Learn more](https://cloudinary.com/blog/adaptive_browser_based_image_format_delivery#selecting_the_optimal_image_format_f_auto)',

      // The name of the custom gatherer class that provides input to this audit.
      requiredArtifacts: ['ImageElements'],
    };
  }

  static audit(artifacts) {
    const cloudinaryImages = artifacts.ImageElements.filter(
      x => x.src.indexOf("https://res.cloudinary.com") === 0
    );
    const noAutoFormat = cloudinaryImages.filter(
      x => x.src.indexOf("f_auto") === -1
    );
    const passed = noAutoFormat.length === 0;

    return {
      score: Number(passed),
      warnings: noAutoFormat.map(x => `A Cloudinary image "${x.src}" was found, but "f_auto" transformation is missing.`)
    };
  }
}

module.exports = CloudinaryAutoFormatAudit;
