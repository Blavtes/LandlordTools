//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var ENCPUtilities = require('Shared/Utilities/ENCPUtilities');
  var ENCPSectionBreak = require('Shared/LayoutEditor/ENCPSectionBreak');

  function ENCPMonospaceProcessor() {
  }

  var MONOSPACE_INLINE_CLASS = 'encp-monospace-inline';
  var MONOSPACE_BLOCK_CLASS = 'encp-note-monospace';
  var fontInfoCache = {};
  var localCanvas = document.createElement("canvas");

  /**
   * Check whether a given font is monospace or not.
   * @param {String} fontName - name of font to be checked.
   * @returns {boolean} - true if a given font is monospace, false otherwise.
   */
  ENCPMonospaceProcessor.isMonospaceFont = function (fontName) {
    if (fontInfoCache[fontName] != undefined) {
      return (fontInfoCache[fontName] == 'fixed');
    }
    var isMono = false;
    if (fontName == 'Andale Mono' || fontName == 'Menlo' || fontName == 'Courier' || fontName == 'Courier New') {
      isMono = true;
    } else {
      var context = localCanvas.getContext("2d");
      context.font = '100px ' + fontName;
      isMono = (context.measureText('WWwwMMmm').width == context.measureText('..iijj--').width);
    }
    fontInfoCache[fontName] = isMono ? 'fixed' : 'proportional';
    return isMono;
  };

  /**
   * Mark a given element as a monospaced element.
   * @param element - to be marked.
   */
  ENCPMonospaceProcessor.markMonospace = function (element) {
    if (element) {
      element.classList.add(MONOSPACE_INLINE_CLASS);
    }
  };

  /**
   * Generate monospace container for a given array of elements
   * @param  {Array} monospaces - an array of elements to be merged
   * @returns {HTMLElement} - generated container.
   * @private
   */
  function monospaceContainer (monospaces) {
    var representTagName = monospaces[0].tagName.toLowerCase();
    var isBlock = (
      representTagName == 'p' ||
      representTagName == 'div' ||
      representTagName == 'blockquote' ||
      representTagName == 'pre' ||
      representTagName == 'ol' ||
      representTagName == 'ul');
    var container = document.createElement(isBlock ? 'div' : 'span');
    container.classList.add(MONOSPACE_BLOCK_CLASS);
    monospaces.forEach(function (anElement) {
      container.appendChild(anElement);
    });
    return container;
  }

  /**
   * Check a given element is within monospaced element or not.
   * @param {Element} node - to be checked.
   * @returns {boolean} true if the node or its parent node is monospaced element, false otherwise.
   * @private
   */
  function isWithinMonospaceNode(node) {
    var baseSelector = '.' + MONOSPACE_INLINE_CLASS;
    if (ENCPUtilities.matchesSelector(node,baseSelector)) {
      return true;
    }
    return ENCPUtilities.matchesSelector(node,baseSelector + ' *');
  }

  /**
   * Clean segmented monospaced elements.
   * @param {HTMLElement} rootElement - to be cleaned.
   * @param sectionBreak - to be associated with.
   */
  ENCPMonospaceProcessor.prototype.cleanSegmentedMonospaces = function (rootElement, sectionBreak) {
    var treeWalker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var monospaces = [];
    var previousBreak = null;
    for (var currentNode = treeWalker.currentNode; currentNode; currentNode = treeWalker.nextNode()) {
      if (currentNode.nodeType == Node.TEXT_NODE) {
        if (monospaces.length && currentNode.previousSibling && currentNode.nodeValue.match(/^\s+$/)) {
          var lastMonospace = monospaces[monospaces.length - 1];
          if ((previousBreak && previousBreak == currentNode.previousSibling)
            || lastMonospace == currentNode.previousSibling) {
            lastMonospace.innerText += currentNode.nodeValue;
            currentNode.nodeValue = '';
          }
        }
        continue;
      }
      if (currentNode.classList.contains(MONOSPACE_INLINE_CLASS)) {
        if (previousBreak) {
          sectionBreak.setBreakHidden(previousBreak);
          previousBreak = null;
        }
        monospaces.push(currentNode);
        continue;
      } else if (monospaces.length && !previousBreak && ENCPSectionBreak.isDisabledBreak(currentNode)) {
        previousBreak = currentNode;
        continue;
      }
      if (isWithinMonospaceNode(currentNode)) {
        continue;
      }
      if (monospaces.length > 1) {
        currentNode.parentNode.insertBefore(monospaceContainer(monospaces),currentNode);
      }
      monospaces = [];
      previousBreak = null;
    }
    if (monospaces.length > 1) {
      rootElement.appendChild(monospaceContainer(monospaces));
    }
  };

  return ENCPMonospaceProcessor;
});