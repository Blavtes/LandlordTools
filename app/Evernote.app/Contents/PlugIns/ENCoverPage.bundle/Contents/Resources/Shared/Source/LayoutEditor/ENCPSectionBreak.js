//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var $ = require('Shared/Utilities/JQueryExt');
  var ENCPUtilities = require('Shared/Utilities/ENCPUtilities');

  function ENCPSectionBreak (rootElement) {
    this.breaksDisabledForSaving = null;
    this.rootElement = rootElement;
  }

  var SECTION_STYLE_VALUE_ENABLED = '-evernote-encp-section-break:true;';
  var SECTION_STYLE_VALUE = "display:none;"+ SECTION_STYLE_VALUE_ENABLED;
  var SECTION_NOTE_TAG_ENABLED = '<hr style="' + SECTION_STYLE_VALUE + '"/>';

  var SECTION_TAG_CLASS = 'encp-section-break';
  var SECTION_TAG = '<div class="' + SECTION_TAG_CLASS +'"></div>';

  var HIDDEN_SECTION_TAG_CLASS = 'encp-hidden-section-break';
  var HIDDEN_SECTION_TAG = '<div class="' + HIDDEN_SECTION_TAG_CLASS +'"></div>';

  var ENABLED_SECTION_TAG_CLASS = 'encp-enabled-section-break';
  var ENABLED_SECTION_TAG = '<div class="' + ENABLED_SECTION_TAG_CLASS +'"></div>';

  function removeFromParent(element) {
    if(element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  }

  /**
   * Test if element is a section break.
   * @returns {boolean} true if element is a section break.
   */
  ENCPSectionBreak.isBreak = function(element) {
    if (!element) {
      return false;
    }
    var list = element.classList;
    return list.contains(SECTION_TAG_CLASS) ||
           list.contains(ENABLED_SECTION_TAG_CLASS) ||
           list.contains(HIDDEN_SECTION_TAG_CLASS);
  };

  /**
   * Test if element is a section break as embedded in the original note.
   * @returns {boolean} true if element is a section break.
   */
  ENCPSectionBreak.isNoteBreak = function(element) {
    if (!element) {
      return false;
    }
    var styleText = element.getAttribute('style');
    if (!styleText) {
      return false;
    }
    styleText = styleText.replace(/\s/g,"");
    return (styleText.indexOf(SECTION_STYLE_VALUE_ENABLED) != -1);
  };

  /**
   * Test if section break is disabled.
   * @returns {boolean} true if breakElement is disabled.
   */
  ENCPSectionBreak.isDisabledBreak = function(breakElement) {
    return (breakElement && breakElement.classList.contains(SECTION_TAG_CLASS));
  };

  /**
   * Test if section break is enabled.
   * @returns {boolean} true if breakElement is enabled.
   */
  ENCPSectionBreak.isEnabledBreak = function(breakElement) {
    return (breakElement && breakElement.classList.contains(ENABLED_SECTION_TAG_CLASS));
  };

  /**
   * Test if section break is hidden.
   * @returns {boolean} true if breakElement is hidden.
   */
  ENCPSectionBreak.isHiddenBreak = function(breakElement) {
    return (breakElement && breakElement.classList.contains(HIDDEN_SECTION_TAG_CLASS));
  };

  /**
   * Find all section break elements, both enabled and disabled.
   * @param {Element?} aTarget - target element if necessary, if it's null rootElement will be the target.
   * @returns Array of break elements.
   */
  ENCPSectionBreak.prototype.findAllBreaks = function(aTarget) {
    var theTarget = (aTarget) ? aTarget : this.rootElement;
    var breaksList = theTarget.querySelectorAll('.' + SECTION_TAG_CLASS +
                                                ', .' + ENABLED_SECTION_TAG_CLASS +
                                                ', .' + HIDDEN_SECTION_TAG_CLASS);
    return ENCPUtilities.arrayFromNodeList(breaksList);
  };

  /**
   * Find all note break elements.
   * @returns Array of break elements.
   */
  ENCPSectionBreak.prototype.findNoteBreaks = function() {
    var breaksList = this.rootElement.querySelectorAll("[style*='" + SECTION_STYLE_VALUE_ENABLED + "']");
    return ENCPUtilities.arrayFromNodeList(breaksList);
  };

  /**
   * Find all enabled section break elements.
   * @returns Array of break elements.
   */
  ENCPSectionBreak.prototype.findEnabledBreaks = function() {
    var breaksList = this.rootElement.querySelectorAll('.' + ENABLED_SECTION_TAG_CLASS);
    return ENCPUtilities.arrayFromNodeList(breaksList);
  };

  /**
   * Find all hidden section break elements.
   * @returns Array of break elements.
   */
  ENCPSectionBreak.prototype.findHiddenBreaks = function() {
    var breaksList = this.rootElement.querySelectorAll('.' + HIDDEN_SECTION_TAG_CLASS);
    return ENCPUtilities.arrayFromNodeList(breaksList);
  };

  /**
   * Enable or disable section break at given index.
   * @param breakIndex      The index of a break.
   * @param enabled         Should the break be enabled or disabled?
   * @returns {boolean} true if break state has been successful modified.
   */
  ENCPSectionBreak.prototype.setBreakAtIndexEnabled = function(breakIndex, enabled) {
    var breakElement = this.findAllBreaks()[breakIndex];
    if (!breakElement) {
      return false;
    }
    if (ENCPSectionBreak.isEnabledBreak(breakElement) == enabled) {
      return false;
    }
    this.setBreakEnabled(breakElement, enabled);
    return true;
  };

  /**
   * Hide or show (=disable) section break at given index.
   * @param breakIndex      The index of a break.
   * @param hidden          Should the break be hidden or disabled?
   * @returns {boolean} true if break state has been successful modified.
   */
  ENCPSectionBreak.prototype.setBreakAtIndexHidden = function(breakIndex, hidden) {
    var breakElement = this.findAllBreaks()[breakIndex];
    if (!breakElement) {
      return false;
    }
    if (ENCPSectionBreak.isHiddenBreak(breakElement) == hidden) {
      return false;
    }
    this.setBreakHidden(breakElement, hidden);
    return true;
  };

  /**
   * Enable or disable section break.
   */
  ENCPSectionBreak.prototype.setBreakEnabled = function(breakElement, enabled) {
    var $element = $(breakElement);
    if ($element.hasClass(SECTION_TAG_CLASS)) {
      if (enabled) {
        $element.removeClass(SECTION_TAG_CLASS).addClass(ENABLED_SECTION_TAG_CLASS);
      }
    } else if ($element.hasClass(ENABLED_SECTION_TAG_CLASS)) {
      if (!enabled) {
        $element.removeClass(ENABLED_SECTION_TAG_CLASS).addClass(SECTION_TAG_CLASS);
      }
    } else if ($element.hasClass(HIDDEN_SECTION_TAG_CLASS)) {
      throw "You can't enable hidden section break";
    } else {
      throw "Bad breakElement: " + breakElement;
    }
  };

  /**
   * Hide or show (=disable) section break.
   */
  ENCPSectionBreak.prototype.setBreakHidden = function(breakElement, hidden) {
    var $element = $(breakElement);
    if ($element.hasClass(SECTION_TAG_CLASS)) {
      if (hidden) {
        $element.removeClass(SECTION_TAG_CLASS).addClass(HIDDEN_SECTION_TAG_CLASS).hide();
      }
    } else if ($element.hasClass(HIDDEN_SECTION_TAG_CLASS)) {
      if (!hidden) {
        $element.removeClass(HIDDEN_SECTION_TAG_CLASS).addClass(SECTION_TAG_CLASS).show();
      }
    } else if ($element.hasClass(ENABLED_SECTION_TAG_CLASS)) {
      throw "You can't hide enabled section break";
    } else {
      throw "Bad breakElement: " + breakElement;
    }
  };

  /**
   * Insert section breaks as needed
   */
  ENCPSectionBreak.prototype.setupBreaks = function () {
    var self = this;

    function traverseDepth(element, process) {
      if (!process(element)) {
        return;
      }

      $(element).contents().each(function (childIndex, child) {
        traverseDepth(child, process);
      });
      process(element); // Leaving element
    }

    var NODE_TYPE = {
      TEXT              : 0, // Plain text
      TEXT_TAG          : 1, // Tag which just decorates the text and is simply ignored
      TEXT_SECTION_TAG  : 2, // Tag which splits up the text into sections
      SECTION_TAG       : 3, // Tag which is a section on its own
      SECTION_BREAK_TAG : 4, // Existing section break
      CURSOR_POSITION   : 5, // Element that marks the cursor position in the note editor
      LINEBREAK_TAG     : 6, // Line breaks
      UNKNOWN_NODE      : 7  // Unspecified tag, does not create a section on its own
    };

    function classifyNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.nodeValue.trim().length > 0) ? NODE_TYPE.TEXT : NODE_TYPE.UNKNOWN_NODE;
      }

      if (ENCPSectionBreak.isBreak(node)) {
        return NODE_TYPE.SECTION_BREAK_TAG;
      }

      if (ENCPSectionBreak.isNoteBreak(node)) {
        return NODE_TYPE.SECTION_BREAK_TAG;
      }

      var nodeName = node.tagName;
      if (nodeName === undefined) {
        return NODE_TYPE.UNKNOWN_NODE;
      }
      nodeName = nodeName.toLowerCase();

      if (nodeName == "embed" && node.getAttribute('type') == "evernote/x-todo") {
        return NODE_TYPE.TEXT_TAG;
      }

      if (node.id === 'en-editor-last-insertion-point') {
        return NODE_TYPE.CURSOR_POSITION
      }

      var nodeType =
      {
        "a"       : NODE_TYPE.TEXT_TAG,
        "abbr"    : NODE_TYPE.SECTION_TAG,
        "address" : NODE_TYPE.SECTION_TAG,
        "b"       : NODE_TYPE.TEXT_TAG,
        "body"    : NODE_TYPE.TEXT_SECTION_TAG,
        "br"      : NODE_TYPE.LINEBREAK_TAG,
        "div"     : NODE_TYPE.TEXT_SECTION_TAG,
        "embed"   : NODE_TYPE.SECTION_TAG,
        "font"    : NODE_TYPE.TEXT_TAG,
        "h1"      : NODE_TYPE.SECTION_TAG,
        "h2"      : NODE_TYPE.SECTION_TAG,
        "h3"      : NODE_TYPE.SECTION_TAG,
        "h4"      : NODE_TYPE.SECTION_TAG,
        "h5"      : NODE_TYPE.SECTION_TAG,
        "h6"      : NODE_TYPE.SECTION_TAG,
        "hr"      : NODE_TYPE.SECTION_TAG,
        "html"    : NODE_TYPE.TEXT_SECTION_TAG,
        "i"       : NODE_TYPE.TEXT_TAG,
        "img"     : NODE_TYPE.SECTION_TAG,
        "li"      : NODE_TYPE.SECTION_TAG,
        "s"       : NODE_TYPE.TEXT_TAG,
        "strong"  : NODE_TYPE.TEXT_TAG,
        "u"       : NODE_TYPE.TEXT_TAG,
        "ul"      : NODE_TYPE.SECTION_TAG,
        "ol"      : NODE_TYPE.SECTION_TAG,
        "p"       : NODE_TYPE.TEXT_SECTION_TAG,
        "span"    : NODE_TYPE.TEXT_TAG,
        "table"   : NODE_TYPE.SECTION_TAG
      }[nodeName];

      return (nodeType === undefined) ? NODE_TYPE.UNKNOWN_NODE : nodeType;
    }

    var currentNodeType = undefined;
    var lastSection = undefined;
    var skippingTextNodes = false;
    var oldSectionBreaks = [];
    var foundEnabledSectionBreak = false;

    traverseDepth(this.rootElement, function(node) {

      var lastNodeType = currentNodeType;

      function insertBreakForSection() {
        if (lastSection !== undefined) {
          var commonParent = ENCPUtilities.parentForElements(lastSection, node);
          var $firstChild = $(lastSection).parentsUntil(commonParent).last();
          var tag = foundEnabledSectionBreak ? $(ENABLED_SECTION_TAG) : $(SECTION_TAG);
          if ($firstChild.length) {
            $firstChild.after(tag);
          } else {
            $(lastSection).after(tag);
          }
          foundEnabledSectionBreak = false;
        }
        lastSection = node;
      }

      currentNodeType = classifyNode(node);
      switch (currentNodeType) {

        case NODE_TYPE.TEXT:
          if (skippingTextNodes) {
            lastSection = node;
          } else {
            insertBreakForSection(node);
            skippingTextNodes = true;
          }
          return false;

        case NODE_TYPE.TEXT_TAG:
          return true;

        case NODE_TYPE.TEXT_SECTION_TAG:
          skippingTextNodes = false;
          return true;

        case NODE_TYPE.SECTION_TAG:
          insertBreakForSection(node);
          skippingTextNodes = false;
          return false;

        case NODE_TYPE.SECTION_BREAK_TAG:
          oldSectionBreaks.push(node);
          if (ENCPSectionBreak.isNoteBreak(node) || ENCPSectionBreak.isEnabledBreak(node)) {
            foundEnabledSectionBreak = true;
          }
          return false;

        case NODE_TYPE.CURSOR_POSITION:
          return false;

        case NODE_TYPE.LINEBREAK_TAG:
          if (currentNodeType === lastNodeType) {
            insertBreakForSection(node);
            skippingTextNodes = false;
          }
          return false;

        case NODE_TYPE.UNKNOWN_NODE:
          skippingTextNodes = false;
          return false;
      }

      throw "Bad sequencing flow";
    });

    // Discard old section breaks
    oldSectionBreaks.forEach(function (breakElement) {
      removeFromParent(breakElement);
    });
  };

  /**
   * Insert section breaks as needed including the very first break for the note title.
   */
  ENCPSectionBreak.prototype.setupBreaksAndTitle = function () {
    var fakeBeginElement = document.createElement('img');
    this.rootElement.insertBefore(fakeBeginElement, this.rootElement.firstChild);

    this.setupBreaks();

    removeFromParent(fakeBeginElement);
  };

  /**
   * Remove disabled breaks from the document and keep them aside.
   */
  ENCPSectionBreak.prototype.prepareBreaksForSaving = function () {
    if (this.breaksDisabledForSaving) {
      throw "Already stored breaks";
    }

    this.breaksDisabledForSaving = [];
    this.findAllBreaks().forEach(function (aBreak) {
      this.breaksDisabledForSaving.unshift({
        "nextNode": aBreak.nextSibling,
        "parentElement": aBreak.parentElement,
        "breakNode": aBreak
      });
      if (ENCPSectionBreak.isEnabledBreak(aBreak)) {
        aBreak.insertAdjacentHTML('afterend', SECTION_NOTE_TAG_ENABLED);
      }
      removeFromParent(aBreak);
    }, this);
  };

  /**
   * Restore breaks removed with prepareBreaksForSaving.
   */
  ENCPSectionBreak.prototype.restoreBreaksAfterSaving = function () {
    if (!this.breaksDisabledForSaving) {
      throw "Has no stored breaks";
    }

    this.findNoteBreaks().forEach(function (noteBreak) {
      removeFromParent(noteBreak);
    });

    this.breaksDisabledForSaving.forEach(function (storedBreak) {
      if (storedBreak.nextNode) {
        storedBreak.nextNode.parentElement.insertBefore(storedBreak.breakNode, storedBreak.nextNode);
      } else {
        storedBreak.parentElement.insertBefore(storedBreak.breakNode, null);
      }
    });
    this.breaksDisabledForSaving = null;
  };

  /**
   * Disable all user enabled breaks (clear them all)
   */
  ENCPSectionBreak.prototype.disableAllEnabledSectionBreaks = function () {
    this.findEnabledBreaks().forEach(function (aBreak) {
      this.setBreakEnabled(aBreak, false);
    },this);
  };

  return ENCPSectionBreak;
});
