//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var $ = require('Shared/Utilities/JQueryExt');
  var ENCPSectionBreak = require('Shared/LayoutEditor/ENCPSectionBreak');
  var ENCPUtilities = require('Shared/Utilities/ENCPUtilities');


  var SECTION_BREAK_HOVERING_THRESHOLD = 15; // The threshold to highlight the nearest disabled section break UI element

  // Section break UI elements
  var BREAK_UI_CONTAINER_CLASS = 'encp-section-break-ui';
  var BREAK_LINE_TAG_CLASS = 'encp-section-break-line';
  var BREAK_BUTTON_TAG_CLASS = 'encp-section-break-button';
  var DISABLED_BREAK_SECTION_TAG_CLASS = 'encp-section-disabled-break';
  var ENABLED_BREAK_SECTION_TAG_CLASS = 'encp-section-enabled-break';

  // Section break UI animation
  var SECTION_BREAK_ANIMATION_TAG_CLASS = 'encp-section-break-animation';

  // Mouse events helper
  var HOVERED_ELEMENT_TAG_CLASS = 'encp-hovered-element';
  var DRAGGABLE_ELEMENT_TAG_CLASS = 'encp-draggable-element';
  var DROPPABLE_ELEMENT_TAG_CLASS = 'encp-droppable-element';

  /**
   * Creates ENCPSectionBreakUI object
   * @constructor
   */
  function ENCPSectionBreakUI (layoutEditorController, encpSectionBreak) {
    var self = this;

    this.layoutEditorController = layoutEditorController;
    this.sectionBreak = encpSectionBreak;
    this.readonly = false;
    this.styleSheet = null;
    this.allBreakContainersStyle = null;

    ENCPUtilities.createStyleSheet(function(styleSheet) {
      self.styleSheet = styleSheet;
      self.styleSheet.insertRule("." + BREAK_UI_CONTAINER_CLASS + " {}", 0);
      self.allBreakContainersStyle = self.styleSheet.cssRules[0].style;
      self.updateScaleRatioForSectionBreaksUI();
    });

    this.setupMouseEventsHandling();
  }

  /**
   * Makes drop of the section break line into the section break.
   * @param draggingSectionBreakLine The section break line.
   * @param droppingSectionBreak     The section break UI container.
   */
  ENCPSectionBreakUI.prototype.makeSectionBreakDrop = function (draggingSectionBreakLine, droppingSectionBreak) {
    var self = this;

    /**
     * Finds closest parent element which is section break.
     * @param element The element.
     * @returns {*}
     */
    function closestBreakParent(element) {
      var breakParent = element;
      while ((breakParent = breakParent.parentElement) && !ENCPSectionBreak.isBreak(breakParent)) {}
      return breakParent;
    }

    var enabledBreakArray = [];
    var disabledBreakArray = [];

    var enabledSectionBreak = closestBreakParent(droppingSectionBreak);
    if (!ENCPSectionBreak.isEnabledBreak(enabledSectionBreak)) {
      self.setSectionBreakEnabled(enabledSectionBreak, true);
      enabledBreakArray.push(enabledSectionBreak);
    }

    var disabledSectionBreak = closestBreakParent(draggingSectionBreakLine);
    self.setSectionBreakEnabled(disabledSectionBreak, false);
    disabledBreakArray.push(disabledSectionBreak);

    self.layoutEditorController.notifyHostAboutSectionBreakModeChanges(enabledBreakArray, disabledBreakArray, true);
  };

  /**
   * Sets section break enabled or disabled and notifies platform about this change.
   * @param sectionBreak The section break to be enabled or disabled.
   * @param enabled      The boolean variable indicating new section break state (enabled or disabled).
   */
  ENCPSectionBreakUI.prototype.setSectionBreakEnabled = function (sectionBreak, enabled) {
    // Animate section break resizing
    sectionBreak.classList.add(SECTION_BREAK_ANIMATION_TAG_CLASS);

    // Enable/Disable section break and update it size
    this.sectionBreak.setBreakEnabled(sectionBreak, enabled);
    this.refreshSectionBreakUI(sectionBreak);
    window.encpPresenter.updatePageBreaks(true);
  };

  /**
   * Creates section break line element.
   * @param sectionBreak The section break.
   * @returns {HTMLElement} Returns section break line element.
   */
  ENCPSectionBreakUI.prototype.createLineForSectionBreak = function (sectionBreak) {
    // Create section break line
    var sectionBreakLine = window.document.createElement("div");
    sectionBreakLine.classList.add(BREAK_LINE_TAG_CLASS);

    if (ENCPSectionBreak.isEnabledBreak(sectionBreak)) {
      // Make enabled section break line draggable
      sectionBreakLine.classList.add(DRAGGABLE_ELEMENT_TAG_CLASS);
    }

    return sectionBreakLine;
  };

  /**
   * Creates section break button element.
   * @param sectionBreak The section break.
   * @returns {HTMLElement} Returns section break button element.
   */
  ENCPSectionBreakUI.prototype.createButtonForSectionBreak = function (sectionBreak) {
    var self = this;

    /**
     * Updates section break button action.
     * If section break is enabled then adds "remove section break" action to the specified button,
     * otherwise adds "add section break" action.
     * @param button The button to be updated.
     */
    function updateButton(button) {

      function buttonDown (event) {
        event.stopPropagation();
      }

      function buttonClick (event) {
        var enabled = ENCPSectionBreak.isEnabledBreak(sectionBreak);
        self.setSectionBreakEnabled(sectionBreak, !enabled);

        var enabledSectionBreaks = enabled ? [] : [sectionBreak];
        var disabledSectionBreaks = enabled ? [sectionBreak] : [];

        self.layoutEditorController.notifyHostAboutSectionBreakModeChanges(enabledSectionBreaks, disabledSectionBreaks, false);
      }

      if (!button) {
        throw "Wrong parameter";
      }

      button.addEventListener("mousedown", buttonDown);
      button.addEventListener("click", buttonClick);
    }

    // Create section break action button
    var sectionBreakButton = window.document.createElement("div");
    sectionBreakButton.classList.add(BREAK_BUTTON_TAG_CLASS);

    // Update action behaviour of the button
    updateButton(sectionBreakButton);

    return sectionBreakButton;
  };

  /**
   * Updates scale ratio of the section break UI elements.
   */
  ENCPSectionBreakUI.prototype.updateScaleRatioForSectionBreaksUI = function () {
    if (!this.allBreakContainersStyle) {
      return;
    }

    var $note = $('.encp-layout-editor-note-content');

    // Scale section container (to make line and button real size)
    var scaleRatio = window.encpPlatform.scaleRatio;
    this.allBreakContainersStyle.zoom = 1/scaleRatio;

    // Section break should be same size as view port's width
    var viewPortSize = window.encpPlatform.viewPort();
    var scaledWidth = (viewPortSize.width * scaleRatio);
    var leftMargin = ($note.parent().width() - $note.width()) / 2 * scaleRatio;

    // Set section break width and shift it by scaled left margin of note content.
    this.allBreakContainersStyle.width = scaledWidth + 'px';
    this.allBreakContainersStyle.marginLeft = -leftMargin + 'px';
  };

  /**
   * Creates section break UI element.
   * @param sectionBreak The section break.
   */
  ENCPSectionBreakUI.prototype.createUIForSectionBreak = function (sectionBreak) {
    // Create section break UI container
    var sectionBreakUIOuterContainer = document.createElement("div");
    sectionBreakUIOuterContainer.classList.add(BREAK_UI_CONTAINER_CLASS);
    sectionBreakUIOuterContainer.classList.add(DROPPABLE_ELEMENT_TAG_CLASS);

    var sectionBreakUIContainer = window.document.createElement("div");
    var enabled = ENCPSectionBreak.isEnabledBreak(sectionBreak);
    sectionBreakUIContainer.classList.add(enabled ? ENABLED_BREAK_SECTION_TAG_CLASS : DISABLED_BREAK_SECTION_TAG_CLASS);
    sectionBreakUIOuterContainer.appendChild(sectionBreakUIContainer);

    // Create section break line
    var sectionBreakLine = this.createLineForSectionBreak(sectionBreak);
    sectionBreakUIContainer.appendChild(sectionBreakLine);

    // Create section break action button
    var sectionBreakButton = this.createButtonForSectionBreak(sectionBreak);
    sectionBreakUIContainer.appendChild(sectionBreakButton);

    return sectionBreakUIOuterContainer;
  };

  /**
   * Refreshes section break UI.
   * @param sectionBreak The section break.
   */
  ENCPSectionBreakUI.prototype.refreshSectionBreakUI = function (sectionBreak) {
    var sectionBreakUI = ENCPUtilities.getChildOfClass(sectionBreak, BREAK_UI_CONTAINER_CLASS);
    if (sectionBreakUI) {
      sectionBreak.removeChild(sectionBreakUI);
    }

    // Create new UI
    sectionBreakUI = this.createUIForSectionBreak(sectionBreak);
    sectionBreak.appendChild(sectionBreakUI);
  };

  /**
   * Removes animation event listener from the section break element.
   * @param event The "webkitTransitionEnd" event.
   */
  function removeAnimationListenerForSectionBreak (event) {
    var sectionBreak = event.target;
    if (sectionBreak.classList.contains(SECTION_BREAK_ANIMATION_TAG_CLASS)) {
      sectionBreak.classList.remove(SECTION_BREAK_ANIMATION_TAG_CLASS);
    }
  }

  /**
   * Shows all section break markers.
   */
  ENCPSectionBreakUI.prototype.showAllMarkerLines = function () {
    var self = this;
    this.sectionBreak.findAllBreaks().forEach(function (sectionBreak) {
      self.refreshSectionBreakUI(sectionBreak);
      sectionBreak.addEventListener("webkitTransitionEnd", removeAnimationListenerForSectionBreak);
    });
  };

  /**
   * Hides all section break markers.
   */
  ENCPSectionBreakUI.prototype.hideAllMarkerLines = function () {
    $("." + BREAK_UI_CONTAINER_CLASS).remove();

    this.sectionBreak.findAllBreaks().forEach(function (sectionBreak) {
      sectionBreak.removeEventListener("webkitTransitionEnd", removeAnimationListenerForSectionBreak);
    });
  };

  /**
   * Find all section break UI container elements, both enabled and disabled.
   * @returns Array of break elements.
   */
  ENCPSectionBreakUI.prototype.updateSectionBreaksDisplay = function() {
    this.updateScaleRatioForSectionBreaksUI();
    var self = this;
    var breakUIList = document.querySelectorAll("." + BREAK_UI_CONTAINER_CLASS);
    ENCPUtilities.arrayFromNodeList(breakUIList).forEach(function (sectionBreakUI) {
      var button = ENCPUtilities.getChildOfClass(sectionBreakUI, BREAK_BUTTON_TAG_CLASS);
      var line = ENCPUtilities.getChildOfClass(sectionBreakUI, BREAK_LINE_TAG_CLASS);
      if (self.readonly) {
        sectionBreakUI.classList.remove(HOVERED_ELEMENT_TAG_CLASS);
        line.classList.remove(DRAGGABLE_ELEMENT_TAG_CLASS);
        button.style.display = "none";
      } else {
        if (sectionBreakUI.classList.contains(ENABLED_BREAK_SECTION_TAG_CLASS)) {
          line.classList.add(DRAGGABLE_ELEMENT_TAG_CLASS);
        }
        button.style.display = "";
      }
    });
  };

  /**
   * Enable (or disable) readonly mode.
   * @param {boolean} readonly - true to make readonly mode.
   */
  ENCPSectionBreakUI.prototype.setReadonly = function (readonly) {
    this.readonly = readonly;
    this.updateSectionBreaksDisplay();
  };

  /**
   * Sets up mouse events handling.
   */
  ENCPSectionBreakUI.prototype.setupMouseEventsHandling = function () {
    this.hoveredElement = null;    // currently hovered element

    // Drag and drop related variables
    this.startY = 0;               // mouse starting positions
    this.dragElement = null;       // needs to be passed from onMouseDown to onMouseMove

    this.registerMouseListeners();
  };

  /**
   * Registers mouse listeners.
   */
  ENCPSectionBreakUI.prototype.registerMouseListeners = function () {
    var self = this;

    window.document.addEventListener("mouseup", onMouseUp, false);
    window.document.addEventListener("mousemove", onMouseMove, true);

    this.sectionBreak.findAllBreaks().forEach(function(aBreak) {
      aBreak.addEventListener("mousedown", onMouseDown, false);
    });

    /**
     * Handles "window.document.onmousedown" event.
     * @param event The event object.
     * @returns {boolean}
     * @constructor
     */
    function onMouseDown(event) {
      var target = event.target;

      if (event.button == 0 && target.classList.contains(DRAGGABLE_ELEMENT_TAG_CLASS)) {
        event.stopPropagation();
        event.preventDefault();

        // grab the mouse position
        self.startY = event.clientY;

        // we need to access the element in onMouseMove
        self.dragElement = target;
        self.dragElement.style.zIndex = 10000;          // Make it hover above other elements
        self.dragElement.style.pointerEvents = "none";  // Ignore it when searching for elements under the pointer

        // prevent text selection
        return false;
      }
    }

    /**
     * Handles "window.document.onmousemove" event.
     * @param event The event object.
     * @constructor
     */
    function onMouseMove(event) {
      /**
       * Searches for the currently hovered element.
       * @param event The mouse move event.
       * @returns {*} The hovered element or null if nothing is hovered at the moment.
       */
      function getHoveringElement(event) {
        /**
         * Finds nearest hover-able element to current mouse position.
         * @param event The mouse move event.
         * @returns     {{element: *, distance: number}}
         */
        function nearestHoverableElement(event) {

          /**
           * Search for break elements that surround given element
           * @param element  Given element
           * @returns {*[]} Tuple of previous and next break elements. Elements may be null or same.
           */
          function surroundingBreakUIElementsOnScreen (element) {
            var treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);

            treeWalker.currentNode = element;
            for (var prevBreak = treeWalker.currentNode; prevBreak; prevBreak = treeWalker.previousNode()) {
              if (!prevBreak.offsetParent) { // Not on screen?
                prevBreak = null;
                break;
              }
              if (prevBreak.classList.contains(DROPPABLE_ELEMENT_TAG_CLASS)) {
                break;
              }
            }

            treeWalker.currentNode = element;
            for (var nextBreak = treeWalker.currentNode; nextBreak; nextBreak = treeWalker.nextNode()) {
              if (!nextBreak.offsetParent) { // Not on screen?
                nextBreak = null;
                break;
              }
              if (nextBreak.classList.contains(DROPPABLE_ELEMENT_TAG_CLASS)) {
                break;
              }
            }

            return [prevBreak, nextBreak];
          }

          /**
           * Calculates distance from specified Y-coordinate to the frame.
           * @param {number} y The y coordinate.
           * @param {HTMLElement} sectionBreakUIElement - target element.
           * @returns {number}
           */
          function distanceToSectionBreakUIElement(y, sectionBreakUIElement) {
            // Because the JS and JQ cannot handle transformations (such as zoom) properly,
            // to calculate position of the section break UI element we need to:

            // 1. Calculate absolute position of the parent element
            var pos = ENCPUtilities.elementPositionRelativeToParent(sectionBreakUIElement.offsetParent, null);

            // 2. Calculate offset of our section break UI element (taking into account zoom property) and add it to the pos
            var sectionBreakUIZoom = self.allBreakContainersStyle.zoom;
            if (sectionBreakUIZoom == null) {
              sectionBreakUIZoom = 1;
            }
            pos.x += (sectionBreakUIElement.offsetLeft * sectionBreakUIZoom);
            pos.y += (sectionBreakUIElement.offsetTop * sectionBreakUIZoom);

            var frameMinY = pos.y;
            var frameMaxY = frameMinY + sectionBreakUIElement.offsetHeight;

            return Math.min(Math.abs(frameMinY - y), Math.abs(frameMaxY - y));
          }

          var hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
          var breakElements = (hoveredElement) ? surroundingBreakUIElementsOnScreen(hoveredElement) : [];

          var mousePositionY = event.pageY / window.encpPlatform.scaleRatio;
          var nearestElement = null;
          var nearestDistance = -1;

          breakElements.forEach(function (child) {
            if (!child|| child.contains(self.dragElement)) {
              return;
            }
            var distance = distanceToSectionBreakUIElement(mousePositionY, child);
            if (nearestDistance < 0 || nearestDistance > distance) {
              nearestDistance = distance;
              nearestElement = child;
            }
          });

          return {element: nearestElement, distance: nearestDistance};
        }

        var result = nearestHoverableElement(event);
        var nearestElement = result.element;
        var nearestDistance = result.distance;

        if (nearestDistance >= 0 && nearestDistance < (SECTION_BREAK_HOVERING_THRESHOLD / window.encpPlatform.scaleRatio)) {
          return nearestElement;
        }

        return null;
      }

      var hoveringElement = getHoveringElement(event);
      var hasHighlight = self.hoveredElement && self.hoveredElement.classList.contains(HOVERED_ELEMENT_TAG_CLASS);
      // IS: {CP-2452} Layout Editor: Highlight page break when user hovers over button
      var doHighlight = hoveringElement && (event.target.classList.contains(BREAK_BUTTON_TAG_CLASS) || self.dragElement);
      if (self.hoveredElement !== hoveringElement || hasHighlight != doHighlight) {
        if (self.hoveredElement) {
          self.hoveredElement.classList.remove(HOVERED_ELEMENT_TAG_CLASS);
        }
        self.hoveredElement = hoveringElement;
        if (doHighlight) {
          self.hoveredElement.classList.add(HOVERED_ELEMENT_TAG_CLASS);
        }
      }

      // this is the actual "drag code"
      if (self.dragElement) {
        event.stopPropagation();
        event.preventDefault();
        // Section break dragging always constrained to the horizontal (x) axis
        self.dragElement.style.top = (event.clientY - self.startY) + 'px';
      }
    }

    /**
     * Handles "window.document.onmouseup" event.
     * @param event The event object.
     * @constructor
     */
    function onMouseUp(event) {
      if (self.dragElement != null) {
        event.stopPropagation();
        event.preventDefault();

        if (self.hoveredElement && !self.hoveredElement.contains(self.dragElement)) {
          // Dispatch drop event
          self.makeSectionBreakDrop(self.dragElement, self.hoveredElement);
        } else {
          // revert position of the dragged element if drop cannot be done
          self.dragElement.style.top = '0';
        }

        // Clear overridden attributes
        self.dragElement.style.zIndex = "";
        self.dragElement.style.pointerEvents = "";

        self.dragElement = null;
      }
    }
  };

  return ENCPSectionBreakUI;
});
