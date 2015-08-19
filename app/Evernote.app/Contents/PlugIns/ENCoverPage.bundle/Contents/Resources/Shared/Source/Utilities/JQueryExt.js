//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  require("Shared/External/jQuery");

  var _jQuery = $.noConflict();

  _jQuery.fn.extend({
    reverse: function () {
      return this.pushStack(this.get().reverse(), arguments);
    },

    isOnScreen: function (scrollPosition) {
      if (!this.is(":visible")) {
        return false;
      }
      var docViewBottom = scrollPosition + window.encpPlatform.viewPort().height;
      var elemTop = this.offset().top;
      var elemBottom = elemTop + this.height();
      return ((elemBottom <= docViewBottom) && (elemTop >= scrollPosition));
    },

    isBelowViewPort: function (scrollPosition) {
      if (!this.is(":visible")) {
        return false;
      }
      var docViewBottom = scrollPosition + window.encpPlatform.viewPort().height;
      var elemTop = this.offset().top;
      var elemBottom = elemTop + this.height();
      return elemBottom > docViewBottom;
    },

    isAboveViewPort: function (scrollPosition) {
      if (!this.is(":visible")) {
        return false;
      }
      var elemTop = this.offset().top;
      return elemTop < scrollPosition;
    }
  });

  return _jQuery;
});
