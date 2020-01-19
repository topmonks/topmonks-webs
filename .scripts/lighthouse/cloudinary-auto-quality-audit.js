"use strict";

const { Audit } = require("lighthouse");

class CloudinaryAutoQualityAudit extends Audit {
  static get meta() {
    return {
      id: 'cloudinary-auto-quality-audit',
      title: 'Cloudinay images use auto-quality feature',
      failureTitle: 'Cloudinary auto-quality feature `q_auto` is not used.',
      description: 'Auto-quality of Cloudinary images helps to deliver the best' +
        ' experience for end users. ' +
        '[Learn more](https://cloudinary.com/blog/adaptive_browser_based_image_format_delivery#reduce_image_size_without_losing_quality)',

      // The name of the custom gatherer class that provides input to this audit.
      requiredArtifacts: ['ImageElements'],
    };
  }

  static audit(artifacts) {
    const cloudinaryImages = artifacts.ImageElements.filter(
      x => x.src.indexOf("https://res.cloudinary.com") === 0
    );
    const noAutoQuality = cloudinaryImages.filter(
      x => x.src.indexOf("q_auto") === -1
    );
    const passed = noAutoQuality.length === 0;

    return {
      score: Number(passed),
      warnings: noAutoQuality.map(x => `A Cloudinary image "${x.src}" was found, but "q_auto" transformation is missing.`)
    };
  }
}

module.exports = CloudinaryAutoQualityAudit;
