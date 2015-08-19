//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var $ = require('Shared/Utilities/JQueryExt');
  var ENCPDeferred = require('Shared/Utilities/ENCPDeferred');
  var ENCPImageLayout = require('Shared/NotePresenter/ENCPImageLayout');
  var ENCPLogger = require('Shared/Utilities/ENCPLogger');
  var ENCPLayoutEditorController = require('Shared/LayoutEditor/ENCPLayoutEditorController');
  var ENCPMediaContents = require('Shared/NotePresenter/ENCPMediaContents');
  var ENCPPlatformMediaContents = require('Mac/ENCPPlatformMediaContents');
  var ENCPSectionBreak = require('Shared/LayoutEditor/ENCPSectionBreak');
  var ENCPSectionBreakLayout = require('Shared/LayoutEditor/ENCPSectionBreakLayout');
  var ENCPSectionBreakAutoFormatter = require('Shared/LayoutEditor/ENCPSectionBreakAutoFormatter');
  var ENCPSectionBreakHRConverter = require('Shared/LayoutEditor/ENCPSectionBreakHRConverter');
  var ENCPThemeStyles = require('Shared/Utilities/ENCPThemeStyles');
  var ENCPUtilities = require('Shared/Utilities/ENCPUtilities');

  function ENCPPresenter() {
    this.setupStyleSheet();
  }

  ENCPPresenter.prototype = {

    REFERENCE_SCREEN_RESOLUTION: 1440,
    REFERENCE_FONT_SIZE_IN_PX: 30,
    STANDARD_EM_SIZE_IN_PX: 16,
    MIN_PAGEMARGIN_RATIO: 0.1,
    MIN_IMAGE_SIZE: 100.0,
    MAX_IMAGE_DISPLAY_HEIGHT_FACTOR: 90.0 / 100.0,
    MAX_IMAGE_DISPLAY_WIDTH_FACTOR: 70.0 / 100.0,

    /** Keep track of if we are already at the end of the note when we're notifying of changes */
    isAlreadyAtEndOfNote: false,

    /** remember old document height to calculate new scrollTop() after resizing */
    previousDocumentHeight: 0,
    previousScrollTop: 0,

    /** Scroll position */
    lastScrollPosition: 0,
    targetScrollPosition: -1,
    scrollMarker: null,
    markerPosition: -1,
    isTouched: false,
    isRecoveringScrollPosition: false,

    /** page information */
    readyToSetupPageBreaks: false,
    didSetupPageBreaks: false,
    pageBoundaries: null,

    /** reference screen resolution */
    referenceScreenResolution: 0,
    referenceFontSize: 0,

    /** The focused link object */
    focused: null,

    /** A key code for the last pressed key */
    lastKeyPress: undefined,

    /** Available style sheets */
    themeStyles: undefined,

    /** Current page zoom level */
    userZoomLevel: 1.0,

    /** contents attributes */
    titlePadding: {top: 0, bottom: 0},
    imageContainers: $(),
    numberOfLoadedImages: 0,

    sectionBreak: null,
    breakLayout: null,
    imageLayout: null,
    mediaContents: null,
    layoutEditorController: null,

    isAnimatingScroll: false,

    SECTION_BREAK_ANIMATION_CLASS: "encp-section-break-animation",

    prepareExitGalleryModeForMediaAtPath: function(mediaPath) {
      var mediaFrame = this.mediaContents.getClosingMediaFrame(mediaPath);
      return JSON.stringify({mediaFrame: mediaFrame});
    },

    setupStyleSheet: function() {

      var themeStyles = new ENCPThemeStyles();
      themeStyles.applyTheme('default');

      this.commonCSSGroup = {
        'base' : ['Common.css', require('text!CSS/Common.css')]
      };
      themeStyles.registerCSSGroup(this.commonCSSGroup);

      if (this.isNoteSource) {
        this.presenterCSSGroup = {
          'base' : ['Presentation.css', require('text!CSS/Presentation.css')],
          'default' : ['PresentationDefault.css', require('text!CSS/PresentationDefault.css')],
          'night' : ['PresentationNight.css', require('text!CSS/PresentationNight.css')]
        };
      } else {
        this.presenterCSSGroup = {
          'base' : require('text!CSS/Websource.css')
        };
      }
      themeStyles.registerCSSGroup(this.presenterCSSGroup);

      this.themeStyles = themeStyles;
    },

    proceedLayout: function() {
      var self = this;
      ENCPDeferred
        .doNow()
        .then(function() {
          // Layout procedure - step 1 : scaling page.
          self.scalePresentation();
          // CP-567 - workaround image layout problem by remove/adding the encp-media-preview class. This forces webkit layout.
          $(".encp-media-preview").addClass("encp-layout").removeClass("encp-media-preview");
        })
        .then(function() {
          // Layout procedure - step 2 : resizing elements on the page.
          $(".encp-layout").addClass("encp-media-preview").removeClass("encp-layout");
          self.readyToSetupPageBreaks = true;
          self.updatePageBreaks(false);
        })
        .waitUntil(function() {
          return self.didSetupPageBreaks;
        })
        .then(function() {
          // Layout procedure - step 3 : recovering scroll position if necessary.
          if (self.previousDocumentHeight && this.previousScrollTop) {
            $(window).scrollTop(self.previousScrollTop * $(document).height() / self.previousDocumentHeight);
            self.previousScrollTop = 0;
          }
          self.isUpdatingLayout = false;
          self.recoverScrollPosition();
        })
        .done();
    },

    updateLayout: function() {
      var self = this;
      var oldViewPort = self.viewPort();
      ENCPDeferred
        .doNow(function() {
          // Notify host starting layout procedure.
          window.encpPlatform.willStartLayouting();
          self.isUpdatingLayout = true;
          self.pageBoundaries = null;
        })
        .then(function() {
          // Check viewPort update so that we can execute layout specific procedure.
          var newViewPort = self.viewPort();
          if (window.encpPlatform.hasViewPortBeenOverriden() &&
              oldViewPort.height == newViewPort.height &&
              oldViewPort.width == newViewPort.width) {
            self.isUpdatingLayout = false;
            self.recoverScrollPosition();
          } else {
            self.proceedLayout();
          }
        })
        .waitUntil(function() {
          return !self.isUpdatingLayout;
        })
        .then(function() {
          if (self.layoutEditorController) {
            self.layoutEditorController.updateDocumentHeight();
            self.layoutEditorController.scrollToPresentedArea();
          }
          // Notify host finishing layout procedure.
          window.encpPlatform.didFinishLayouting();
        })
        .done();
    },

    registerResizeHandler: function() {
      var self = this;
      $(window).on("resize", function() {
        self.updateLayout();
      });
    },

    updateDocumentHeight: function() {
      var self = this;
      var documentHeight = $(document).height();
      if (documentHeight != self.previousDocumentHeight) {
        self.previousDocumentHeight = documentHeight;
      }
    },

    willChangeScreen: function() {
      this.previousScrollTop = $(window).scrollTop();
      this.updateDocumentHeight();
    },

    zoomFactorInPercent: function() {
      return (this.referenceFontSize * 100 / this.STANDARD_EM_SIZE_IN_PX) * this.viewPort().width / this.referenceScreenResolution;
    },

    scalePresentation: function() {
      var self = this;
      var $html = $("html");
      var percent = 0;
      if (self.isNoteSource()) {
        percent = this.zoomFactorInPercent();
        percent *= this.userZoomLevel;
        $html.css("font-size", "" + percent + "%" );
      } else if (!$html.hasClass("encp-image-only")) {
        window.encpPlatform.adjustZoomLevel($html,self.referenceScreenResolution,this.userZoomLevel);
      }
      this.mediaContents.adjustMediaImages();
    },

    updateUserZoomLevel: function(zoomLevel) {
      this.userZoomLevel = zoomLevel;
      var $body = $('body');
      if (this.userZoomLevel > 1.5) {
        $body.removeClass('encp-medium-zoom');
        $body.addClass('encp-large-zoom');
      } else if (this.userZoomLevel > 1.0) {
        $body.addClass('encp-medium-zoom');
        $body.removeClass('encp-large-zoom');
      } else {
        $body.removeClass('encp-medium-zoom');
        $body.removeClass('encp-large-zoom');
      }
      if (this.readyToSetupPageBreaks) {
        this.willChangeScreen();
        this.updateLayout();
      }
    },

    proceedPageDown: function() {
      if (this.focused && this.focused.hasClass('encp-note-link')) {
        var currentTop = this.lastScrollPosition;
        var currentBottom = currentTop + this.viewPort().height;
        var linkPosition = this.focused.offset().top;
        if (linkPosition > currentTop && linkPosition < currentBottom) {
          // only open note link if visible
          window.location.href = this.focused.attr('href');
          return;   
        }
      }
      if (this.isEndOfNote()) {
        window.encpPlatform.navigateToNextNote();
        return;
      }
      this.scrollToNextBoundary();
    },

    proceedPageUp: function() {
      if (this.isBeginningOfNote()) {
        window.encpPlatform.navigateToPreviousNote();
        return;
      }
      this.scrollToPreviousBoundary();
    },

    registerKeydownHandler: function () {
      var self = this;

      if (self.isInLayoutEditorMode()) {
        return;
      }

      $(window).on("keydown", function (event) {
        if (event.keyCode == 32
            && self.lastKeyPress == event.keyCode
            && self.targetScrollPosition == -1) {
          // allow space key long-press
          self.lastKeyPress = undefined;
        }
        if (self.lastKeyPress !== undefined) {
          event.preventDefault();
          event.returnValue = false;
          return;
        }
        var callback = null;
        if (event.keyCode == 34) { // handle page down
          callback = self.proceedPageDown;
        } else if (event.keyCode == 33) { // handle page up
          callback = self.proceedPageUp;
        } else if (event.keyCode == 32) { // handle space key
          callback = (event.shiftKey) ? self.scrollToPreviousBoundary : self.scrollToNextBoundary;
        } else if (event.keyCode == 37 || event.keyCode == 38) { // handle left && up arrow
          callback = self.scrollToPreviousBoundary;
        } else if (event.keyCode == 39 || event.keyCode == 40) { // handle right && down arrow
          callback = self.scrollToNextBoundary;
        }
        if (callback) {
          if (event.altKey || event.ctrlKey || event.metaKey) {
            callback = self.beep;
          }
          callback.call(self);
          self.lastKeyPress = event.keyCode;
          event.preventDefault();
          event.returnValue = false;
        }
      });
      $(window).on("keyup", function(event) {
        if (self.lastKeyPress === event.keyCode) {
          self.lastKeyPress = undefined;
          event.preventDefault();
          event.returnValue = false;
        }
      });
    },

    beep: function() {
      window.encpPlatform.beep();
    },

    disableInputElements: function() {
      $("input").attr("disabled", "true");
    },

    registerFocusListener: function() {
      var self = this;
      var anchors = $('a');
      anchors.on('focus', function () {
        self.focused = $(this);
      });
      anchors.on('blur', function () {
        if (self.focused && self.focused == $(this)) {
          self.focused = null;
        }
      });
    },

    validNoteLinks: function() {
      return $(".encp-note-link:not(.encp-broken-link)");
    },

    setupInitialFocus: function() {
      var self = this;
      var noteLinks = self.validNoteLinks();
      if (!noteLinks.length || $(window).scrollTop() > 0 || self.focused) {
        return;
      }
      var x = window.scrollX;
      var y = window.scrollY;
      $(noteLinks.get(0)).focus();
      window.scrollTo(x, y);
    },

    pageBreakOffset: function($nextPageBreak) {
      if ($nextPageBreak.length > 0) {
        return $nextPageBreak.offset().top;
      } else {
        return $(document).height();
      }
    },

    setBreakAtIndexEnabled: function(breakIndex, enabled) {
      return this.sectionBreak.setBreakAtIndexEnabled(breakIndex, enabled);
    },

    /**
     * Called by the platform when page break changes.
     */
    updatePageBreaks: function(animated) {
      var self = this;
      ENCPDeferred.
        doNow(function() {
          self.imageLayout.setupCaptions(self.sectionBreak);
        })
        .then(function() {
          $('img.encp-loaded').each(function() {
            if (animated) {
              this.classList.add(self.SECTION_BREAK_ANIMATION_CLASS);
            }
            self.imageLayout.adjustImage(this, self.viewPort(), self.sectionBreak);
          });
        })
        .then(function() {
          self.readyToSetupPageBreaks = true;
          self.setupPageBreaks(animated);
        })
        .done();
    },

    hasEnabledSectionBreaks: function() {
      return this.breakLayout.hasEnabledUserBreaks();
    },

    /**
     * Converts the hr to section breaks and updates the UI
     * @returns {boolean} if any breaks were converted
     */
    convertHRsToEnabledSectionBreaks: function() {
      var converter = new ENCPSectionBreakHRConverter();
      if (converter.convert(this.sectionBreak)) {
        this.updatePageBreaks(true);
        if (this.layoutEditorController) {
          this.layoutEditorController.refreshSectionBreaks();
        }
        this.scrollToTopOffset(0, true);
        return true;
      } else {
        return false;
      }
    },

    /**
     * Perform auto layout (enabling section breaks around images and/or tables)
     * @return {boolean} true if one or more breaks were enabled.
     */
    performAutoLayout: function () {
      var formatter = new ENCPSectionBreakAutoFormatter();
      formatter.titleElement = document.querySelector('.encp-note-title');
      if (formatter.performAutoLayout(this.sectionBreak)) {
        this.updatePageBreaks(true);
        if (this.layoutEditorController) {
          this.layoutEditorController.refreshSectionBreaks();
        }
        this.scrollToTopOffset(0, true);
        return true;
      }
      return false;
    },

    /**
     * Disable all user enabled breaks (clear them all)
     */
    disableAllEnabledSectionBreaks: function () {
      this.sectionBreak.disableAllEnabledSectionBreaks();
      this.updatePageBreaks(true);
      if (this.layoutEditorController) {
        this.layoutEditorController.refreshSectionBreaks();
      }
      this.scrollToTopOffset(0, true);
    },

    setupPageBreaksIfNeeded: function() {
      if (!this.readyToSetupPageBreaks ||
        this.numberOfLoadedImages < this.imageContainers.length ||
        !this.isNoteSource()) {
        return;
      }

      this.setupPageBreaks(false);
    },

    setupPageBreaks: function(animated) {
      // TODO: Take into account "animated"
      if (!this.readyToSetupPageBreaks) {
        ENCPLogger.logWarn('Not ready to setup page breaks.');
        return;
      }

      var imageLayout = this.imageLayout;
      var viewPortSize = this.viewPort();
      var minimumMargin = Math.floor(this.MIN_PAGEMARGIN_RATIO * viewPortSize.height);

      // Title
      var titlePadding = {'padding-top': '', 'padding-bottom': ''};
      if (this.breakLayout.hasEnabledUserBreaks()) {
        if (imageLayout.hasNoContent(0)) {
          // The first page has only title, break layout makes title vertically centered.
          titlePadding = {'padding-top': '0', 'padding-bottom': '0'};
        } else {
          var topPadding = (this.titlePadding.top / (this.titlePadding.top + this.titlePadding.bottom)) * minimumMargin * 4;
          var bottomPadding = (this.titlePadding.bottom / (this.titlePadding.top + this.titlePadding.bottom)) * minimumMargin * 4;
          titlePadding =  {
            'padding-top': Math.floor(topPadding) + 'px',
            'padding-bottom': Math.ceil(bottomPadding) + 'px'
          };
        }
      }
      $('.encp-note-title').css(titlePadding);

      // Setup Tables
      imageLayout.adjustTableMargins(viewPortSize);

      // All sections
      this.breakLayout.setViewPortSize(viewPortSize.width, viewPortSize.height);
      this.breakLayout.setupPageBreaks(function(prevBreak,nextBreak,pageIndex) {
        if (prevBreak === undefined && nextBreak === undefined) {
          // no section break
          var effectiveBodyHeight = 0;
          var $noteBody = $('#en-note');
          if ($noteBody.length) {
            effectiveBodyHeight = viewPortSize.height;
            effectiveBodyHeight -= ENCPUtilities.elementPositionRelativeToParent($noteBody.get(0),null).y;
            effectiveBodyHeight -= $noteBody.height();
          }
          return {
            top: 0,
            bottom: Math.max(effectiveBodyHeight,minimumMargin),
            pageHeightOverride: 0
          }
        }
        return {
          top: imageLayout.hasTopMargin(pageIndex) ? minimumMargin : 0,
          bottom: imageLayout.hasBottomMargin(pageIndex) ? minimumMargin : 0,
          pageHeightOverride: imageLayout.getPageHeightIfAvailable(pageIndex)
        };
      });

      this.pageBoundaries = null;
      this.didSetupPageBreaks = true;
    },

    setup: function() {
      this.sectionBreak = new ENCPSectionBreak(document.body);
      this.breakLayout = new ENCPSectionBreakLayout(this.sectionBreak);
      this.imageLayout = new ENCPImageLayout(this.isNoteSource());
      // TODO: Simplify dependencies below
      this.mediaContents = new ENCPMediaContents(this);
      this.platformMediaContents = new ENCPPlatformMediaContents(this.mediaContents);
      this.mediaContents.platformContents = this.platformMediaContents;
      this.mediaContents.setupMediaContainers();

      var self = this;

      self.referenceScreenResolution = self.REFERENCE_SCREEN_RESOLUTION;
      self.referenceFontSize = self.REFERENCE_FONT_SIZE_IN_PX;
      self.imageContainers = $(".encp-media-container img");
      self.numberOfLoadedImages = 0;

      var $title = $('.encp-note-title');
      self.titlePadding = {
        top: parseFloat($title.css('padding-top')),
        bottom: parseFloat($title.css('padding-bottom'))
      };
      if (self.titlePadding.top == 0 && self.titlePadding.bottom == 0) {
        self.titlePadding = {top: 1, bottom: 1};
      }

      if (window.encpPlatform.setupPlatform) {
        window.encpPlatform.setupPlatform();
      }

      self.imageLayout.setupCaptions(self.sectionBreak);

      self.registerImageLoadListener();
      self.registerScrollListener();
      if (window.encpPlatform.shouldHandleResizing()) {
        self.registerResizeHandler();
      }
      self.registerBrokenLinkListener();

      self.scalePresentation();
      self.registerKeydownHandler();
      self.registerFocusListener();
      self.disableInputElements();

      self.previousDocumentHeight = $(document).height();

      $(window).focus( function() {
        self.setupInitialFocus();
      });

      ENCPDeferred
        .doNow(function() {
          self.presentationPageLoaded();
        })
        .then(function() {
          // setup page breaks after images are loaded
          self.setupPageBreaksIfNeeded();
          window.encpPlatform.didParseMediaItems(self.mediaContents.getMediaItems());
        })
        .waitUntil(function() {
          return self.didSetupPageBreaks || !self.isNoteSource();
        })
        .then(function() {
          if (self.layoutEditorController) {
            self.layoutEditorController.updateDocumentHeight();
            self.layoutEditorController.updateZoom();
          }
          //TODO {CP-2968}: Check if this needs to be split up into two functions (finishLoad & finishLayingOut)
          window.encpPlatform.didFinishLayouting();
        })
        .then(function() {
          window.encpPlatform.didFinishPageLoad();
        })
        .done();
    },

    tearDown: function() {
      ENCPDeferred.tearDown();
    },

    isAtEndOfNote: function() {
      var documentHeight = document.height;
      return ($(window).scrollTop() + this.viewPort().height >= documentHeight);
    },

    isOnePageNote: function() {
      return (document.height <= this.viewPort().height);
    },

    notifyPlatformOfEndOfNoteChange: function(allowSwitchToNextNote) {
      var self = this;
      if (self.isAtEndOfNote()) {
        if (!self.isAlreadyAtEndOfNote) {
          window.encpPlatform.didMoveToEndOfNote();
        }
        self.isAlreadyAtEndOfNote = true;
      } else if (self.isAlreadyAtEndOfNote) {
        window.encpPlatform.didMoveFromEndOfNote();
        self.isAlreadyAtEndOfNote = false;
      }
    },

    markScrollPosition: function() {
      var self = this;
      if (self.isUpdatingLayout || self.isRecoveringScrollPosition) {
        return;
      }
      if (self.scrollMarker) {
        self.scrollMarker.removeClass('encp-scroll-marker');
      }
      var viewPort = self.viewPort();
      var centerElement = document.elementFromPoint(viewPort.width / 2, viewPort.height / 2);
      var $centerElement = centerElement ? $(centerElement) : $('body');
      if ($centerElement.innerHeight() > viewPort.height) {
        self.markerPosition = ($(window).scrollTop() + viewPort.height / 2) / $(document).height();
      } else {
        self.markerPosition = -1;
      }
      self.scrollMarker = $centerElement;
      self.scrollMarker.addClass('encp-scroll-marker');
      self.targetScrollPosition = -1;
    },

    recoverScrollPosition: function() {
      if (this.isUpdatingLayout ||
          this.isTouched ||
          this.targetScrollPosition > -1 ||
          !this.scrollMarker) {
        return;
      }

      this.isRecoveringScrollPosition = true;
      if (this.breakLayout.hasEnabledUserBreaks()) {
        var positionToBeRestored = this.scrollPosition();
        if (this.markerPosition > 0) {
          positionToBeRestored = $(document).height() * this.markerPosition;
        } else if (this.scrollMarker) {
          positionToBeRestored = $(this.scrollMarker).offset().top;
        }
        var pageIndex = this.breakLayout.pageNumberForOffset(positionToBeRestored);
        var pageLimit = this.breakLayout.pageLimits(pageIndex);
        if (pageLimit) {
          positionToBeRestored = pageLimit.top;
        }
        this.scrollToTopOffset(positionToBeRestored, false);
      } else if (this.markerPosition < 0) {
        var viewPort = this.viewPort();
        var centerElement = document.elementFromPoint(viewPort.width / 2, viewPort.height / 2);
        if (centerElement && $(centerElement).is('.encp-scroll-marker')) {
          this.isRecoveringScrollPosition = false;
          return;
        }
      } else {
        this.scrollToTopOffset(($(document).height() * this.markerPosition) -  this.viewPort().height / 2, false);
      }
      if (this.scrollMarker) {
        this.scrollIntoView(this.scrollMarker);
      }
      this.markScrollPosition(); // keep marker position up-to-date
    },

    registerScrollListener: function () {
      var self = this;
      self.isAlreadyAtEndOfNote = false;
      window.encpPlatform.didScrollToPosition(self.lastScrollPosition, self.isAnimatingScroll);
      var $window = $(window);

      $window.on("scroll", function () {
        if (self.isRecoveringScrollPosition) {
          self.isRecoveringScrollPosition = false;
        } else {
          self.markScrollPosition();
        }
        self.lastScrollPosition = $(window).scrollTop();
        window.encpPlatform.didScrollToPosition(self.lastScrollPosition, self.isAnimatingScroll);
        self.notifyPlatformOfEndOfNoteChange();
        self.targetScrollPosition = -1;
      });
      $window.on('touchstart', function() {
        self.isTouched = true;
      });
      $window.on('touchend', function() {
        self.isTouched = false;
      });
    },

    registerBrokenLinkListener: function() {
      $(".encp-broken-link").on("mousedown", function(event) {
        event.preventDefault();
        return false;
      });
    },

    completeImageLoading: function(image) {
      var $image = $(image);
      if ($image.hasClass('encp-loaded')) {
        return; // already loaded
      }
      if (!$image.hasClass("encp-document")) {
        var self = this;
        this.mediaContents.loadMediaImage(image, function(width, height) {
          if (width && height) {
            self.imageLayout.setImageBaseSize(image, width, height);
            // Ensure a default size is set on all images so they respect DPI
            // Most images will have their size changed anyway by the resizing rules but this sets a baseline in case they aren't
            var imageSize = self.imageLayout.getImageBaseSize(image);
            $(image).css('width', imageSize.width + 'px');
            $(image).css('height', imageSize.height + 'px');
          }
          self.computeAspectRatio(image);
          window.encpPlatform.didAdjustImages();
        });
      } else {
        this.computeAspectRatio(image);
      }
    },

    computeAspectRatios: function() {
      var self = this;
      self.imageContainers.each(function() {
        self.completeImageLoading(this);
      });
      window.encpPlatform.didAdjustImages();
    },

    computeAspectRatio: function(element) {
      this.imageLayout.adjustImage(element, this.viewPort(), this.sectionBreak);
      $(element).addClass("encp-loaded");
      ++this.numberOfLoadedImages;
      this.setupPageBreaksIfNeeded();
    },

    registerImageLoadListener: function () {
      var self = this;
      self.imageContainers.bind("load", function() {
        var image = this;
        self.completeImageLoading(image);
        image.addEventListener("webkitTransitionEnd", function () {
          if (image.classList.contains(self.SECTION_BREAK_ANIMATION_CLASS)) {
            image.classList.remove(self.SECTION_BREAK_ANIMATION_CLASS);
          }
        }, false);
      });
    },

    presentationPageLoaded: function () {
      // compute aspect ratios because image load listener doesn't work in all cases.
      this.computeAspectRatios();
      this.readyToSetupPageBreaks = true;
    },

    scrollIntoView: function(element) {
      $(window).scrollTop($(element).offset().top + ($(element).height() / 2) - (this.viewPort().height / 2));
      self.targetScrollPosition = -1;
    },
    
    scrollToDocumentWithURL: function(url, index) {
      var $element = $("img[src='"+url+"']");
      if (index !== undefined && index > 0 && index < $element.length) {
        $element = $element.eq(index);
      }
      if ($element.length) {
        this.scrollIntoView($element.get(0));
      }
    },

    updateMediaItem: function(item) {
      item = JSON.parse(item);
      if (item.identifier === undefined || item.mimetype === undefined) {
        return;
      }
      this.mediaContents.updateMediaItem(item);
    },

    isNoteSource: function() {
      return $("html").hasClass("notesource");
    },

    sourceType: function() {
      return $('html').is('.notesource') ? 'notesource' : 'websource';
    },

    /**
     * Called by the platform.
     * @param direction Up/down as defined in the function.
     * @returns {Number} Scroll offset for page down/up
     */
    getSectionBoundary: function(direction) {
      var NEXT_SECTION = 1;
      var PREV_SECTION = 2;
      var scrollPosition = this.scrollPosition();
      switch (direction) {
        case NEXT_SECTION:
          return this.breakLayout.pageDownOffset(scrollPosition);
        case PREV_SECTION:
          return this.breakLayout.pageUpOffset(scrollPosition);
      }
      return scrollPosition;
    },

    setupPageBoundaries: function() {
      if (!this.didSetupPageBreaks || this.pageBoundaries || !this.isNoteSource()) {
        return;
      }

      var viewPortHeight = this.viewPort().height;
      var $snappableElements = $('img:visible, table').not('.encp-small-image');
      var $visibleElements = $('*:visible');
      var candidateIndex = 0;
      var hasContentsBetweenCandidates = false;

      function getSnappableCandidate(position) {
        hasContentsBetweenCandidates = false;
        var initialCandidate = candidateIndex;
        var $candidate = $($snappableElements.get(candidateIndex));
        // Passing through all candidates which are out of bounds.
        while ($candidate.length && $candidate.offset().top + $candidate.height() <= position + viewPortHeight) {
          $candidate = $($snappableElements.get(++candidateIndex));
        }
        // Checking any contents between snappable elements.
        if ($candidate.length && (initialCandidate != candidateIndex || candidateIndex == 0)) {
          var firstIndex = 0;
          var lastIndex = $visibleElements.index($candidate);
          if (initialCandidate != candidateIndex) {
            firstIndex = $visibleElements.index($snappableElements.get(initialCandidate)) + 1;
          }
          if (firstIndex < lastIndex) {
            $visibleElements.slice(firstIndex, lastIndex).each(function() {
              if ($(this).text().trim().length > 0) {
                hasContentsBetweenCandidates = true;
              }
              return !hasContentsBetweenCandidates;
            });
          }
        }
        return $candidate.get(0);
      }

      function getBreakBoundary(position) {
        var breakLayout = this.breakLayout;
        if (breakLayout.hasEnabledUserBreaks()) {
          var pageIndex = breakLayout.pageNumberForOffset(position);
          var sectionOffset = breakLayout.pageLimits(pageIndex) || {top:0, bottom:0};
          var isScrollable = (sectionOffset.bottom - sectionOffset.top) > viewPortHeight;
          var nextBoundary = breakLayout.pageDownOffset(position);
          if (!isScrollable || nextBoundary == sectionOffset.bottom || nextBoundary < position + viewPortHeight) {
            return nextBoundary;
          }
        }
        // The breakLayout could not determine the next boundary..
        return Math.NaN;
      }

      var currentBoundary = 0;
      var lastBoundary = -1;
      var boundaries = [currentBoundary];
      var documentHeight = $(document).height();
      var scrollOverlap = Math.floor(viewPortHeight * this.MIN_PAGEMARGIN_RATIO);

      // TODO: (CP-2995) We should rewrite logic how to calculate boundaries. This is fix when body.height is 
      //  lower than following calculation and it's caused by two thing:
      //  
      //  1. transformation at Presentation.css -> .encp-media-container-document > .encp-shadow.encp-first-shadow
      //  2. image layout for PDF has no bottom spacer as the last element on the page,
      //     processed at ENCPImageLayout - resetPageMediaInfo
      while (lastBoundary != currentBoundary && currentBoundary + viewPortHeight < documentHeight) {
        lastBoundary = currentBoundary;
        var candidate = getSnappableCandidate.call(this,currentBoundary);
        var nextBoundary = getBreakBoundary.call(this,currentBoundary);
        if (isNaN(nextBoundary)) {
          // No boundary from break layout, so we should find next boundary based on snappable elements.
          if (candidate) {
            nextBoundary = candidate.offsetTop;
            var candidateHeight = candidate.clientHeight;
            if (candidateHeight < viewPortHeight) {
              // Centering the candidate except large portrait images.
              nextBoundary -= Math.ceil((viewPortHeight - candidateHeight) / 2);
            }
            var pageSize = nextBoundary - currentBoundary;
            if (pageSize <= 0 ||
                (pageSize > viewPortHeight && hasContentsBetweenCandidates)) {
              // Invalid boundary => applying default scroll offset
              //  - pageSize must be greater than 0.
              //  - Should not be skipped if there are any contents between candidates.
              nextBoundary = currentBoundary + viewPortHeight - scrollOverlap;
            }
          } else {
            // No snappble elements, applying default scroll offset.
            nextBoundary = currentBoundary + viewPortHeight - scrollOverlap;
          }
        }
        boundaries.push(nextBoundary);
        currentBoundary = nextBoundary;
      }
      this.pageBoundaries = boundaries;
    },

    getNearestBoundary: function(position) {
      if (!this.pageBoundaries) {
        this.setupPageBoundaries();
      }
      if (this.pageBoundaries) {
        for (var i = this.pageBoundaries.length - 1; i >= 0; --i) {
          var boundary = Math.floor(this.pageBoundaries[i]);
          if (boundary > position) {
            continue;
          }
          return boundary;
        }
      }
      return position;
    },

    getPreviousBoundary: function(scrollPosition) {
      if (scrollPosition === undefined) {
        scrollPosition = this.scrollPosition();
      }
      if (!this.pageBoundaries) {
        this.setupPageBoundaries();
      }
      if (this.pageBoundaries) {
        for (var i = this.pageBoundaries.length - 1; i >= 0; --i) {
          var boundary = Math.floor(this.pageBoundaries[i]);
          if (boundary >= scrollPosition) {
            continue;
          }
          return boundary;
        }
        return this.pageBoundaries[0];
      }
      var defaultScrollOffset = Math.ceil(this.viewPort().height * (1.0 - this.MIN_PAGEMARGIN_RATIO));
      return Math.max(0,scrollPosition - defaultScrollOffset);
    },

    getNextBoundary: function() {
      var scrollPosition = this.scrollPosition();
      if (!this.pageBoundaries) {
        this.setupPageBoundaries();
      }
      if (this.pageBoundaries) {
        var numberOfBoundaries = this.pageBoundaries.length;
        for (var i = 0; i < numberOfBoundaries; ++i) {
          var boundary = Math.floor(this.pageBoundaries[i]);
          if (boundary <= scrollPosition) {
            continue;
          }
          return boundary;
        }
        return this.pageBoundaries[numberOfBoundaries - 1];
      }
      var defaultScrollOffset = Math.ceil(this.viewPort().height * (1.0 - this.MIN_PAGEMARGIN_RATIO));
      return scrollPosition + defaultScrollOffset;
    },

    pageBreakOffsets: function () {
      var self = this;
      var results = [];

      // First printing page divider
      results.push(0.0);

      var findEnabledBreaks = this.sectionBreak.findEnabledBreaks();
      findEnabledBreaks.forEach(function (enabledBreak) {
        results.push(Math.floor(self.breakLayout.pageOffsetForBreak(enabledBreak)));
      });

      // Last printing page divider
      results.push(document.height);

      return JSON.stringify(results);
    },

    scrollToPreviousBoundary: function() {
      var self = this;

      // Check if displayed contents are the top of the note, switch to previous note if needed.
      self.notifyPlatformOfEndOfNoteChange();
      if (self.scrollPosition() <= 0) {
        // Do we need to call any platform function here?
        return true;
      }

      var newOffsetTop = self.getPreviousBoundary();
      self.scrollToTopOffset(newOffsetTop, false);
      return false;
    },

    scrollToNextBoundary: function() {
      var self = this;

      // Check if displayed contents are reached the end of the note, switch to next note if needed.
      self.notifyPlatformOfEndOfNoteChange();
      if (self.isAtEndOfNote()) {
        return true;
      }

      var newOffsetTop = self.getNextBoundary();
      self.scrollToTopOffset(newOffsetTop, false);
      return false;
    },

    focusNextOrCurrentNoteLink: function(currentNoteLink) {
      var self = this;
      var noteLinks = self.validNoteLinks();
      var index = noteLinks.index($(".encp-note-link[href='" + currentNoteLink + "']"));
      if (index >= 0) {
        if (index < noteLinks.length - 1) {
          index += 1;
        }
        $(noteLinks.get(index)).focus();
      } else {
        ENCPLogger.logWarn("didn't find note link!");
      }
    },

    scrollPosition: function() {
      return (this.targetScrollPosition < 0) ? $(window).scrollTop() : this.targetScrollPosition;
    },

    scrollToTopOffset: function(topOffset, animate) {
      var self = this;
      if (topOffset < 0) {
        topOffset = 0;
      }

      if (animate) {
        var $scrollObjects = $('body');
        $scrollObjects.stop();

        self.targetScrollPosition = topOffset;

        self.isAnimatingScroll = true;
        $scrollObjects.animate({
          scrollTop: topOffset
        }, {
          duration: 500,
          complete: function() {
            self.isAnimatingScroll = false;
            if (topOffset == self.targetScrollPosition) {
              self.targetScrollPosition = -1;
            }
          }
        });
      } else {
        $(window).scrollTop(topOffset);
        self.targetScrollPosition = -1;
      }

    },

    animatedScrollToMarkerID: function(markerID) {
      var markerElement = $('#' + markerID);
      if (!markerElement.length) {
        return;
      }

      var viewPortTop = this.scrollPosition();
      var viewPortHeight = this.viewPort().height;
      var viewPortMarginHeight = 0.2 * viewPortHeight;
      var topCorrection = (markerElement.offset().top) - (viewPortTop + viewPortMarginHeight);
      var bottomCorrection = (markerElement.offset().top + markerElement.height()) - (viewPortTop + viewPortHeight - viewPortMarginHeight);
      var scrollCorrection = (topCorrection < 0) ? topCorrection : ((bottomCorrection > 0) ? bottomCorrection : 0);
      if (scrollCorrection) {
        var zoomString = $("html").css("zoom");
        if (zoomString) {
          scrollCorrection *= parseFloat(zoomString);
        }
      }

      // Check if the new scroll position would display two sections.
      // If so, scroll to the top or bottom page break so only one section is displayed
      var markerPage = this.breakLayout.pageNumberForOffset(markerElement.offset().top);
      var viewPortTopPage = this.breakLayout.pageNumberForOffset(viewPortTop + scrollCorrection);
      var viewPortBottomPage = this.breakLayout.pageNumberForOffset(viewPortTop + scrollCorrection + viewPortHeight);

      if (viewPortTopPage != viewPortBottomPage) {
        if (markerPage == viewPortTopPage) {
          this.scrollToTopOffset(this.breakLayout.pageLimits(viewPortTopPage).bottom - viewPortHeight, true);
        }
        if (markerPage == viewPortBottomPage) {
          this.scrollToTopOffset(this.breakLayout.pageLimits(viewPortBottomPage).top, true);
        }
      } else if (scrollCorrection) {
        this.scrollToTopOffset(viewPortTop + scrollCorrection, true);
      }
    },

    scrollToCursorPosition: function() {
      var cursorPosElement = $('#en-editor-last-insertion-point');
      if (!cursorPosElement.length) {
        return;
      }
      var self = this;

      var cursorTopOffset = cursorPosElement.offset().top;
      var cursorHeight = cursorPosElement.height();
      var viewPortHeight = self.viewPort().height;

      var scrollPosition = -1;

      // If an image is selected the 'span#en-editor-last-insertion-point' gets inserted
      // right before the .encp-media-container (and it has the same top offset as the image)
      var selectedImage = cursorPosElement.next('.encp-media-container').find('img');
      if (selectedImage.length) {
        var imagePageIndex = self.breakLayout.pageNumberForOffset(cursorTopOffset);
        if (!self.imageLayout.hasImageHeaderInPage(imagePageIndex)) {
          scrollPosition = self.getNearestBoundary(selectedImage.offset().top);
        }
      }

      //Gets the page offset of the page where the cursor is placed
      if (scrollPosition < 0) {
        scrollPosition = this.getPreviousBoundary(cursorTopOffset);
      }

      // If both the cursor and the page top fit on the screen, we scroll to the page top,
      // otherwise we center the cursor position on the screen
      if (scrollPosition < 0 || ((cursorTopOffset + cursorHeight) - scrollPosition >= viewPortHeight)) {
        var zoomCorrection = 1;
        if($('html').css('zoom')) {
          zoomCorrection = parseFloat($('html').css('zoom'));
        }
        scrollPosition = (cursorTopOffset + Math.floor(cursorHeight/2))*zoomCorrection - Math.floor(viewPortHeight/2);
      }
      self.scrollToTopOffset(scrollPosition, false);
    },

    isEndOfNote: function() {
      return $(window).scrollTop() + this.viewPort().height >= $(document).height();
      // TODO: Take into the account targetScrollPosition below
      return (this.targetScrollPosition < 0);
    },

    isBeginningOfNote: function() {
      var self = this;
      return (self.targetScrollPosition < 0 && $(window).scrollTop() == 0);
    },

    deselectLinkIfNeeded: function() {
      var self = this;
      if (self.focused) {
        self.focused.blur();
        self.focused = null;
        return true;
      }
      return false;
    },

    switchStyle: function(nameOfStyle) {
      this.themeStyles.applyTheme(nameOfStyle);
    },

    enableStyles: function(stylesToBeEnabled) {
      var self = this;
      $.each(self.styleSheets, function() {
        var style = this;
        var disabled = (stylesToBeEnabled.indexOf($(style).attr('title')) == -1);
        if (style.disabled == disabled) {
          return;
        }
        style.disabled = disabled;
        $(style).attr('rel',(disabled ? 'alternate stylesheet' : 'stylesheet'));
      });
    },

    viewPort: function() {
      return window.encpPlatform.viewPort();
    },

    validateAllAnchorLinks: function(validateFn) {
      var linkList = document.querySelectorAll('a[href], a[data-encp-disabled-link]');
      Array.prototype.slice.call(linkList, 0).forEach(function(element) {
        var needsValid = !!(validateFn(element));
        var hrefAttr = element.getAttribute('href');
        var isValid = !!(hrefAttr && hrefAttr.length);
        if (needsValid == isValid) {
          return;
        }
        if (needsValid) {
          element.setAttribute('href', element.getAttribute('data-encp-disabled-link'));
          element.removeAttribute('data-encp-disabled-link');
        } else {
          element.setAttribute('data-encp-disabled-link', element.getAttribute('href'));
          element.removeAttribute('href');
        }
      });
    },

    getTextSelection: function() {
      var selection = window.getSelection ? window.getSelection() : undefined;

      if (selection !== undefined && selection.rangeCount > 0) {
        return selection.getRangeAt(0).cloneContents().textContent;
      }

      return undefined;
    },

    tableItemsCount : function () {
      return document.querySelectorAll('.encp-table-container').length;
    },

    checkboxItemsCount : function () {
      return document.querySelectorAll('.encp-checkbox').length;
    },

    listItemsCount : function () {
      return document.getElementsByTagName("li").length;
    },

    hasHRsToConvert : function () {
      return ENCPSectionBreakHRConverter.hasConvertibleHRs(document);
    },

    canUseHRsConversion : function () {
      return (this.hasHRsToConvert() && !this.hasEnabledSectionBreaks());
    },

    canPerformAutoLayout : function () {
      if (this.hasEnabledSectionBreaks() || !this.sectionBreak.findAllBreaks().length) {
        return false;
      }
      var hasTitle = !!document.querySelector('.encp-note-title');
      var hasMediaContainer = !!document.querySelector('.encp-media-container');
      var hasTableContainer = !!document.querySelector('.encp-table-container');
      return (hasTitle || hasMediaContainer || hasTableContainer);
    },

    isInLayoutEditorMode: function() {
      return (this.layoutEditorController !== null);
    },

    enableLayoutEditorMode: function() {
      if (!this.layoutEditorController) {
        this.layoutEditorController = new ENCPLayoutEditorController(this.breakLayout, this.themeStyles);
      }
      this.validateAllAnchorLinks(function () {
        return false;
      });
      return this.layoutEditorController;
    },

    openMediaItem: function(url) {
      this.mediaContents.simulateOpeningMediaItem(url);
    }
  };

  return ENCPPresenter;
});
