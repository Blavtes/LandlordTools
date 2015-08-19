//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var ENCPSectionBreak = require('Shared/LayoutEditor/ENCPSectionBreak');
  var ENCPUtilities = require('Shared/Utilities/ENCPUtilities');

  var CONVERTED_HR_MARKER_CLASS = 'encp-section-converted';
  var HR_TO_BE_CONVERTED = 'hr:not(.' + CONVERTED_HR_MARKER_CLASS + ')';
  var CONVERTED_HR = 'hr.' + CONVERTED_HR_MARKER_CLASS;

  /**
   * Handler to convert HR elements into enabled section breaks.
   * @constructor
   */
  function ENCPSectionBreakHRConverter() {
    this._removedHRsForSaving = null;
  }

  /**
   * Check whether the current document has any HR which can be converted into
   * breaks or not.
   * @param rootElement - to be checked.
   * @returns {boolean} true if convertible HR is available, false otherwise.
   */
  ENCPSectionBreakHRConverter.hasConvertibleHRs = function(rootElement) {
    // Needs to check HR which does not have any style attribute.
    return (rootElement.querySelectorAll(HR_TO_BE_CONVERTED).length > 0);
  };

  /**
   * Convert HR elements to enabled section breaks.
   * @param sectionBreak {ENCPSectionBreak} - to be given.
   * @returns {boolean} true if one or more breaks were enabled.
   */
  ENCPSectionBreakHRConverter.prototype.convert = function (sectionBreak) {
    if (sectionBreak.findEnabledBreaks().length) {
      return false;
    }

    var elementsList = sectionBreak.rootElement.querySelectorAll('.encp-section-break, ' + HR_TO_BE_CONVERTED);
    if (elementsList.length == 0) {
      return false;
    }

    var convertedBreaks = false;
    var previousElement = elementsList.item(0);
    for (var i = 1; i < elementsList.length; i++) {
      var currentElement = elementsList.item(i);
      if (currentElement.tagName.toLowerCase() == 'hr') {
        currentElement.classList.add(CONVERTED_HR_MARKER_CLASS);
        currentElement.style.display = 'none';
        if (ENCPSectionBreak.isBreak(previousElement)) {
          if (ENCPSectionBreak.isHiddenBreak(previousElement)) {
            sectionBreak.setBreakHidden(previousElement, false);
          }
          sectionBreak.setBreakEnabled(previousElement, true);
          convertedBreaks = true;
        }
      } else if (previousElement.tagName.toLowerCase() == 'hr') {
        sectionBreak.setBreakHidden(currentElement, true);
      }
      previousElement = currentElement;
    }

    return convertedBreaks;
  };

  /**
   * Remove converted HRs from the document and keep them aside.
   * @param rootElement - to be associated with.
   */
  ENCPSectionBreakHRConverter.prototype.prepareHRForSaving = function(rootElement) {
    if (this._removedHRsForSaving) {
      throw "Already stored HRs";
    }
    this._removedHRsForSaving = [];
    var convertedHRs = rootElement.querySelectorAll(CONVERTED_HR);
    ENCPUtilities.arrayFromNodeList(convertedHRs).forEach(function (aHR) {
      this._removedHRsForSaving.unshift({
        nextNode: aHR.nextSibling,
        parentNode: aHR.parentElement,
        node: aHR
      });
      aHR.parentElement.removeChild(aHR);
    },this);
  };

  /**
   * Restore HRs removed with prepareHRForSaving.
   */
  ENCPSectionBreakHRConverter.prototype.restoreHRsAfterSaving = function () {
    if (!this._removedHRsForSaving) {
      throw "Has no stored HRs";
    }
    this._removedHRsForSaving.forEach(function (nodeInfo) {
      nodeInfo.parentNode.insertBefore(nodeInfo.node, nodeInfo.nextNode);
    });
    this._removedHRsForSaving = null;
  };

  return ENCPSectionBreakHRConverter;
});