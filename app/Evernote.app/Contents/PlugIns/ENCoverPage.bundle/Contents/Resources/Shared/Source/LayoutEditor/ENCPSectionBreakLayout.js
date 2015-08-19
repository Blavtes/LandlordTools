//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var ENCPSectionBreak = require('Shared/LayoutEditor/ENCPSectionBreak');

  var FAKE_VERTICAL_PADDING = 1;

  /**
   * Performs layout of pages in the document
   * @param sectionBreak Section breaks managing the document. Used only to query for breaks.
   * @constructor
   */
  function ENCPSectionBreakLayout (sectionBreak) {
    this.sectionBreak = sectionBreak;
    var rootElement = this.sectionBreak.rootElement;
    this.beginElement = document.createElement('div');
    rootElement.insertBefore(this.beginElement, rootElement.firstChild);
    this.endElement = document.createElement('div');
    rootElement.appendChild(this.endElement);
    this.viewPortSize = null;
    this.resetPageBreaks();
  }

  /**
   * Get all breaks used by this class, including extra breaks used just for page layout
   * @returns {Array} Array of DOM elements
   */
  ENCPSectionBreakLayout.prototype.allLayoutBreaks = function () {
    var allBreaks = this.sectionBreak.findAllBreaks();
    return [this.beginElement].concat(allBreaks).concat([this.endElement]);
  };

  /**
   * Get just the enabled breaks used by this class, including extra breaks used just for page layout
   * @returns {Array} Array of DOM elements
   */
  ENCPSectionBreakLayout.prototype.enabledLayoutBreaks = function () {
    var allBreaks = this.sectionBreak.findEnabledBreaks();
    return [this.beginElement].concat(allBreaks).concat([this.endElement]);
  };

  /**
   * Set view port size. Needs to be done before layout computation can occur.
   * @param width  View port width
   * @param height View port height
   */
  ENCPSectionBreakLayout.prototype.setViewPortSize = function (width, height) {
    this.viewPortSize = {width: width, height: height};
  };

  ENCPSectionBreakLayout.prototype.contentOffsetAboveBreak = function (aBreak) {
    // Compensate FAKE_VERTICAL_PADDING
    var marginTop = (!aBreak.style.marginTop ? 0 : parseInt(aBreak.style.marginTop));
    return aBreak.offsetTop - marginTop;
  };

  ENCPSectionBreakLayout.prototype.contentOffsetBelowBreak = function (aBreak) {
    // Compensate FAKE_VERTICAL_PADDING
    var marginBotton = (!aBreak.style.marginBottom ? 0 : parseInt(aBreak.style.marginBottom));
    return aBreak.offsetTop + aBreak.offsetHeight + marginBotton;
  };

  /**
   * Compute break padding for the whole page.
   * @param getPaddingFn Function which returns required minimal padding between two breaks.
   * @returns {Array} An array of computed padding {top:, bottom:} for each of the break elements.
   */
  ENCPSectionBreakLayout.prototype.computeBreakPadding = function (getPaddingFn) {
    if (this.viewPortSize === null) {
      throw "Need to set view port size"
    }
    var viewPortHeight = this.viewPortSize.height;
    var allBreaks = this.allLayoutBreaks();
    var breakPadding = [];

    var previousBreak = allBreaks.shift();
    var topPagePadding = {top: 0, bottom: 0};
    var topPageBreak = previousBreak;
    var currentPageHeight = 0;
    var pageIndex = 0;
    breakPadding.push(topPagePadding);
    allBreaks.forEach(function (nextBreak) {
      var topPageBoundary = this.contentOffsetBelowBreak(previousBreak);
      var bottomPageBoundary = this.contentOffsetAboveBreak(nextBreak);
      currentPageHeight += bottomPageBoundary - topPageBoundary;
      var bottomPagePadding = {top: 0, bottom: 0};

      if (ENCPSectionBreak.isEnabledBreak(nextBreak) || nextBreak === this.endElement) {
        var pagePadding = {top:0, bottom:0, pageHeightOverride:0};
        if (getPaddingFn) {
          pagePadding = getPaddingFn(
            (topPageBreak === this.beginElement) ? undefined : topPageBreak,
            (nextBreak === this.endElement) ? undefined : nextBreak,
            pageIndex);
          if (pagePadding.pageHeightOverride) {
            currentPageHeight = pagePadding.pageHeightOverride;
          }
        }

        // Take min padding into account, but try to center the page anyway
        var hasNoBreaks = (topPageBreak === this.beginElement && nextBreak === this.endElement);
        var computedPadding = (hasNoBreaks) ? 0 : (viewPortHeight - currentPageHeight) / 2;
        var topPadding = Math.floor(computedPadding);
        var bottomPadding = Math.ceil(computedPadding);
        var paddingAdjustment = Math.max(Math.min(0, bottomPadding - pagePadding.bottom), pagePadding.top - topPadding);
        topPagePadding.bottom = topPadding + paddingAdjustment;
        bottomPagePadding.top = Math.max(bottomPadding - paddingAdjustment, pagePadding.bottom);
        currentPageHeight = 0;
        topPagePadding = bottomPagePadding;
        topPageBreak = nextBreak;
        ++pageIndex;
      }

      breakPadding.push(bottomPagePadding);
      previousBreak = nextBreak;
    }, this);

    return breakPadding;
  };

  ENCPSectionBreakLayout.prototype.documentHeight = function () {
    return this.pageOffsetForBreak(this.endElement);
  };

  /**
   * Apply specified break padding to the DOM elements.
   * @param breakPadding Padding specification as computed by computeBreakPadding.
   */
  ENCPSectionBreakLayout.prototype.setupComputedPadding = function (breakPadding) {
    var allBreaks = this.allLayoutBreaks();
    if (allBreaks.length != breakPadding.length) {
      throw "Cannot apply computed breaks - number of breaks and number of measurements differ";
    }

    allBreaks.forEach(function (aBreak, breakIndex) {
      var computedBreak = breakPadding[breakIndex];
      if (!computedBreak.top && !computedBreak.bottom) {
        // Such breaks must have height 0px and separate sequential elements with margins properly.
        // Workaround: Add some padding compensated with negative margin.
        // https://evernote.jira.com/browse/CP-2683
        if (breakIndex == allBreaks.length - 1) {
          aBreak.style.paddingTop = FAKE_VERTICAL_PADDING + "px";
          aBreak.style.marginTop = "-" + FAKE_VERTICAL_PADDING + "px";
          aBreak.style.paddingBottom = "";
          aBreak.style.marginBottom = "";
          return;
        }
        aBreak.style.paddingTop = "";
        aBreak.style.marginTop = "";
        aBreak.style.paddingBottom = FAKE_VERTICAL_PADDING + "px";
        aBreak.style.marginBottom = "-" + FAKE_VERTICAL_PADDING + "px";
        return;
      }

      aBreak.style.marginTop = "";
      aBreak.style.marginBottom = "";
      aBreak.style.paddingTop = computedBreak.top ? (computedBreak.top + "px") : "";
      aBreak.style.paddingBottom = computedBreak.bottom ? (computedBreak.bottom + "px") : "";
    }, this);
  };

  /**
   * Compute page break location for give break elements.
   * @param aBreak DOM element being a break.
   * @returns {number} Offset from the top of the page.
   */
  ENCPSectionBreakLayout.prototype.pageOffsetForBreak = function(aBreak) {
    return aBreak.offsetTop + (!aBreak.style.paddingTop ? 0 : parseInt(aBreak.style.paddingTop));
  };

  /**
   * Get the break element index for the page break that is at or above specified offset.
   * @param layoutBreaks     An array of DOM break elements.
   * @param viewPortOffsetY  Specified offset.
   * @returns {number} Index of the break element in layoutBreaks array.
   */
  ENCPSectionBreakLayout.prototype.getUpperBreakForOffset = function (layoutBreaks, viewPortOffsetY) {
    if (!layoutBreaks.length) {
      return 0;
    }

    var first = 0;
    var last = layoutBreaks.length - 1;
    while (last > first) {
      var current = Math.ceil((last + first) / 2);
      if (this.pageOffsetForBreak(layoutBreaks[current]) > viewPortOffsetY) {
        last = current - 1;
      } else {
        first = current;
      }
    }
    return first;
  };

  /**
   * Get the break element index for the page break that is below specified offset.
   * @param layoutBreaks     An array of DOM break elements.
   * @param viewPortOffsetY  Specified offset.
   * @returns {number} Index of the break element in layoutBreaks array.
   */
  ENCPSectionBreakLayout.prototype.getLowerBreakForOffset = function (layoutBreaks, viewPortOffsetY) {
    var breakAboveIndex = this.getUpperBreakForOffset(layoutBreaks, viewPortOffsetY);
    return (breakAboveIndex + 1 < layoutBreaks.length) ? breakAboveIndex + 1 : breakAboveIndex;
  };

  /**
   * Are any of user breaks enabled?
   * @returns {boolean} true if enabled.
   */
  ENCPSectionBreakLayout.prototype.hasEnabledUserBreaks = function() {
    return this.sectionBreak.findEnabledBreaks().length > 0;
  };

  /**
   * Get page limits
   * @param pageIndex Page number
   * @returns {Object} Object with properties: top, bottom.
   */
  ENCPSectionBreakLayout.prototype.pageLimits = function (pageIndex) {
    var enabledBreaks = this.enabledLayoutBreaks();
    if (pageIndex >= enabledBreaks.length - 1) {
      return null;
    }

    return {
      top: this.pageOffsetForBreak(enabledBreaks[pageIndex]),
      bottom: this.pageOffsetForBreak(enabledBreaks[pageIndex + 1])
    }
  };

  /**
   * Find page number at given offset
   * @param viewPortOffsetY
   * @returns {number} Number of page. Always returns a valid page number of the nearest page or 0.
   */
  ENCPSectionBreakLayout.prototype.pageNumberForOffset = function (viewPortOffsetY) {
    if (viewPortOffsetY < 0 || !this.hasEnabledUserBreaks()) {
      return 0;
    }

    var enabledBreaks = this.enabledLayoutBreaks();
    return Math.min(this.getUpperBreakForOffset(enabledBreaks, viewPortOffsetY), enabledBreaks.length - 2);
  };

  /**
   * Constrain given offset to legal values.
   * @param viewPortOffsetY Offset to be constrained.
   * @returns {number} Constrained offset.
   */
  ENCPSectionBreakLayout.prototype.constrainOffset = function (viewPortOffsetY) {
    viewPortOffsetY = Math.min(this.pageOffsetForBreak(this.endElement) - this.viewPortSize.height, viewPortOffsetY);
    viewPortOffsetY = Math.max(this.pageOffsetForBreak(this.beginElement), viewPortOffsetY);
    return viewPortOffsetY;

  };

  /**
   * Offset for paging down from specified offset.
   * @param viewPortOffsetY Current view port offset.
   * @returns {number} New view port offset.
   */
  ENCPSectionBreakLayout.prototype.pageDownOffset = function (viewPortOffsetY) {
    if (this.viewPortSize === null) {
      throw "Need to set view port size"
    }
    var layoutBreaks = this.enabledLayoutBreaks();
    var breakIndex = this.getLowerBreakForOffset(layoutBreaks, viewPortOffsetY);
    viewPortOffsetY += this.viewPortSize.height;
    var pageBreakOffset = this.pageOffsetForBreak(layoutBreaks[breakIndex]);
    if (viewPortOffsetY >= pageBreakOffset) {
      viewPortOffsetY = pageBreakOffset;
    } else if (viewPortOffsetY > pageBreakOffset - this.viewPortSize.height) {
      viewPortOffsetY = pageBreakOffset - this.viewPortSize.height;
    }
    return this.constrainOffset(viewPortOffsetY);
  };

  /**
   * Offset for paging up from specified offset.
   * @param viewPortOffsetY Current view port offset.
   * @returns {number} New view port offset.
   */
  ENCPSectionBreakLayout.prototype.pageUpOffset = function (viewPortOffsetY) {
    if (this.viewPortSize === null) {
      throw "Need to set view port size"
    }
    var layoutBreaks = this.enabledLayoutBreaks();
    var breakIndex = this.getUpperBreakForOffset(layoutBreaks, viewPortOffsetY + this.viewPortSize.height - 1);
    var pageBreakOffset = this.pageOffsetForBreak(layoutBreaks[breakIndex]);
    var distTopBreak = viewPortOffsetY - pageBreakOffset;
    var distBottomBreak = viewPortOffsetY + this.viewPortSize.height - pageBreakOffset;
    if (0 < distTopBreak && distTopBreak < this.viewPortSize.height) {
      viewPortOffsetY = pageBreakOffset;
    } else if (0 <= distBottomBreak && distBottomBreak < this.viewPortSize.height) {
      viewPortOffsetY = pageBreakOffset - this.viewPortSize.height;
    } else {
      viewPortOffsetY -= this.viewPortSize.height;
    }
    return this.constrainOffset(viewPortOffsetY);
  };

  /**
   * Compute & apply page breaks without animation
   * @param getPaddingFn Function which returns required minimal padding between two breaks.
   */
  ENCPSectionBreakLayout.prototype.setupPageBreaks = function (getPaddingFn) {
    this.setupComputedPadding(this.computeBreakPadding(getPaddingFn));
  };

  /**
   * Reset all layout breaks
   */
  ENCPSectionBreakLayout.prototype.resetPageBreaks = function () {
    var breakPadding = [];
    var emptyPadding = { top: 0, bottom: 0 };
    this.allLayoutBreaks().forEach(function() {
      breakPadding.push(emptyPadding);
    });

    this.setupComputedPadding(breakPadding);
  };

  return ENCPSectionBreakLayout;
});