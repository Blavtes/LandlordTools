//  Copyright (c) 2015 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var THEME_GROUP_INDEX_NAME = 0;
  var THEME_GROUP_INDEX_CONTENT = 1;
  var THEME_GROUP_SIZE = 2;

  var gNextStyleID = 0;

  var ENCPThemeStyle = (function() {
    /**
     * This internal object represents a set of CSS styles that are installed in the document.
     * @param CSSGroup Set of CSS styles. Key is theme name. 'base' theme is always loaded.
     * @constructor
     */
    function ENCPThemeStyle(CSSGroup) {
      this._CSSGroup = CSSGroup;
      this._installed = {};
    }

    /**
     * Install CSS specified theme name into the document, if it is not installed yet.
     * @param themeName Theme name
     */
    function installCSSIfNeeded(themeName) {
      if (this._installed[themeName]) {
        return;
      }
      var CSSContentDescription = this._CSSGroup[themeName];
      if (!CSSContentDescription) {
        return;
      }
      if (CSSContentDescription.length != THEME_GROUP_SIZE) {
        throw 'Bad theme content description: ' + CSSContentDescription;
      }
      var styleID = "encp-theme-style-id-" + gNextStyleID;
      gNextStyleID++;
      var styleElement = document.createElement('style');
      styleElement.id = styleID;
      styleElement.setAttribute('data-encp-title',
          CSSContentDescription[THEME_GROUP_INDEX_NAME] + ' (' + themeName + ')');
      styleElement.appendChild(document.createTextNode(CSSContentDescription[THEME_GROUP_INDEX_CONTENT]));
      document.head.appendChild(styleElement);
      this._installed[themeName] = styleID;
    }

    /**
     * Remove CSS for specified theme name from the document, if it is installed.
     * @param themeName Theme Name
     */
    function removeCSSIfNeeded(themeName) {
      var styleID = this._installed[themeName];
      if (!styleID) {
        return;
      }
      var styleElement = document.getElementById(styleID);
      if (!styleElement) {
        throw "Style element disappeared for: " + themeName;
      }
      styleElement.parentNode.removeChild(styleElement);
      delete this._installed[themeName];
    }

    /**
     * Install or remove contained CSS needed for specified theme. 'base' CSS is installed first, currentTheme next.
     * @param currentThemeName Theme name to be used. May be null.
     */
    ENCPThemeStyle.prototype.updateCSS = function (currentThemeName) {
      // First the base style
      installCSSIfNeeded.call(this, 'base');

      // Then any overriding styles for the theme
      Object.keys(this._CSSGroup).forEach(function (themeName) {
        if (themeName == 'base') {
          return;
        }
        if (themeName == currentThemeName) {
          installCSSIfNeeded.call(this, themeName);
        } else {
          removeCSSIfNeeded.call(this, themeName);
        }
      }, this);
    };

    /**
     * Remove all CSS for this style from the document.
     */
    ENCPThemeStyle.prototype.removeAllCSS = function () {
      Object.keys(this._installed).forEach(function (themeName) {
        removeCSSIfNeeded.call(this, themeName);
      }, this);
    };

    return ENCPThemeStyle;
  })();

  /**
   * Theme manager object. Collects all CSS styles and installs CSSs which are needed for current theme
   * and removes unneeded ones.
   * @constructor
   */
  function ENCPThemeStyles() {
    this._currentTheme = null;
    this._styles = [];
  }

  /**
   * Apply theme with name. Uninstalls CSS for previous theme. Installs CSS for this one.
   * @param themeName Theme name. May be null.
   */
  ENCPThemeStyles.prototype.applyTheme = function (themeName) {
    this._currentTheme = themeName;
    this._styles.forEach(function (style) {
      style.updateCSS(this._currentTheme);
    }, this)
  };

  function indexOfCSSGroup(CSSGroup) {
    var indexOfCSSGroup = -1;
    this._styles.some(function (style, styleIndex) {
      if (style._CSSGroup === CSSGroup) {
        indexOfCSSGroup = styleIndex;
        return true;
      }
      return false;
    });
    return indexOfCSSGroup;
  }

  /**
   * Register a group of CSS stylesheets for a single element of the UI. Installs styles as needed.
   * @param CSSGroup Set of CSS styles.
   *  { <theme name> : [<CSS name>, <CSS content>], ... }. Theme named 'base' is always loaded.
   */
  ENCPThemeStyles.prototype.registerCSSGroup = function (CSSGroup) {
    Object.freeze(CSSGroup);
    if (indexOfCSSGroup.call(this, CSSGroup) != -1) {
      return;
    }
    var style = new ENCPThemeStyle(CSSGroup);
    this._styles.push(style);
    style.updateCSS(this._currentTheme);
  };

  /**
   * Removes group registered with registerCSSGroup. Removes it from the document, too.
   * @param CSSGroup
   */
  ENCPThemeStyles.prototype.removeCSSGroup = function (CSSGroup) {
    var styleIndex = indexOfCSSGroup.call(this, CSSGroup);
    if (styleIndex == -1) {
      throw "Cannot remove CSSGroup";
    }
    this._styles[styleIndex].removeAllCSS();
    this._styles.splice(styleIndex, 1);
  };

  /**
   * Removes all groups from that theme manager and document.
   */
  ENCPThemeStyles.prototype.removeAllCSSGroups = function () {
    this._styles.forEach(function (style) {
      style.removeAllCSS();
    });
    this._styles = [];
  };

   return ENCPThemeStyles;
});
