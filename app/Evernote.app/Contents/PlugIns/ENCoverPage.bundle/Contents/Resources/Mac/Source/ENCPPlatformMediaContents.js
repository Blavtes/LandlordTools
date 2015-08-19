//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var $ = require('Shared/Utilities/JQueryExt');

  /**
   * ENCPPlatformMediaContents manages media items with Mac specific features
   * @param {ENCPMediaContents} mediaContents
   * @constructor
   */
  function ENCPPlatformMediaContents(mediaContents) {
    this.mediaContents = mediaContents;
  }

  /**
   * Append shadow image for media preview.
   * @param $image
   * @param numberOfPages
   * @private
   */
  function appendDocumentShadowsToImage($image, numberOfPages) {
    $image.addClass("encp-document");
    $image.wrap($("<div class='encp-media-container-document'></div>"));
    var theContainer = $image.parent();
    if (numberOfPages > 2) {
      theContainer.prepend($("<div class='encp-shadow encp-second-shadow'></div>"));
    }
    if (numberOfPages > 1) {
      theContainer.prepend($("<div class='encp-shadow encp-first-shadow'></div>"));
    }
  }

  /**
   * Setup media container for preview image.
   * @param {HTMLImageElement} image
   * @param {{src: string, mime: string, filename: string}} mediaProperty
   */
  ENCPPlatformMediaContents.prototype.setupMediaPreview = function (image, mediaProperty) {
    var self = this;
    var $image = $(image);
    self.mediaContents.platform.requestDocumentInformationForURL(
      encodeURI(mediaProperty.src),
      mediaProperty.mime,
      mediaProperty.filename,
      function (isDocument, numberOfPages, width, height, predefinedName) {
        // success callback
        if (isDocument) {
          appendDocumentShadowsToImage($image, numberOfPages);
        }
        self.mediaContents.presenter.imageLayout.setImageBaseSize(image, width, height);
        if (predefinedName) {
          $image.addClass('encp-predefined-preview');
          $image.addClass('encp-preview-' + predefinedName.replace(/[A-Z]/,function(match){ return '-' + match.toLowerCase(); }));
        }
      },
      function () {
        // error callback
      }
    );
  };

  return ENCPPlatformMediaContents;
});
