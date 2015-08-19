//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var $ = require('Shared/Utilities/JQueryExt');
  var ENCPSectionBreak = require('Shared/LayoutEditor/ENCPSectionBreak');

  /**
   * ENCPImageLayout handles image layout and captions
   * @param {boolean} shouldRunSetup - true if it requires to run preparation for layout procedure.
   * @constructor
   */
  function ENCPImageLayout(shouldRunSetup) {
    this.pageSummary = [];
    this.isResponsiveLayout = false;
    this.canHandleCaptions = false;
    if (shouldRunSetup) {
      setupTextNodes();
      setupTables();
      this.canHandleCaptions = true;
    }
  }

  var INLINE_IMAGE_THRESHOLD = 200;
  var REFERENCE_SCREEN_RESOLUTION = 1440;
  var MAX_IMG_WIDTH_RATIO_IN_TABLE = 1.3;
  var MAX_IMG_HEIGHT_RATIO_IN_TABLE = 0.9;

  var CAPTION_HEADER = 'encp-media-caption-header';
  var CAPTION_FOOTER = 'encp-media-caption-footer';
  var CAPTION_DATA_ATTRIBUTE = 'data-encp-media-caption';
  var CURSOR_ID = 'en-editor-last-insertion-point';

  var WITH_PADDING = 'encp-media-with-padding';
  var LINE_SPACER = 'encp-line-spacer';
  var HIDDEN_LINE_SPACER = 'encp-hidden-line-spacer';

  var BASE_WIDTH = 'data-encp-base-width';
  var BASE_HEIGHT = 'data-encp-base-height';

  /**
   * Setup text nodes to make them accessible via DOM.
   * @private
   */
  function setupTextNodes() {
    // Adding minimal-text elements to make sure all text accessible via DOM.
    // TODO: need optimization! The following code will take O(n^2) against number of elements in window.document.
    // So we need to improve the following operation to reduce complexity.
    $('*:visible').each(function() {
      $(this).contents().filter(function() {
        var sibling = this.nextSibling || this.previousSibling;
        if (sibling && sibling.id == CURSOR_ID) {
          sibling = null;
        }
        return (this.nodeType == Node.TEXT_NODE && this.nodeValue.trim().length > 0 && sibling);
      }).wrap('<span class="encp-minimal-text"/>');
    });
  }

  /**
   * Setup empty lines
   * @private
   */
  function setupEmptyLines() {
    // Reset hidden line spacer
    $("." + HIDDEN_LINE_SPACER).removeClass(HIDDEN_LINE_SPACER);

    // CP-1848: line spacing.
    $('* > br:only-child').each(function(index, element) {
      var parent = element.parentElement;
      if (!parent.textContent.length) {
        parent.classList.add(LINE_SPACER);
      }
    });
  };

  /**
   * Setup tables in the note
   */
  function setupTables() {
    $('table').each(function() {
      var $this = $(this);
      if ($this.parent('table').length == 0) {
        $this.wrap('<div class="encp-table-container"/>');
      }
      var $firstRow = $this.find('tr:first-child');
      if (!$firstRow.has('img').length) {
        $firstRow.addClass('encp-header-row');
      }
    });
  }

  /**
   * Fit height into reference value.
   * @param {{width: number, height: number}} target
   * @param {{width: number, height: number}} reference
   * @private
   */
  function fitHeight(target, reference) {
    target.width *= reference.height / target.height;
    target.height = reference.height;
  }

  /**
   * Fit width into reference value.
   * @param {{width: number, height: number}} target
   * @param {{width: number, height: number}} reference
   * @private
   */
  function fitWidth(target, reference) {
    target.height *= reference.width / target.width;
    target.width = reference.width;
  }

  /**
   * Check whether a given element can be caption or not.
   * @param $target
   * @returns {boolean}
   */
  function canBeCaption($target) {
    return (
      !$target.is('.encp-checkbox + .encp-minimal-text') &&
      $target.closest('li').length == 0 &&
      $target.closest('tr').length == 0
    );
  }

  /**
   * Property information for captions.
   * @type {{PAGE_INDEX: number, HEADER: number, FOOTER: number}}
   */
  var CAPTION_PROPETY = {
    PAGE_INDEX: 0,
    HEADER: 1,
    FOOTER: 2
  };

  /**
   * Get height of captions for a given target.
   * @param $target - jQuery object to be given.
   * @returns {number} height of captions.
   * @private
   */
  function getCaptionHeight($target) {
    var captionHeight = 0;
    var captionInfo = null;
    if ($target.attr(CAPTION_DATA_ATTRIBUTE)) {
      captionInfo = JSON.parse($target.attr(CAPTION_DATA_ATTRIBUTE));
    }
    if (captionInfo && captionInfo.length === Object.keys(CAPTION_PROPETY).length) {
      if (captionInfo[CAPTION_PROPETY.HEADER]) {
        captionHeight += $('#' + CAPTION_HEADER + '-' + captionInfo[CAPTION_PROPETY.PAGE_INDEX]).outerHeight();
      }
      if (captionInfo[CAPTION_PROPETY.FOOTER]) {
        captionHeight += $('#' + CAPTION_FOOTER + '-' + captionInfo[CAPTION_PROPETY.PAGE_INDEX]).outerHeight();
      }
    }
    return captionHeight;
  }

  /**
   * Get page index which a given belongs to
   * @param $target
   * @returns {undefined|number} page index if available no otherwise
   */
  function getPageIndex($target) {
    var captionInfo = null;
    if ($target.attr(CAPTION_DATA_ATTRIBUTE)) {
      captionInfo = JSON.parse($target.attr(CAPTION_DATA_ATTRIBUTE));
    }
    if (captionInfo && captionInfo.length === Object.keys(CAPTION_PROPETY).length) {
      return captionInfo[CAPTION_PROPETY.PAGE_INDEX];
    }
    return undefined;
  }

  /**
   * Get styles for a given image/table to set its top and bottom margins (for captions).
   * @param $target
   * @param screenHeight
   * @returns {*}
   */
  function getTargetMarginForCaption($target, screenHeight) {
    var tableHeight = $target.height();
    var captionHeight = getCaptionHeight($target);
    if (captionHeight > 0 && tableHeight + captionHeight < screenHeight) {
      var remainingSpace = (screenHeight - tableHeight - captionHeight);
      return {
        'margin-top': Math.ceil(remainingSpace / 2) + 'px',
        'margin-bottom': Math.floor(remainingSpace / 2) + 'px'
      };
    }
    return {'margin-top': '','margin-bottom': ''};
  }


  /**
   * Update page info with a given media info and re-generate media info for the following page.
   * @param {{target: Array, header: Array, footer: Array, spacer: Array, imgCount: number, txtCount: number, hasTitle: boolean}} mediaInfo
   * @param {number} pageIndex - index of page.
   * @param {ENCPSectionBreak} sectionBreak
   * @returns {{target: Array, header: Array, footer: Array, spacer: Array, imgCount: number, txtCount: number, hasTitle: boolean}}
   * @private
   */
  function resetPageMediaInfo(mediaInfo, pageIndex, sectionBreak) {
    if (mediaInfo) {
      var hasHeader = false;
      var hasFooter = false;
      if (mediaInfo.target.length == 1 && !mediaInfo.hasTitle && sectionBreak.findEnabledBreaks().length > 0) {
        hasHeader = (mediaInfo.header.length == 1 && mediaInfo.footer.length <= 1 && canBeCaption(mediaInfo.header[0]));
        hasFooter = (mediaInfo.footer.length == 1 && mediaInfo.header.length <= 1 && canBeCaption(mediaInfo.footer[0]));
      }
      var pageInfo = {
        hasHeader: hasHeader,
        hasFooter: hasFooter,
        imgCount: mediaInfo.imgCount,
        contentCount: mediaInfo.target.length + mediaInfo.txtCount,
        pageHeight: 0,
        hasTopMargin: (mediaInfo.hasTitle ||
                       (mediaInfo.header.length > 0 && !hasHeader) ||
                       (mediaInfo.target.length == 0 && mediaInfo.txtCount > 0)),
        hasBottomMargin: ((mediaInfo.footer.length > 0 && !hasFooter) ||
                          (mediaInfo.target.length == 0 && mediaInfo.txtCount > 0))
      };
      // Using array for captionData to avoid escaping JSON output strings.
      var dataAttribute =  JSON.stringify([pageIndex, hasHeader, hasFooter]);
      if (hasHeader) {
        $(mediaInfo.header).wrap('<div class="' + CAPTION_HEADER + '" id="' + CAPTION_HEADER + '-' + pageIndex + '"/>');
      }
      if (hasFooter) {
        $(mediaInfo.footer).wrap('<div class="' + CAPTION_FOOTER + '" id="' + CAPTION_FOOTER + '-' + pageIndex + '"/>/>');
      }
      mediaInfo.target.forEach(function ($target, targetIndex) {
        $target.attr(CAPTION_DATA_ATTRIBUTE,dataAttribute);
        var $container = ($target.is("img")) ? $target.closest('.encp-media-container') : $target.closest('.encp-table-container');
        var targetMargin = {'margin-top':'','margin-bottom':''};
        if (!hasHeader && !hasFooter && (mediaInfo.target.length > 1 || mediaInfo.txtCount > 1)) {
          $container.addClass(WITH_PADDING);
          if (targetIndex == 0 && !pageInfo.hasTopMargin) {
            targetMargin['margin-top'] = '0';
          } else if (targetIndex == mediaInfo.target.length - 1 && !pageInfo.hasBottomMargin) {
            targetMargin['margin-bottom'] = '0';
          }
        } else {
          $container.removeClass(WITH_PADDING);
        }
        $container.css(targetMargin);
      },this);

      if (pageInfo.hasHeader || pageInfo.hasFooter || mediaInfo.txtCount == 0) {
        mediaInfo.spacer.forEach(function(spacer) {
          spacer.classList.add(HIDDEN_LINE_SPACER);
        });
      }

      mediaInfo.headerSpacerToHide.forEach(function(spacer) {
        spacer.classList.add(HIDDEN_LINE_SPACER);
      });
      mediaInfo.footerSpacerToHide.forEach(function(spacer) {
        spacer.classList.add(HIDDEN_LINE_SPACER);
      });

      this.pageSummary[pageIndex] = pageInfo;
    }
    // We've consumed mediaInfo, generate new object for the next media.
    return {
      target: [],
      header: [],
      footer: [],
      spacer: [],
      headerSpacerToHide: [],
      footerSpacerToHide: [],
      imgCount: 0,
      txtCount: 0,
      hasTitle: false
    };
  }

  /**
   * Reset captions.
   * @private
   */
  function resetCaptions() {
    //noinspection JSValidateTypes
    $('.' + CAPTION_HEADER).children().unwrap();
    //noinspection JSValidateTypes
    $('.' + CAPTION_FOOTER).children().unwrap();
  }

  /**
   * Adjust media preview item
   * @param mediaItem  The media item for preview
   * @param mediaSize  The base media size
   * @param screenSize The screen size of current viewport
   * @private
   */
  function adjustMediaPreviewItem(mediaItem, mediaSize, screenSize) {
    var $mediaItem = $(mediaItem);
    
    // Media item preview image should have at least:
    // - 15% left and right margins
    // - 5% top and bottom margins
    screenSize.width *= 0.7;
    screenSize.height = Math.min(screenSize.height * 0.9, screenSize.height * 0.95 - getCaptionHeight($mediaItem));

    mediaSize.width = Math.floor(mediaSize.width);
    mediaSize.height = Math.floor(mediaSize.height);

    if (mediaSize.width >= screenSize.width) {
      fitWidth(mediaSize, screenSize);
    }
    if (mediaSize.height > screenSize.height) {
      fitHeight(mediaSize, screenSize);
    }

    $mediaItem.css({
      'max-width': 'none',
      'max-height': 'none',
      'width': mediaSize.width,
      'height': mediaSize.height
    }).addClass((mediaSize.width <= mediaSize.height) ? "encp-portrait" : "encp-landscape");

    $mediaItem.closest('.encp-media-container')
      .addClass('encp-media-nonimage')
      .css(getTargetMarginForCaption($mediaItem, screenSize.height));
  };

  /**
   * Adjust image within ordered or unordered lists
   * @param image      The image for preview
   * @param imageSize  The base image size
   * @private
   */
  function adjustListItemImage(image, imageSize) {
    var $image = $(image);
    var $container = $image.closest('.encp-media-container');
    var containerWidth = $container.width();

    $image.css({
      width: (imageSize.width > containerWidth) ? containerWidth : '',
      height: ''
    });

    $container.css({
      'margin-left': '0',
      'margin-right': '0'
    });
  }

  /**
   * Adjust image within tables
   * @param image      The image for preview
   * @param imageSize  The base image size
   * @param screenSize The screen size of current viewport
   * @private
   */
  function adjustTableImage(image, imageSize, screenSize) {
    var $image = $(image);

    $image.css({
      width: Math.floor(imageSize.width * MAX_IMG_WIDTH_RATIO_IN_TABLE),
      'max-height': Math.floor(screenSize.height * MAX_IMG_HEIGHT_RATIO_IN_TABLE)
    });
  }

  /**
   * Adjust small images below 200x200 pixels 
   * @param image        The image for preview
   * @param imageSize    The base image size
   * @param sectionBreak The screen size of current viewport
   * @private
   */
  function adjustSmallImage(image, imageSize, sectionBreak) {
    var $image = $(image);
    var $container = $image.closest('.encp-media-container');
    var container = $container.get(0);

    var getSibling = function(name) {
      var sibling = container[name];

      if (sibling && sibling.nodeType == Node.TEXT_NODE) {
        sibling = sibling[name];
      }
      if (sibling && sibling.id == CURSOR_ID) {
        sibling = sibling[name];
      }

      return sibling;
    };

    if (!$container.parent().hasClass('encp-media-container-inline')) {
      $image.addClass('encp-small-image');
      
      var previousSibling = getSibling('previousSibling');
      var nextSibling = getSibling('nextSibling');

      if (ENCPSectionBreak.isDisabledBreak(previousSibling)) {
        sectionBreak.setBreakHidden(previousSibling, true);
      }
      if (ENCPSectionBreak.isDisabledBreak(nextSibling)) {
        sectionBreak.setBreakHidden(nextSibling, true);
      }

      $container.css({
        'margin-left': previousSibling ? '0.2rem' : '0',
        'margin-right': nextSibling ? '0.2rem' : '0'
      });

      $container.wrap('<div class="encp-media-container-inline"/>');
    }
  }

  /**
   * Adjust image inside ordered or unordered list
   * @param image      The image for preview
   * @param imageSize  The base image size
   * @param screenSize The screen size of current viewport
   * @private
   */
  function adjustStandardImage(image, imageSize, screenSize) {
    var $image = $(image);

    if (imageSize.width <= imageSize.height) {
      $image.addClass("encp-portrait");
    } else {
      $image.addClass("encp-landscape");
    }

    var imageStyles = {
      'max-width': 'none',
      'max-height': 'none',
      'margin-top': '',
      'margin-bottom': '',
      'width': '',
      'height': ''
    };

    var scaleFactor = (this.isResponsiveLayout) ? 1.0 : screenSize.width / REFERENCE_SCREEN_RESOLUTION;
    // #1 Scale to 200%
    imageSize.width *= 2 * scaleFactor;
    imageSize.height *= 2 * scaleFactor;
    if (imageSize.width >= screenSize.width) {
      // #2 Fit the image against screen width.
      fitWidth(imageSize, screenSize);
    }
    var captionHeight = getCaptionHeight($image);
    screenSize.height -= captionHeight;

    if (imageSize.height > screenSize.height) {
      // #3 Fit the image against screen height.
      fitHeight(imageSize, screenSize);
    }

    imageSize.width = Math.floor(imageSize.width);
    imageSize.height = Math.floor(imageSize.height);
    imageStyles['width'] = imageSize.width + 'px';
    imageStyles['height'] = imageSize.height + 'px';

    var pageIndex = getPageIndex($image);
    var pageSummary = null;
    if (pageIndex !== undefined) {
      pageSummary = this.pageSummary[pageIndex];
    }

    if (captionHeight > 0) {
      var remainingSpace = Math.max(0, screenSize.height - imageSize.height);
      imageStyles['margin-top'] = Math.ceil(remainingSpace / 2) + 'px';
      imageStyles['margin-bottom'] = Math.floor(remainingSpace / 2) + 'px';
      if (pageSummary) {
        pageSummary.pageHeight = imageSize.height + captionHeight + remainingSpace;
      }
    } else if (pageSummary && pageSummary.imgCount == 1 && pageSummary.contentCount == 1) {
      pageSummary.pageHeight = imageSize.height + captionHeight;
    }

    $image.css(imageStyles);
  }

  /**
   * Notifies host about availability of captions in note
   */
  function reportCaptionsInfo() {
    var headerCaptionsCount = 0;
    var footerCaptionsCount = 0;
    $('*[' + CAPTION_DATA_ATTRIBUTE + ']').each(function() {
      var $captionTarget = $(this);
      var captionInfo = JSON.parse($captionTarget.attr(CAPTION_DATA_ATTRIBUTE));
      if (captionInfo) {
        headerCaptionsCount += (captionInfo[CAPTION_PROPETY.HEADER] ? 1 : 0);
        footerCaptionsCount += (captionInfo[CAPTION_PROPETY.FOOTER] ? 1 : 0);
      }
    });
    window.encpPlatform.didSetupHeaderCaptions(headerCaptionsCount);
    window.encpPlatform.didSetupFooterCaptions(footerCaptionsCount);
  }

  /**
   * Setup captions for all pages.
   * @param {ENCPSectionBreak} sectionBreak
   */
  ENCPImageLayout.prototype.setupCaptions = function(sectionBreak) {
    if (!this.canHandleCaptions) {
      return;
    }

    var self = this;
    var pageIndex = 0;
    var mediaInfo = resetPageMediaInfo.call(self, null, pageIndex, sectionBreak);

    self.pageSummary = [];
    setupEmptyLines();
    resetCaptions();

    function extractSpacer(element) {
      var $element = $(element);

      if ($element.is('* + br')) {
        return element;
      } else if ($element.parent().is('.' + LINE_SPACER)) {
        return element.parentNode;
      } else if ($element.is('br') && !element.previousSibling) {
        return element;
      }

      return null;
    }

    var treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    for (var node = treeWalker.currentNode; node; node = treeWalker.nextNode()) {
      // TODO: Remove JQ to make things faster
      var $node = $(node);
      if (node.id == CURSOR_ID) {
        continue;
      } else if (ENCPSectionBreak.isEnabledBreak(node)) {
        mediaInfo = resetPageMediaInfo.call(self, mediaInfo, pageIndex++, sectionBreak);
        continue;
      } else if ($node.is('.encp-table-container > table')) {
        mediaInfo.footer = [];
        mediaInfo.target.push($node);
        continue;
      } else if ($node.is('.encp-media-container img') && !$node.hasClass('encp-table-image')) {
        mediaInfo.footer = [];
        mediaInfo.imgCount++;
        mediaInfo.target.push($node);
        continue;
      } else if ($node.children().length != 1 || !$node.children().is('#' + CURSOR_ID)) {
        if ($node.children().length > 0 || $node.closest('table').length > 0) {
          continue;
        }
      }

      // Handling empty lines or text paragraphs.
      var spacer = extractSpacer(node);
      if (spacer) {
        mediaInfo.spacer.push(spacer);
        if (mediaInfo.txtCount == 0) {
          mediaInfo.headerSpacerToHide.push(spacer);
        } else {
          mediaInfo.footerSpacerToHide.push(spacer);
        }
      } else if ($node.is('h1.title')) {
        mediaInfo.hasTitle = true;
      } else if ($node.text().trim().length > 0) {
        mediaInfo.footerSpacerToHide = [];
        mediaInfo.txtCount++;
        if (mediaInfo.target.length == 0) {
          mediaInfo.header.push($node);
        } else {
          mediaInfo.footer.push($node);
        }
      }
    }

    resetPageMediaInfo.call(self, mediaInfo, pageIndex, sectionBreak);

    reportCaptionsInfo();
  };

  /**
   * Update base size of a given image.
   * @param {HTMLImageElement} image
   * @param {number} width
   * @param {number} height
   */
  ENCPImageLayout.prototype.setImageBaseSize = function(image, width, height) {
    if (width && height) {
      image.setAttribute(BASE_WIDTH, width + '');
      image.setAttribute(BASE_HEIGHT, height + '');
    }
  };

  /**
   * Get base size of image.
   * @param {HTMLImageElement} image
   * @returns {{width: number, height: number}}
   */
  ENCPImageLayout.prototype.getImageBaseSize = function (image) {
    var width = image.naturalWidth;
    var height = image.naturalHeight;
    if (image.getAttribute(BASE_WIDTH) && image.getAttribute(BASE_HEIGHT)) {
      width = Math.round(parseFloat(image.getAttribute(BASE_WIDTH)));
      height = Math.round(parseFloat(image.getAttribute(BASE_HEIGHT)));
    }
    if (image.getAttribute('width')) {
      var resizedWidth = image.getAttribute('width');
      var resizeFactor = resizedWidth / width;
      width = Math.round(width * resizeFactor);
      height = Math.round(height * resizeFactor);
    }
    return {width: width, height:height};
  };

  /**
   * Adjust table margins with considering captions.
   * @param {*} screenSize
   */
  ENCPImageLayout.prototype.adjustTableMargins = function (screenSize) {
    $('.encp-table-container table').each(function() {
      var $table = $(this);
      var screenHeight = $.extend({}, screenSize).height;
      $table.parent('.encp-table-container').css(getTargetMarginForCaption($table, screenHeight));
    });
  };

  /**
   * Adjust image in various positions and types
   * @param image        The preview image
   * @param screenSize   The screen size
   * @param sectionBreak The ENCPSectionBreak instance
   */
  ENCPImageLayout.prototype.adjustImage = function (image, screenSize, sectionBreak) {
    screenSize = $.extend({}, screenSize);

    var $image = $(image);
    var $container = $image.closest('.encp-media-container');

    // It must be in a media container to adjust the content.
    if (!$container.length) {
      return;
    }

    var imageSize = this.getImageBaseSize(image);

    // TODO: We should remove extensive paddings from CSS for media-image and set paddings when needed.
    $container.css('padding', '0');

    if (imageSize.width <= INLINE_IMAGE_THRESHOLD && imageSize.height <= INLINE_IMAGE_THRESHOLD) {
      adjustSmallImage.call(this, image, imageSize, sectionBreak);
    } else if ($image.closest('ul').length || $image.closest('ol').length) {
      adjustListItemImage.call(this, image, imageSize);
    } else if ($image.hasClass('encp-table-image')) {
      adjustTableImage.call(this, image, imageSize, screenSize);
    } else if ($container.attr("data-media-mime").indexOf('image') != 0) {
      adjustMediaPreviewItem.call(this, image, imageSize, screenSize);
    } else {
      adjustStandardImage.call(this, image, imageSize, screenSize);
    }
  };

  /**
   * Check whether a given page has top margin or not
   * @param {number} pageIndex - index of page.
   * @returns {boolean} true if a given page has top margin.
   */
  ENCPImageLayout.prototype.hasTopMargin = function (pageIndex) {
    var pageSummary = this.pageSummary[pageIndex];
    if (pageSummary) {
      return pageSummary.hasTopMargin;
    }
    return false;
  };

  /**
   * Check whether a given page has bottom margin or not
   * @param {number} pageIndex - index of page.
   * @returns {boolean} true if a given page has bottom margin.
   */
  ENCPImageLayout.prototype.hasBottomMargin = function (pageIndex) {
    var pageSummary = this.pageSummary[pageIndex];
    if (pageSummary) {
      return pageSummary.hasBottomMargin;
    }
    return false;
  };

  /**
   * Get page height if available.
   * @param pageIndex
   * @returns {number} it will returns 0 if page height is unknown.
   */
  ENCPImageLayout.prototype.getPageHeightIfAvailable = function (pageIndex) {
    var pageSummary = this.pageSummary[pageIndex];
    if (pageSummary) {
      return pageSummary.pageHeight;
    }
    return 0;
  };

  /**
   * Check whether a given page has a image header or not
   * @param {number} pageIndex - index of page.
   * @returns {boolean} true if a given page has image headers
   */
  ENCPImageLayout.prototype.hasImageHeaderInPage = function (pageIndex) {
    var pageSummary = this.pageSummary[pageIndex];
    if (pageSummary) {
      return (pageSummary.hasHeader && pageSummary.imgCount == 1);
    }
    return false;
  };

  /**
   * Check whether a given page has any contents or not (except title)
   * @param pageIndex - index of page.
   * @returns {boolean} true if a given page has no contents or only title.
   */
  ENCPImageLayout.prototype.hasNoContent = function (pageIndex) {
    var pageSummary = this.pageSummary[pageIndex];
    if (pageSummary) {
      return (pageSummary.contentCount == 0);
    }
    return true;
  };

  return ENCPImageLayout;
});
