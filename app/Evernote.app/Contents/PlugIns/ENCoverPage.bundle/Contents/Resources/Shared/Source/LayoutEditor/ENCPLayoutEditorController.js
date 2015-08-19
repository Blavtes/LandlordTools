//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var $ = require('Shared/Utilities/JQueryExt');
  var ENCPSectionBreakUI = require('Shared/LayoutEditor/ENCPSectionBreakUI');

  // Note content container element
  var NOTE_CONTENT_TAG_CLASS = 'encp-layout-editor-note-content';
  var NOTE_CONTENT_TAG = '<div class="' + NOTE_CONTENT_TAG_CLASS +'"></div>';

  // Note content container wrap element
  var NOTE_CONTENT_CONTAINER_TAG_CLASS = 'encp-layout-editor-note-content-container';
  var NOTE_CONTENT_CONTAINER_TAG = '<div class="' + NOTE_CONTENT_CONTAINER_TAG_CLASS +'"></div>';

  // Layout Editor Zoom element
  var LAYOUT_EDITOR_ZOOM_TAG_CLASS = 'encp-layout-editor-zoom-container';
  var LAYOUT_EDITOR_ZOOM_TAG = '<div class="' + LAYOUT_EDITOR_ZOOM_TAG_CLASS + '"></div>';

  // Layout Editor Scroll element
  var LAYOUT_EDITOR_SCROLL_TAG_CLASS = 'encp-layout-editor-scroll-container';
  var LAYOUT_EDITOR_SCROLL_TAG = '<div class="' + LAYOUT_EDITOR_SCROLL_TAG_CLASS + '"></div>';

  // Presented content indicating box container
  var PRESENTED_AREA_CONTAINER_TAG_CLASS = 'encp-layout-editor-presented-area-container';
  var PRESENTED_AREA_CONTAINER_TAG = '<div class="' + PRESENTED_AREA_CONTAINER_TAG_CLASS + '"></div>';

  // Presented content indicating box
  var PRESENTED_AREA_BOX_TAG_CLASS = 'encp-layout-editor-presented-area';

  /**
   * Add event listener for the scroll to force redraw on older webkit versions because of scale transformation issue.
   * @private
   */
  function forcedRedrawFixIfNeeded($element) {
    var versionMatch = navigator.userAgent.match(/AppleWebKit\/([\d.]+)/);

    if (versionMatch && versionMatch.length == 2 && parseInt(versionMatch[1], 10) > 536) {
      return;
    }

    var element = $element.get(0);
    var stopTimer = null;
    var repaintInterval = null;

    $(window).on('scroll', function() {
      if (!repaintInterval) {
        repaintInterval = setInterval(function() {
          // The following 3 lines force redraw in webkit.
          element.style.display = 'none';
          element.offsetHeight;
          element.style.display = 'block';
        }, 10);
      }
      clearTimeout(stopTimer);
      stopTimer = setTimeout(function() {
        clearInterval(repaintInterval);
        repaintInterval = null;
      }, 500);
    });
  }

  /**
   * Controls layout editor UI
   * @constructor
   * @param sectionBreakLayout {ENCPSectionBreakLayout} Section breaks managing the document.
   *                           Used only to query for breaks.
   * @param themeStyles {ENCPThemeStyles} Theme which should be used to add new styles.
   */
  function ENCPLayoutEditorController (sectionBreakLayout, themeStyles) {
    this.breakLayout = sectionBreakLayout;
    this.sectionBreakUI = new ENCPSectionBreakUI(this, sectionBreakLayout.sectionBreak);

    this.presentedAreaBoxTop = window.document.createElement("div");
    this.presentedAreaBoxTop.classList.add(PRESENTED_AREA_BOX_TAG_CLASS);
    this.presentedAreaBoxBottom = window.document.createElement("div");
    this.presentedAreaBoxBottom.classList.add(PRESENTED_AREA_BOX_TAG_CLASS);
    this.presentedAreaOffsetY = 0;

    this.lastEnabledSectionBreak = null;
    this.lastDisabledSectionBreak = null;

    this.lastFocusedPage = 0;

    this.registerMouseListener();

    this._CSSGroup = {
      'base' : ['LayoutEditorBase.css', require('text!SharedCSS/LayoutEditorBase.css')],
      'default' : ['LayoutEditorDefault.css', require('text!SharedCSS/LayoutEditorDefault.css')],
      'night' : ['LayoutEditorNight.css', require('text!SharedCSS/LayoutEditorNight.css')]
    };
    themeStyles.registerCSSGroup(this._CSSGroup);
  }

  /**
   * Prepares layout editor.
   * - makes "html" element transparent
   * - calculates scale ratio of the editor view
   */
  ENCPLayoutEditorController.prototype.updateLayoutEditorDisplay = function () {
    var $body = $(window.document.body);
    var preparingWasDoneBefore = (window.document.getElementsByClassName(NOTE_CONTENT_CONTAINER_TAG_CLASS).length != 0);

    if (!preparingWasDoneBefore) {
      var $container = $(PRESENTED_AREA_CONTAINER_TAG);

      $(window.document.documentElement).css("background-color", "transparent");
      //noinspection JSValidateTypes
      $body.children().wrapAll(NOTE_CONTENT_TAG);
      //noinspection JSValidateTypes
      $body.append($container);
      $body.children().wrapAll(NOTE_CONTENT_CONTAINER_TAG);
      this.displayCurrentlyPresentedContentBox(true);
      forcedRedrawFixIfNeeded($container);
    }

    var windowWidth = $(window).width();
    var viewPortSize = window.encpPlatform.viewPort();

    var $noteContentContainer = $("." + NOTE_CONTENT_CONTAINER_TAG_CLASS);
    var noteContentContainerWidth = viewPortSize.width;
    $noteContentContainer.css("width", noteContentContainerWidth + 'px');

    var scrollbarPanelWidth = 20; // used to hide vertical scrollbar (don't forget to change it in obj-c)
    var buttonsPanelWidth = (14 + 2 * 8); // 14px - button width, 8px - margin around button
    var notePanelWidth = windowWidth - buttonsPanelWidth - scrollbarPanelWidth;
    var scaleRatio = notePanelWidth / noteContentContainerWidth;

    // Set body width
    $body.css("width", (windowWidth / scaleRatio) + 'px');

    // Scale body to fit specified view port
    $body.css("-webkit-transform", "scale(" + scaleRatio + ")");
    $body.css("-webkit-transform-origin", "0 0");

    // Disable text selection in layout editor
    $body.css("-webkit-user-select", "none");

    // TODO: move scale ratio to layout editor controller from the encpPlatform
    window.encpPlatform.scaleRatio = scaleRatio;

    this.updatePresentedAreaIndicator();
    this.sectionBreakUI.updateSectionBreaksDisplay();
  };

  /**
   * Updates the zoom values to display the content correct
   * (needed for notes with a 'zoom' value e.g. websource notes)
   */
  ENCPLayoutEditorController.prototype.updateZoom = function() {
    var zoom = parseFloat($('html').css('zoom'));
    if (!zoom) {
      zoom = 1;
    }
    var scaleRatio = window.encpPlatform.scaleRatio;
    var $body = $(window.document.body);
    $body.css("-webkit-transform", "scale(" + scaleRatio / zoom + ")");
    $('#en-note, .encp-note-title').css('zoom', zoom);
  };

  /**
   * Updates document height according to current scale ratio.
   * Should be called once after presenter did finish layout.
   */
  ENCPLayoutEditorController.prototype.updateDocumentHeight = function () {
    var scaleRatio = window.encpPlatform.scaleRatio;
    if (scaleRatio != 1) {
      var $body = $(window.document.body);
      var originalBodyHeight = $body.height();
      var scaledBodyHeight = Math.ceil(originalBodyHeight * scaleRatio);
      var windowHeight = $(window).height();
      $body.height(Math.max(windowHeight, scaledBodyHeight));
    }
    this.updatePresentedAreaIndicator();
  };

    /**
   * Controls section breaks display state
   * @param {boolean} display If it's true shows all section breaks, otherwise hides them.
   */
  ENCPLayoutEditorController.prototype.displaySectionBreaks = function (display) {
    if (display) {
      this.sectionBreakUI.showAllMarkerLines();
    } else {
      this.sectionBreakUI.hideAllMarkerLines();
    }
  };


  /**
   * Refresh all section break UI
   */
  ENCPLayoutEditorController.prototype.refreshSectionBreaks = function() {
    this.displaySectionBreaks(false);
    this.displaySectionBreaks(true);
  }
  /**
   * Controls section breaks display state
   * @param {boolean} display If it's true shows all section breaks, otherwise hides them.
   */
  ENCPLayoutEditorController.prototype.displayCurrentlyPresentedContentBox = function (display) {
    var noteContentElement = document.getElementsByClassName(PRESENTED_AREA_CONTAINER_TAG_CLASS)[0];
    if (display) {
      noteContentElement.appendChild(this.presentedAreaBoxTop);
      noteContentElement.appendChild(this.presentedAreaBoxBottom);
      this.updatePresentedAreaIndicator();
    } else {
      noteContentElement.removeChild(this.presentedAreaBoxTop);
      noteContentElement.removeChild(this.presentedAreaBoxBottom);
    }
  };

  /**
   * Adjusts position of the indicating box.
   * @param {number} offset The offset represented currently visible content offset on the main screen.
   * @param {number} scrollToOffset If true, view scroll to show the visible area.
   */
  ENCPLayoutEditorController.prototype.setCurrentlyPresentedContentOffset = function (offset, scrollToOffset) {
    this.presentedAreaOffsetY = offset;
    this.updatePresentedAreaIndicator();
    if (scrollToOffset) {
      this.scrollToPresentedArea();
    }
  };

  /**
   * Enable (or disable) readonly mode.
   * @param {boolean} readonly - true to make readonly mode.
   */
  ENCPLayoutEditorController.prototype.setReadonly = function (readonly) {
    this.sectionBreakUI.setReadonly(readonly);
  };

  /**
   * Make sure that presented area is visible in the layout editor
   */
  ENCPLayoutEditorController.prototype.scrollToPresentedArea = function () {
    var SCROLL_MARGIN = 50;
    var scaleRatio = window.encpPlatform.scaleRatio;
    var viewPortBox = this.viewPortBox();

    //noinspection JSValidateTypes
    var scrollOffset = $(window).scrollTop();
    var windowHeight = $(window).height();
    var visibleOffsetTop = Math.max(0, Math.round(viewPortBox.top * scaleRatio) - SCROLL_MARGIN);
    var visibleOffsetBottom = Math.min(this.breakLayout.documentHeight(),
        Math.round((viewPortBox.top + viewPortBox.height) * scaleRatio) + SCROLL_MARGIN);
    if (visibleOffsetTop < scrollOffset) {
      //noinspection JSValidateTypes
      $(window).scrollTop(visibleOffsetTop);
    } else if (visibleOffsetBottom - windowHeight > scrollOffset) {
      //noinspection JSValidateTypes
      $(window).scrollTop(visibleOffsetBottom - windowHeight);
    }
  };

  /**
   * Compute visible portion of the page in page coordinates
   * @returns {{left: number, top: number, width: number, height: number}}
   */
  ENCPLayoutEditorController.prototype.viewPortBox = function () {
    var viewPort = window.encpPlatform.viewPort();
    return {
      left: 0,
      top: Math.round(this.presentedAreaOffsetY),
      width: Math.round(viewPort.width),
      height: Math.round(viewPort.height)
    };
  };

  /**
   * Update visible area in the layout editor
   */
  ENCPLayoutEditorController.prototype.updatePresentedAreaIndicator = function () {
    var viewPortBox = this.viewPortBox();

    this.presentedAreaBoxTop.style.top = 0;
    this.presentedAreaBoxTop.style.left = viewPortBox.left;
    this.presentedAreaBoxTop.style.width = viewPortBox.width;
    this.presentedAreaBoxTop.style.height = viewPortBox.top;

    this.presentedAreaBoxBottom.style.top = viewPortBox.top + viewPortBox.height;
    this.presentedAreaBoxBottom.style.left = viewPortBox.left;
    this.presentedAreaBoxBottom.style.width = viewPortBox.width;
    // TODO: We cannot compute height due to animations that have not been completed yet
    this.presentedAreaBoxBottom.style.height = 1000000;

    this.lastFocusedPage = this.breakLayout.pageNumberForOffset(viewPortBox.top + viewPortBox.height / 2);
  };

  ENCPLayoutEditorController.prototype.showPageForOffsetY = function (offsetY) {
    var self = this;

    var pageNumber = self.breakLayout.pageNumberForOffset(offsetY);
    var pageLimits = self.breakLayout.pageLimits(pageNumber);
    var viewPortSize = window.encpPlatform.viewPort();
    var pageTopOffsetY = Math.round(offsetY - viewPortSize.height / 2.);
    pageTopOffsetY = Math.max(pageLimits.top, Math.min(pageLimits.bottom - viewPortSize.height, pageTopOffsetY));

    window.encpPlatform.didClickPageAtOffsetY(pageTopOffsetY);
  };

  ENCPLayoutEditorController.prototype.registerMouseListener = function () {
    var self = this;

    function mouseDown(event) {
      event.preventDefault();
      
      var clickOffsetY = event.pageY / window.encpPlatform.scaleRatio;
      self.showPageForOffsetY(clickOffsetY);
    }

    window.document.addEventListener("mousedown", mouseDown);
  };

  ENCPLayoutEditorController.prototype.showPresentedContentAfterAnimation = function () {
    var currentPresentedArea = this.viewPortBox();

    if (this.lastEnabledSectionBreak && this.lastDisabledSectionBreak) {
      // Case: Page break was moved - we stay on the same page or the closest to the break
      var pageBreaks = this.breakLayout.enabledLayoutBreaks();
      var lastEnabledIndex = pageBreaks.indexOf(this.lastEnabledSectionBreak);
      if (this.lastFocusedPage < lastEnabledIndex) {
        this.showPresentedAreaAboveSectionBreak(this.lastEnabledSectionBreak);
      } else {
        this.showPresentedAreaBelowSectionBreak(this.lastEnabledSectionBreak);
      }
    } else if (this.lastEnabledSectionBreak) {
      var enabledSectionBreakOffsetY = this.breakLayout.pageOffsetForBreak(this.lastEnabledSectionBreak);
      if (currentPresentedArea.top < enabledSectionBreakOffsetY) {
        this.showPresentedAreaAboveSectionBreak(this.lastEnabledSectionBreak);
      } else {
        this.showPresentedAreaBelowSectionBreak(this.lastEnabledSectionBreak);
      }
    } else if (this.lastDisabledSectionBreak) {
      var disabledSectionBreakOffsetY = this.breakLayout.pageOffsetForBreak(this.lastDisabledSectionBreak);
      this.showPresentedAreaAroundSectionBreak(this.lastDisabledSectionBreak);
    }

    this.lastEnabledSectionBreak = null;
    this.lastDisabledSectionBreak = null;
  };

  ENCPLayoutEditorController.prototype.handleEvent = function (event) {
    switch(event.type) {
      case 'webkitTransitionEnd':
        this.showPresentedContentAfterAnimation();
        event.target.removeEventListener("webkitTransitionEnd", this);
        break;
    }
  };

    /**
   * Show presented area indicator below the specified section break
   * @param sectionBreak
   */
  ENCPLayoutEditorController.prototype.showPresentedAreaBelowSectionBreak = function (sectionBreak) {
    var sectionBreakOffsetY = this.breakLayout.pageOffsetForBreak(sectionBreak);
    this.showPageForOffsetY(sectionBreakOffsetY + 1);
  };

  /**
   * Show presented area indicator above the specified section break
   * @param sectionBreak
   */
  ENCPLayoutEditorController.prototype.showPresentedAreaAboveSectionBreak = function (sectionBreak) {
    var sectionBreakOffsetY = this.breakLayout.pageOffsetForBreak(sectionBreak);
    this.showPageForOffsetY(sectionBreakOffsetY - 1);
  };

  /**
   * Show presented area indicator around the specified section break
   * @param sectionBreak
   */
  ENCPLayoutEditorController.prototype.showPresentedAreaAroundSectionBreak = function (sectionBreak) {
    var sectionBreakOffsetY = this.breakLayout.pageOffsetForBreak(sectionBreak);
    this.showPageForOffsetY(sectionBreakOffsetY);
  };

  /**
   * Notifies host about enabled and disabled section breaks.
   * @param enabledSectionBreaks  The array of section breaks which were enabled.
   * @param disabledSectionBreaks The array of section breaks which were disabled.
   */
  ENCPLayoutEditorController.prototype.notifyHostAboutSectionBreakModeChanges = function (enabledSectionBreaks, disabledSectionBreaks, withDragging) {
    var allBreaksArray = this.breakLayout.sectionBreak.findAllBreaks();

    var enabledIndexes = enabledSectionBreaks.map(allBreaksArray.indexOf, allBreaksArray);
    var disabledIndexes = disabledSectionBreaks.map(allBreaksArray.indexOf, allBreaksArray);

    window.encpPlatform.didChangeSectionBreaks(enabledIndexes, disabledIndexes, withDragging);

    // Remember enabled and disabled section break
    this.lastEnabledSectionBreak = enabledSectionBreaks[0];
    this.lastDisabledSectionBreak = disabledSectionBreaks[0];

    // Wait until animation finished, then update presented area indicator position.
    if (this.lastDisabledSectionBreak) {
      this.lastDisabledSectionBreak.addEventListener("webkitTransitionEnd", this, false);
    } else {
      this.lastEnabledSectionBreak.addEventListener("webkitTransitionEnd", this, false);
    }
  };

  return ENCPLayoutEditorController;
});
