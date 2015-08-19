//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var ENCPSectionBreak = require('Shared/LayoutEditor/ENCPSectionBreak');
  var ENCPUtilities = require('Shared/Utilities/ENCPUtilities');

  /**
   * Handler to perform auto layout.
   * @constructor
   */
  function ENCPSectionBreakAutoFormatter() {
    this.titleElement = null;
  }

  /**
   * Test function for performAutoLayout.
   * any images (includes attachments like pdf, audio, video, etc) and tables
   * need to be surrounded with section breaks.  If corresponding elements are
   * inside a table, we should NOT enable any section break.
   * @param node - to be checked.
   * @returns {boolean} true if a node needs to be surrounded with breaks.
   */
  function canBeCandidate(node) {
     return (
       (ENCPUtilities.matchesSelector(node,'img') && !ENCPUtilities.matchesSelector(node,'table img')) || // images
       (ENCPUtilities.matchesSelector(node,'table') && !ENCPUtilities.matchesSelector(node,'table table')) || // tables
       (ENCPUtilities.matchesSelector(node,'embed') && !ENCPUtilities.matchesSelector(node,'table embed')) || // embed object
       (ENCPUtilities.matchesSelector(node,'object.en-attachment') && !ENCPUtilities.matchesSelector(node,'table object')) // embed object (old version)
     );
  }

  /**
   * Perform auto layout.
   * @param sectionBreak {ENCPSectionBreak} - to be given
   * @returns {boolean} true if one or more breaks were enabled.
   */
  ENCPSectionBreakAutoFormatter.prototype.performAutoLayout = function (sectionBreak) {
    if (!sectionBreak.findAllBreaks().length) {
      return false;
    }
    var hasBeenEnabled = false;
    var previousBreak = null;
    var hasCandidate = false;
    var rootElement = sectionBreak.rootElement;
    var treeWalker = rootElement.ownerDocument.createTreeWalker(rootElement, NodeFilter.SHOW_ELEMENT);
    for (var currentNode = treeWalker.currentNode; currentNode; currentNode = treeWalker.nextNode()) {
      if (ENCPSectionBreak.isBreak(currentNode) && !ENCPSectionBreak.isHiddenBreak(currentNode)) {
        if (hasCandidate) {
          sectionBreak.setBreakEnabled(currentNode, true);
          hasBeenEnabled = true;
          hasCandidate = false;
          continue;
        }
        previousBreak = currentNode;
        continue;
      }
      if (hasCandidate
        || (this.titleElement && currentNode === this.titleElement)
        || canBeCandidate(currentNode)) {
        hasCandidate = true;
        if (previousBreak) {
          if (!ENCPSectionBreak.isEnabledBreak(previousBreak)) {
            sectionBreak.setBreakEnabled(previousBreak, true);
            hasBeenEnabled = true;
          }
          previousBreak = null;
        }
      }
    }
    return hasBeenEnabled;
  };

  return ENCPSectionBreakAutoFormatter;
});