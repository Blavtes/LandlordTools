//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var ENCPSectionBreak = require('Shared/LayoutEditor/ENCPSectionBreak');
  var ENCPSectionBreakAutoFormatter = require('Shared/LayoutEditor/ENCPSectionBreakAutoFormatter');
  var ENCPSectionBreakHRConverter = require('Shared/LayoutEditor/ENCPSectionBreakHRConverter');
  var ENCPUtilities = require('Shared/Utilities/ENCPUtilities');
  var ENCPClean = require('Mac/ENCPClean');

  /**
   * Note processor controlling breaks and note cleaning.
   * @constructor
   * @param rootElement The root element of note contents.
   */
  function ENCPNoteProcessor(rootElement) {
    this.rootElement = rootElement;
    this.cleanerRootElement = null;
    this.cleaner = new ENCPClean();
    this.sectionBreak = null;
  }

  /**
   * Split the DOM for cleaning and for saving.
   */
  function splitDOM() {
    if (this.cleanerRootElement) {
      throw "Already stored";
    }

    this.cleanerRootElement = this.rootElement.cloneNode(true);
    this.rootElement.parentElement.replaceChild(this.cleanerRootElement, this.rootElement);
  }

  /**
   * Remove cleaner DOM and restore content for saving.
   */
  function discardCleanerDOM() {
    if (!this.cleanerRootElement) {
      throw "Not stored";
    }

    this.cleanerRootElement.parentElement.replaceChild(this.rootElement, this.cleanerRootElement);
    this.cleanerRootElement = null;
  }

  /**
   * Get the element that contains just the note content
   * @returns {HTMLElement}
   */
  ENCPNoteProcessor.prototype.getNoteBodyForSaving = function() {
    var noteBody = this.rootElement.querySelector('#en-note');
    return (noteBody) ? noteBody : this.rootElement;
  };

  /**
   * Prepare note for processing by setting up the breaks and making a copy
   * @returns {boolean}
   */
  ENCPNoteProcessor.prototype.prepareForCleaning = function () {
    this.sectionBreak = new ENCPSectionBreak(this.getNoteBodyForSaving());
    this.cleaner.sectionBreak = this.sectionBreak;
    this.sectionBreak.setupBreaksAndTitle();
    splitDOM.call(this);
    return true;
  };

  /**
   * Run note cleaning process
   * @param attributes
   */
  ENCPNoteProcessor.prototype.runCleaner = function (attributes) {
    if (!this.cleanerRootElement) {
      throw "DOM has not been prepared for cleaning";
    }
    return this.cleaner.postprocess(this.cleanerRootElement, attributes);
  };

  /**
   * Replace DOM scripts with specified one and return its HTML.
   * @param requireJSPath  Path to the require.js loader script.
   * @param scriptPath     Path to the application script
   * @returns {string}     DOM HTML
   */
  ENCPNoteProcessor.prototype.getProcessedHTMLReplaceScripts = function(requireJSPath, scriptPath) {
    var clonedDoc = document.documentElement.cloneNode(true);
    ENCPUtilities.arrayFromNodeList(clonedDoc.getElementsByTagName('script')).forEach(function(element) {
      element.parentElement.removeChild(element);
    });

    var scriptTag = document.createElement('script');
    scriptTag.setAttribute('src', requireJSPath);
    scriptTag.setAttribute('data-main', scriptPath);
    clonedDoc.querySelector('head').appendChild(scriptTag);

    return clonedDoc.outerHTML;
  };

  /**
   * Restore the copy of a note saved by prepareForProcessing().
   */
  ENCPNoteProcessor.prototype.restoreAfterCleaning = function () {
    var success = true;

    var breakCountInOriginalNote = this.sectionBreak.findAllBreaks().length;
    var breakCountInCleanedNote = (new ENCPSectionBreak(document.body)).findAllBreaks().length;

    if (breakCountInOriginalNote != breakCountInCleanedNote) {
      success = false;
    }
    discardCleanerDOM.call(this);

    return success;
  };

  /**
   * Retrieve current note HTML formatted as required by the Evernote app.
   * @returns {string|outerHTML|*}
   */
  ENCPNoteProcessor.prototype.getHTML = function () {
    // preparing
    var converter = new ENCPSectionBreakHRConverter();
    converter.prepareHRForSaving(this.sectionBreak.rootElement);
    this.sectionBreak.prepareBreaksForSaving();

    // getting result
    var HTML = this.rootElement.outerHTML;

    // restoring - order of process must be reversed from preparing.
    this.sectionBreak.restoreBreaksAfterSaving();
    converter.restoreHRsAfterSaving();

    return HTML;
  };

  /**
   * Enable or disable a breakpoint. Must be called after restoreNote()
   * @param breakIndex  Index of break to be altered
   * @param enabled     YES - enable, NO - disable
   * @returns {*|boolean} true on success.
   */
  ENCPNoteProcessor.prototype.setBreakAtIndexEnabled = function(breakIndex, enabled) {
    return this.sectionBreak.setBreakAtIndexEnabled(breakIndex, enabled);
  };

  /**
   * Convert hr elements to enabled section breaks
   */
  ENCPNoteProcessor.prototype.convertHRsToEnabledSectionBreaks = function() {
    var converter = new ENCPSectionBreakHRConverter();
    return converter.convert(this.sectionBreak);
  };

  /**
   * Perform auto layout (enabling section breaks around images and/or tables)
   * @return {boolean} true if one or more breaks were enabled.
   */
  ENCPNoteProcessor.prototype.performAutoLayout = function () {
    var formatter = new ENCPSectionBreakAutoFormatter();
    if (this.cleaner.noteTitle) {
      formatter.titleElement = this.rootElement.firstElementChild;
    }
    return formatter.performAutoLayout(this.sectionBreak);
  };

  /**
   * Disable all user enabled breaks (clear them all)
   */
  ENCPNoteProcessor.prototype.disableAllEnabledSectionBreaks = function () {
    this.sectionBreak.disableAllEnabledSectionBreaks();
    return true;
  };

  return ENCPNoteProcessor;
});
