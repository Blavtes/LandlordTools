//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var $ = require('Shared/Utilities/JQueryExt');
  var ENCPUtilities = require('Shared/Utilities/ENCPUtilities');

  var CLICKED_CONTAINER_SCALE = 0.95; //How much we scale a clicked container. Must match the value in Presentation.css's div.encp-mouse-down/up styles

  /**
   * ENCPMediaContents works as a base class of ENCPMediaContents.
   * It manages all media items in the presented note.
   * @param {ENCPPresenter} presenter
   * @constructor
   */
  function ENCPMediaContents(presenter) {
    this.platform = window.encpPlatform;
    this.isSimulatedOpening = false;
    this.presenter = presenter;
    this.openedMediaPath = null;
    this.platformContents = null; // Set this externally. TODO: Simplify dependencies here
  }
    
  /**
   * Setup media containers
   */
  ENCPMediaContents.prototype.setupMediaContainers = function() {
    var self = this;
    
    $(".encp-media-preview img").mousedown(function (event) {
      event.preventDefault();

      if (event.button == 0 && !event.ctrlKey && !self.isSimulatedOpening) {
        self.clickedContainer = $(event.currentTarget).closest('.encp-media-container')[0];
      
        self.animationEndListener = function (event) {
          self.isAnimatingContainer = false;
          invokeContainerClickedIfNeeded.call(self);
        };

        self.clickedContainer.addEventListener("webkitTransitionEnd", self.animationEndListener, false);
        
        setDisplaysClicked.call(self, self.clickedContainer, true);
      } else {
        $(this).trigger('mouseout');
      }
    });
    
    $("body").mouseup(function (event) {
      if (!self.clickedContainer || self.isSimulatedOpening) {
        return;
      }
      
      if ($(event.target).parents().andSelf().is("img, .encp-attachment-box")) {
        self.itemToInvoke = self.clickedContainer;
        invokeContainerClickedIfNeeded.call(self);
      } else {
        self.clickedContainer.removeEventListener("webkitTransitionEnd", self.animationEndListener);
      }
      
      self.clickedContainer = null;
    });
    
    $(".encp-media-preview img").mouseout(function (event) {
      var container = $(event.currentTarget).closest('.encp-media-container')[0];
      if (container == self.clickedContainer && !self.isSimulatedOpening) {
        setDisplaysClicked.call(self, self.clickedContainer, false);
      }
    });
    
    $(".encp-media-preview img").mouseenter(function (event) {
      var container = $(event.currentTarget).closest('.encp-media-container')[0];
      if (container == self.clickedContainer && !self.isSimulatedOpening) {
        setDisplaysClicked.call(self, self.clickedContainer, true);
      }
    });

    $(".encp-media-preview img").each(function () {
      self.setupMediaPreview(this);
    });
  }
  
  function invokeContainerClickedIfNeeded() {
    if (this.isAnimatingContainer == false && this.itemToInvoke != null) {
      this.openMediaItem(this.itemToInvoke);

      this.itemToInvoke.removeEventListener("webkitTransitionEnd", this.animationEndListener);
      setDisplaysClicked.call(this, this.itemToInvoke, false);

      this.itemToInvoke = null;
      this.animationEndListener = null;
    }
  }


  /**
   * Marks an element as being clicked
   * @param element
   * @param isClicked True if the element should appear moused down
   * @private
   */
  function setDisplaysClicked(element, isClicked) {
    var $element = $(element);
    this.isAnimatingContainer = true;
    if (isClicked) {
      $element.addClass("encp-mouse-down");
    } else {
      $element.removeClass("encp-mouse-down");
    }
  }

  /**
   * Get element frame
   * @param mediaElement
   * @param scale
   * @returns {{X: number, Y: number, Width: number, Height: number}}
   * @private
   */
  function getElementFrame(mediaElement, scale) {
    var $mediaElement = $(mediaElement);
    var offset = $mediaElement.offset();
    
    return {
      X: offset.left,
      Y: offset.top,
      Width: $mediaElement.width() * scale,
      Height: $mediaElement.height() * scale
    };
  }

  /**
   * Handle preparation to open media in document viewer from outside caller.
   * @param url
   */
  ENCPMediaContents.prototype.simulateOpeningMediaItem = function (url, index) {
    if (this.clickedContainer) {
      return;
    }

    var self = this;
    var images = document.querySelectorAll('.encp-can-open-attachment img[src="' + url + '"]');
  
    this.isSimulatedOpening = true;

    // TODO: Add index for duplicated image
    for (var i = 0, l = images.length; i < l; i++) {
      this.clickedContainer = $(images[i]).closest('.encp-media-container')[0];

      this.animationEndListener = function (event) {
        self.isAnimatingContainer = false;
        self.isSimulatedOpening = false;
        self.itemToInvoke = self.clickedContainer;
        invokeContainerClickedIfNeeded.call(self);
        self.clickedContainer = null;
      };

      this.clickedContainer.addEventListener("webkitTransitionEnd", this.animationEndListener, false);
      setDisplaysClicked.call(this, this.clickedContainer, true);
      break;
    }
  };

  /**
   * Handle preparation to open media in document viewer.
   * @param mediaNode
   */
  ENCPMediaContents.prototype.openMediaItem = function (mediaNode) {
    var $mediaNode = $(mediaNode);
    if (!$mediaNode.hasClass('encp-can-open-attachment')) {
      return;
    }
    var mediaFrame = getElementFrame($mediaNode.find('.encp-media-preview img').get(0), CLICKED_CONTAINER_SCALE);
    var mediaProperty = this.getMediaProperty($mediaNode.get());
    mediaProperty.mediaFrame = mediaFrame;
    this.openedMediaPath = mediaProperty.src;
    this.platform.didClickMediaWithParameters(mediaProperty);
  };

  /**
   * Get media frame for closing media from document viewer.
   * @param mediaPath
   * @returns {*}
   */
  ENCPMediaContents.prototype.getClosingMediaFrame = function (mediaPath) {
    var $imageNode = $(window.document.body).find("[data-media-url$='" + mediaPath + "'] .encp-media-preview img");
    if ($imageNode.length == 0) {
      return null;
    }
    var pathLength = this.openedMediaPath.length - mediaPath.length;
    if (pathLength < 0 || this.openedMediaPath.indexOf(mediaPath, pathLength) !== pathLength) {
      var scrollPosition = this.presenter.scrollPosition();
      if (!$imageNode.isOnScreen(scrollPosition)) {
        this.presenter.scrollIntoView($imageNode.get(0));
      }
    }
    $imageNode.closest('.encp-media-container').removeClass("encp-mouse-down"); // ensure the element is back to its default state
    this.openedMediaPath = null;
    return getElementFrame($imageNode.get(), 1);
  };

  /**
   * Handling image loading to update media container accordingly.
   * @param {HTMLImageElement} image
   * @param {function(number, number)} completionCallback
   */
  ENCPMediaContents.prototype.loadMediaImage = function (image, completionCallback) {
    var self = this;
    var $mediaElement = $(image).closest('.encp-media-container');
    var mediaProperty = self.getMediaProperty($mediaElement.get());
    self.platform.requestDocumentInformationForURL(
      encodeURI(mediaProperty.src),
      mediaProperty.mime,
      mediaProperty.filename,
      function (isDocument, numberOfPages, width, height) {
        // success callback
        completionCallback(width, height);
      },
      function () {
        // error callback
        completionCallback(Math.NaN, Math.NaN);
      }
    );
  };

  /**
   * Get property of a given media.
   * @param mediaElement
   * @returns {{src: string, mime: string, filename: string}}
   */
  ENCPMediaContents.prototype.getMediaProperty = function (mediaElement) {
    var $mediaElement = $(mediaElement);
    return {
      src: $mediaElement.attr("data-media-url"),
      mime: $mediaElement.attr("data-media-mime"),
      filename: $mediaElement.attr("data-media-filename")
    }
  };

  /**
   * Get All available media items.
   * @returns {Array}
   */
  ENCPMediaContents.prototype.getMediaItems = function () {
    var self = this;
    var items = [];
    $(".encp-media-container").each(function () {
      var mediaProperty = self.getMediaProperty(this);
      if (mediaProperty.src && mediaProperty.mime) {
        items.push(mediaProperty);
      }
    });
    return items;
  };

  /**
   * Setup media container for preview image.
   * @param {HTMLImageElement} image
   */
  ENCPMediaContents.prototype.setupMediaPreview = function (image) {
    if (this.platformContents.setupMediaPreview) {
      var $container = $(image).closest('.encp-media-container');
      var mediaProperty = this.getMediaProperty($container.get(0));
      this.platformContents.setupMediaPreview(image, mediaProperty);
    }
  };

  /**
   * Adjust size of image in media containers if necessary.
   * TODO: This method may belong to ENCPImageLayout
   */
  ENCPMediaContents.prototype.adjustMediaImages = function () {
    if (this.platformContents.adjustMediaImages) {
      this.platformContents.adjustMediaImages();
    }
  };

  /**
   * Update information of a given media item (it will update preview of media item depends on its status).
   * @param {{
   *    identifier: string,
   *    filename: string,
   *    iconURL: string,
   *    previewURL: string,
   *    mimetype: string,
   *    canOpen: boolean,
   *    canPlay: boolean,
   *    loadProgress: number,
   *    title: string,
   *    information: string}} item
   */
  ENCPMediaContents.prototype.updateMediaItem = function (item) {
    if (this.platformContents.updateMediaItem) {
      this.platformContents.updateMediaItem(item);
    }
  };

  return ENCPMediaContents;
});
