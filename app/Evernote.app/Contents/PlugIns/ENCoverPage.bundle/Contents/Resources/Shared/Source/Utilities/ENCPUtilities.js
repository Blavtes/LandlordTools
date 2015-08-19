//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  /**
   * The ENCPUtilities object.
   */
  var ENCPUtilities = {};

  /**
   * Converts NodeList object into Array.
   * @param nodeList  The NodeList object.
   * @returns {Array} The Arrays of the objects from NodeList.
   */
  ENCPUtilities.arrayFromNodeList = function (nodeList) {
    // http://jsperf.com/convert-NodeList-to-Array
    return Array.prototype.slice.call(nodeList, 0);
  };

  /**
   * Finds the common parent element for two child.
   * @param element1 The html element.
   * @param element2 The html element.
   * @returns {*}    The parent element.
   */
  ENCPUtilities.parentForElements = function (element1, element2) {
    function parentChainLength(element) {
      var length = 0;
      while (element.parentNode) {
        element = element.parentNode;
        length++;
      }
      return length;
    }

    var element1ChainLength = parentChainLength(element1);
    var element2ChainLength = parentChainLength(element2);
    var skipCount = element1ChainLength - element2ChainLength;
    while (skipCount > 0) {
      skipCount--;
      element1 = element1.parentNode;
    }
    while (skipCount < 0) {
      skipCount++;
      element2 = element2.parentNode;
    }
    while (element1 !== element2) {
      element1 = element1.parentNode;
      element2 = element2.parentNode;
    }

    return element1;
  };

  /**
   * Calculates absolute position of the specified element related to the parent.
   * @param element       The html element.
   * @param parentElement The parent element.
   * @returns {{x: (Number|number), y: (Number|number)}} The absolute position of the element.
   */
  ENCPUtilities.elementPositionRelativeToParent = function (element, parentElement) {
    var pos = {x: element.offsetLeft, y: element.offsetTop};
    var parent = element.offsetParent;
    while (parent && parent != parentElement) {
      pos.x += parent.offsetLeft;
      pos.y += parent.offsetTop;
      parent = parent.offsetParent;
    }
    return pos;
  };

  /**
   * Create and attach a fresh stylesheet for the document.
   * @param styleSheetCallback Function to be called when CSSStyleSheet becomes available.
   *                           Takes one parameter, the CSSStyleSheet that has been created.
   * @returns {HTMLElement} Newly created style sheet element
   */
  ENCPUtilities.createStyleSheet = function(styleSheetCallback) {
    var styleElement = document.createElement('style');
    styleElement.classList.add('encp-style-sheet');

    var loadInterval = setInterval(function() {
      for (var i = 0, l = document.styleSheets.length; i < l; i++) {
        var styleSheet = document.styleSheets[i];
        if (styleSheet.ownerNode == styleElement) {
          clearInterval(loadInterval);

          if (typeof styleSheetCallback == 'function') {
            styleSheetCallback(styleSheet);
          }
          break;
        }
      }
    }, 10);

    document.head.appendChild(styleElement);
    
    return styleElement;
  };

  /**
   * Get the first child which has specified class.
   * @param parentElement  Parent element to search within
   * @param childClass     The class to be found
   * @returns {*}          The child element which has specified class or null
   */
  ENCPUtilities.getChildOfClass = function (parentElement, childClass) {
    for (var childNode = parentElement.firstChild; !!childNode; childNode = childNode.nextSibling) {
      if (childNode.nodeType != Node.ELEMENT_NODE) {
        continue;
      }
      if (childNode.classList.contains(childClass)) {
        return childNode;
      }
      var foundChildNode = this.getChildOfClass(childNode, childClass);
      if (foundChildNode) {
        return foundChildNode;
      }
    }
    return null;
  };

  /**
   * Test a given node matches a given selector.
   * @param aNode - to be tested
   * @param aSelector - to be checked to match
   * @returns {boolean} - true if a node matches a selector, false otherwise.
   */
  ENCPUtilities.matchesSelector = function(aNode, aSelector) {
    return (aNode.matches || aNode.webkitMatchesSelector).call(aNode, aSelector);
  };

  return ENCPUtilities;
});
