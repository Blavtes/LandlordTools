//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var $ = require('Shared/Utilities/JQueryExt');

  var ENCPPlatform = function() {
  };

  ENCPPlatform.prototype = {

    viewPortSize: null,
    scaleRatio: 1,

    host: function() {
      if (window.encpPlatformLink) {
        return window.encpPlatformLink;
      }

      console.log('[WARN] Cannot access host');
      window.encpPlatformLink = { // dummy host link
        willSetupWebview: function() {},
        didClickMediaWithParameters: function(params) {},
        requestDocumentInformationForURL: function(url, mime, filename, successCallback, errorCallback) {},
        didMoveToEndOfNote: function() {},
        didMoveFromEndOfNote: function() {},
        beep: function() {},
        didParseMediaItems: function(mediaInfo) {},
        //TODO {CP-2968}: Do we need these 4 functions + applicationDidLoad + willSetupWebview to manage the loading sequence
        willStartLayouting: function() {},
        didFinishLayouting: function() {},
        didFinishPageLoad: function() {},
        didFinishStyleUpdate: function() {},
        didScrollToPosition: function(position, isAnimating) {},
        navigateToNextNote: function() {},
        navigateToPreviousNote: function() {},
        showLog: function(messageData) {},
        viewPort: function () { return {height: $(window).height(), width: $(window).width()} },
        setViewPortSize: function (viewPortSize) {},
        didChangeSectionBreaks: function(enabledIndexes, disabledIndexes, withDragging) {},
        didClickPageAtOffsetY: function(pageOffsetY) {},
        didSetupHeaderCaptions: function(headerCaptionsCount) {},
        didSetupFooterCaptions: function(footerCaptionsCount) {},
        applicationDidLoad: function(application) {}
      };

      return window.encpPlatformLink;
    },

    /**
     * Setup - any platform specific configuration.
     */
    setupPlatform: function() {
      this.host().willSetupWebview();
    },

    /**
     * Notify the host about the user clicking an image or document
     * Typically, the host will open the document viewer (gallery mode).
     *
     * @param params   An object with fields: 'src', 'mime' and 'mediaFrame'
     */
    didClickMediaWithParameters: function(params) {
      this.host().didClickMediaWithParameters(JSON.stringify(params));
    },

    /**
     * For a document/image URL calls success callback with the a boolean if it is a document (PDF, office) and
     * how many pages the document has.
     * @param url               Request information about url
     * @param mime              MIMEType of attachment
     * @param filename          File name of attachment
     * @param successCallback   Called when information has been successfully retrieved
     *                          successCallback parameters:
     *                           isDocument       Do we need to display it as a document?
     *                           numberOfPages    How many pages are there?
     *                           width            The width the image should be displayed at
     *                           height           The height the image should be display at
     *                           predefinedName   ?
     * @param errorCallback     Called when information could not be retrieved
     *                          errorCallback has no parameters.
     */
    requestDocumentInformationForURL: function(url, mime, filename, successCallback, errorCallback) {
      if (!url || !mime) {
        this.showLog({
          message: 'invalid url or invalid mime type',
          caller: 'ENCPPlatform.requestDocumentInformationForURL'
        });
        return;
      }
      if (!filename) {
        filename = "";
      }
      this.host().requestDocumentInformationForURL(url, mime, filename, successCallback, errorCallback);
    },

    /**
     * Notifies the host about the user reaching the end of the note.
     */
    didMoveToEndOfNote: function() {
      this.host().didMoveToEndOfNote();
    },

     /**
      * Notifies the host about the user moving away from the end of the note
      */
    didMoveFromEndOfNote: function() {
      this.host().didMoveFromEndOfNote();
    },

    /**
     * Sound an alert
     */
    beep: function() {
      this.host().beep();
    },

    /**
     * Notify the host about the all media links in the note
     * @param mediaInfo  Contains an array of media objects with
     *                   {src : Media URL, mime : Media MIME}
     */
    didParseMediaItems: function(mediaInfo) {
      this.host().didParseMediaItems(JSON.stringify(mediaInfo));
    },

    /**
     * Notify host when just before layouting the page.
     */
    willStartLayouting: function() {
      this.host().willStartLayouting();
    },

    /**
     * Notify host when we're done layouting the page.
     */
    didFinishLayouting: function() {
      this.host().didFinishLayouting();
    },

    /**
     * Notify host when we're done loading the page.
     */
    didFinishPageLoad: function() {
      this.host().didFinishPageLoad();
    },

    /**
     * Notify host when we're done updating style.
     */
    didFinishStyleUpdate: function() {
      // nothing right now.
    },

    /**
     * Notify host about new scroll position
     * @param position   New vertical scroll offet
     */
    didScrollToPosition: function(position, isAnimating) {
      this.host().didScrollToPosition(position, isAnimating);
    },

    /**
     * Ask host to open the next note.
     */
    navigateToNextNote: function() {
      this.host().navigateToNextNote();
    },

    /**
     * Ask host to open the previous note.
     */
    navigateToPreviousNote: function() {
      this.host().navigateToPreviousNote();
    },

    /**
     * Record log on Evernote log system. Compatible with ENCPLogger.outputFunction.
     * @param messageData As described in ENCPLogger.outputFunction
     */
    showLog: function(messageData) {
      this.host().showLog(JSON.stringify(messageData));
    },

    /**
     * Prefix for media path.
     */
    EMBEDDED_MEDIA_PATH_PREFIX: "http://encoverpage.localhost/",

    /**
     * Process media in the note
     * @param rootElement Root element of elements to be processed
     */
    fixEmbeddedMedia: function (rootElement) {
      // <embed src="46dcdaf966eb6fcd7adc5964a1355069" type="evernote/x-attachment" id="en-media:video/quicktime:46dcdaf966eb6fcd7adc5964a1355069" height="49" width="265" style="cursor:pointer;" />
      var self = this;
      $(rootElement).find("embed[id^='en-media']").replaceWith(function () {
        var $embed = $(this);
        var $img = $("<img class='en-media '/>");
        var src = $embed.attr("src");
        var mime = $embed.attr('type');
        var filename = $embed.attr('title');

        var ext = "";
        if (filename.match(/.+\.([^.]+$)/)) {
          ext = RegExp.$1;
        }

        $img.attr("src", self.EMBEDDED_MEDIA_PATH_PREFIX + src + '?type=' + mime + '&ext=' + ext);
        $img.addClass($embed.attr("class"));

        $img.wrap('<div class="encp-media-container"/>').wrap('<div class="encp-media-preview"/>');
        return $img.closest('.encp-media-container')
          .attr("data-media-url", src)
          .attr("data-media-mime",mime)
          .attr('data-media-filename',filename)
          .addClass("encp-can-open-attachment");
      });
    },

    /**
     * Process image adjustment.
     */
    didAdjustImages: function() {
      $('img[src^="' + this.EMBEDDED_MEDIA_PATH_PREFIX + '"]').each(function() {
        $(this).closest('.encp-media-preview').css('width',$(this).width() + 'px');
      });
    },

    /**
     * Process media in the note
     * @param rootElement Root element of elements to be processed
     */
    markBrokenNoteLinks: function(rootElement) {
      // Mac plugin disables them internally
    },

    /**
     * Get viewPort size of the screen.
     * @returns {*} width:  width of the viewPort, height: height of viewPort.
     */
    viewPort: function() {
      if (this.viewPortSize == null) {
        var $window = $(window);
        return {
          height: $window.height(),
          width: $window.width()
        }
      } else {
        return this.viewPortSize;
      }
    },

    /**
     * Set viewPort size of the screen.
     * @param viewPortSize - to be set
     */
    setViewPortSize: function(viewPortSize) {
      viewPortSize = JSON.parse(viewPortSize);
      if (viewPortSize) {
        this.viewPortSize = viewPortSize;
      } else {
        this.viewPortSize = null;
      }
    },

    /**
     * Check if platform should handle window resize.
     * @returns true if resize should be handled, otherwise false
     */
    shouldHandleResizing: function() {
      return true;
    },

    /**
     * Check viewPort size has been set or not.
     * @returns true if viewPort size has been set.
     */
    hasViewPortBeenOverriden: function() {
      return false;
    },

    /**
     * Get images to be size adjustment required.
     * @param sourceType - source type of the contents to be considered.
     * @returns jQuery objects if required, otherwise null.
     */
    imagesToBeAdjusted: function(sourceType) {
      return null;
    },

    /**
     * Zoom level adjustment value
     */
    ADDITIONAL_ZOOM_PERCENT: 10,

    /**
     * Adjust zoom level for web source notes.
     * @param targetObj - target object to be modified
     * @param referenceResolution - reference resolution to determine zoom level of contents
     * @param userZoomLevel {number}
     */
    adjustZoomLevel: function(targetObj, referenceResolution, userZoomLevel) {
      if (referenceResolution == 0) {
        return;
      }
      var zoomPercent = (this.viewPort().width * 100 / referenceResolution) + this.ADDITIONAL_ZOOM_PERCENT;
      zoomPercent *= userZoomLevel;
      $(targetObj).css('zoom', '' + (zoomPercent / 100));
    },

    didChangeSectionBreaks: function(enabledIndexes, disabledIndexes, withDragging) {
      if (!enabledIndexes) {
        enabledIndexes = [];
      }
      if (!disabledIndexes) {
        disabledIndexes = [];
      }
      this.host().didChangeSectionBreaks(JSON.stringify({enabledIndexes: enabledIndexes, disabledIndexes: disabledIndexes, withDragging: withDragging}));
    },

    didClickPageAtOffsetY: function(pageOffsetY) {
      this.host().didClickPageAtOffsetY(pageOffsetY);
    },

    didSetupHeaderCaptions: function(headerCaptionsCount) {
      this.host().didSetupHeaderCaptions(headerCaptionsCount);
    },

    didSetupFooterCaptions: function(footerCaptionsCount) {
      this.host().didSetupFooterCaptions(footerCaptionsCount);
    },
    
   /**
    * Informs the platform the the javascript application has finished loading.
    * @param application - the application that was loaded
    */
    applicationDidLoad: function(application) {
      this.host().applicationDidLoad(application);
    }
  };

  return ENCPPlatform;
});


