//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  var $ = require('Shared/Utilities/JQueryExt');
  var ENCPSectionBreak = require('Shared/LayoutEditor/ENCPSectionBreak');
  var ENCPUtilities = require('Shared/Utilities/ENCPUtilities');
  var ENCPMonospaceProcessor = require('Shared/NotePresenter/ENCPMonospaceProcessor')

  function ENCPClean() {
    this.noteBaseURL = null;
    this.sectionBreak = null;
    this.noteTitle = null;
  }

  ENCPClean.prototype = {

    MEDIA_ID: {
      TAG: 'en-media',
      MIME_TYPE_INDEX: 1,
      HASH_INDEX: 2,
      HEIGHT_INDEX: 3,
      WIDTH_INDEX: 4
    },
    callback: null,

    fixImageLayout: function (rootElement) {
      var self = this;
      $(rootElement).find('img').filter(function () {
        return !$(this).closest(".encp-media-container").length;
      }).each(function () {
        var $img = $(this);
        if ($img.css('display') == 'none') {
          return;
        }

        // id attribute of attachment (media) will be "en-media:[mime type]:[item hash]:[height]:[width]"
        // e.g. "en-media:image/png:d54c2f3647777cc2d4691e8c07aa6d3b:none:none"
        var mime = $img.attr('x-evernote-mime');
        var mediaID = $img.attr('id');
        var mediaParam = mediaID.split(':');
        var mediaWidth = 0;
        if (mediaParam.length > self.MEDIA_ID.MIME_TYPE_INDEX && mediaParam[0] === self.MEDIA_ID.TAG) {
          if (!mime) {
            mime = mediaParam[self.MEDIA_ID.MIME_TYPE_INDEX];
          }
          if (mediaParam.length > self.MEDIA_ID.WIDTH_INDEX) {
            mediaWidth = parseInt(mediaParam[self.MEDIA_ID.WIDTH_INDEX]);
          }
        }
        if ($img.attr('width')) {
          mediaWidth = parseInt($img.attr('width'));
        }

        // TODO: Here replace img[src] with a link to a thumbnail obtained from the ENCPPlatform
        // TODO: Can encp-media-preview be moved from div to img and div be removed? Here and everywhere else.
        $img.wrap('<div class="encp-media-container"/>').wrap('<div class="encp-media-preview"/>');
        $img.closest('.encp-media-container')
          .attr("data-media-url", $img.attr('src'))
          .attr("data-media-mime", mime)
          .addClass("encp-can-open-attachment");

        if ($img.closest('table, td, tr').length) {
          $img.addClass('encp-table-image');
        }

        $img.css("height", "");
        $img.css("width", "");
        $img.removeAttr("height");
        $img.removeAttr("width");
        $img.removeAttr("align");
        // Overwrite width if user specified in common-editor.
        if (mediaWidth > 0) {
          $img.attr('width',mediaWidth.toString());
        }
      });
    },

    fixElementsStyle : function (rootElement) {
      var self = this;
      if ($(rootElement).attr('style')) {
        $(rootElement).attr('style','');
      }
      $(rootElement).find("[style]").each(function() {
        var element = $(this);
        if (this.getAttribute('style').indexOf('-evernote-highlight') > -1) {
          element.addClass('encp-note-highlight');
        }
        var fontFamily = element.css("font-family");
        if (fontFamily) {
          element.css("font-family", "");
          if (ENCPMonospaceProcessor.isMonospaceFont(fontFamily)) {
            ENCPMonospaceProcessor.markMonospace(this);
          }
        }
        // CP-227 - Use style attribute instead of Jquery css function, which converts the size to
        // pixels resulting in different results on different hardware (retina/non retina)
        var fontSize = this.style.fontSize;
        if (fontSize) {
          element.css("font-size", "");
          element.addClass(self.computeFontClassForSize(fontSize));
        }
        element.css("font-size", "");
        // CP-554 -  Text compressed in copy-paste content
        if (element.is("table, td")) {
          element.css("border-color","");
        } else {
          element.css("width", "");
          // Resized images have the 'width' attribute set and we want to keep this value
          if (element.attr("width") && !element.is('img')) {
            element.attr("width", "");
          }
        }
        if (element.css("background-color")) {
          element.css("background-color", "");
        }
        if (element.is("p, div, font, bold, i, span")) {
          this.style.marginTop = "";
          this.style.marginRight = "";
          this.style.marginBottom = "";
          if (!element.is("p, div")) {
            this.style.marginLeft = "";
          }
          this.style.lineHeight = "";
          // CP-1263: Content div would be very narrow without removing max-width,
          // but can we always remove this?
          this.style.maxWidth = "";
        } else if (element.is("li")) {
          this.style.display = "";
        }
      });
    },

    fixTableStyle: function(rootElement) {
      $(rootElement).find("table[style], td[style], th[style]").each(function() {
        // Resetting all styles but width for TABLE, TD (and TH just in case)
        // Keeping width css property to respect user settings.
        // We're assuming width as % value in common editor.
        var width = this.style.width;
        this.setAttribute('style','');
        this.style.width = width;
      });
    },

    computeFontClassForSize: function(sizeString) {
      var size = 0;
      if (sizeString.search(/px|pt/gi) != -1) {
        size = parseInt(sizeString.replace(/px/gi));
      } else if (sizeString.search(/em/gi) != -1) {
        size = Math.ceil(parseFloat(sizeString.replace(/em/gi)) * 12);
      } else if (sizeString.search(/xx-small/gi) != -1) {
        size = 8;
      } else if (sizeString.search(/x-small/gi) != -1) {
        size = 10;
      } else if (sizeString.search(/small/gi) != -1) {
        size = 12;
      } else if (sizeString.search(/medium/gi) != -1) {
        size = 14;
      } else if (sizeString.search(/large/gi) != -1) {
        size = 18;
      } else if (sizeString.search(/x-large/gi) != -1) {
        size = 24;
      } else if (sizeString.search(/xx-large/gi) != -1) {
        size = 36;
      } else {
        size = parseInt(sizeString);
        switch (size) {
          case 1: size = 10; break;
          case 2: size = 13; break;
          case 3: size = 16; break;
          case 4: size = 18; break;
          case 5: size = 24; break;
          case 6: size = 32; break;
          case 7: size = 48; break;
          default: size = 13; break;
        }
      }
      if (size <= 9) {
        return "small-font";
      } else if (size <= 14) {
        return "medium-font";
      } else {
        return "large-font";
      }
    },

    fixFontElements: function(rootElement) {
      var self = this;
      $(rootElement).find("font").each(function() {
        var element = $(this);
        var size = element.attr("size");
        if (size) {
          element.removeAttr("size");
          element.addClass(self.computeFontClassForSize(size));
        }
        if (element.attr("face")) {
          if (ENCPMonospaceProcessor.isMonospaceFont(element.attr('face'))) {
            if (element.parent().children().length == 1) {
              ENCPMonospaceProcessor.markMonospace(this.parentNode);
            } else {
              ENCPMonospaceProcessor.markMonospace(this);
            }
          }
          element.removeAttr("face");
        }
      });
    },

    fixElementsColor : function (rootElement) {
      $(rootElement).css("background-color", "");
    },

    fixLinks: function(rootElement) {
      $(rootElement).find("a").each(function() {
        var $this = $(this);
        if ($this.attr("href") && $this.attr("href").match(/evernote:/i)) {
          $this.addClass("encp-note-link");
        }
        if (!$this.find("img, embed").length) {
          $this.addClass("encp-text-link");
          $this.attr("tabindex", "0");
          $this.find("[style]").removeAttr("style");
          $this.find("[color]").removeAttr("color");
          $this.find("[background-color]").removeAttr("background-color");
          $this.find("font").each(function() {
            $(this).replaceWith("<span>" + this.innerHTML + "</span>");
          });
        }
      });
    },

    fixPageBreaks: function(rootElement) {
      function isEmptyLine($element) {
        return $element.is("br") ||
            ($element.is("div") && $element.children("br").length == 1 && $element.children().length == 1);
      }
      $(rootElement).find("hr").each(function() {
        var $hr = $(this);
        $hr = $hr.parent().children().length == 1 ? $hr.parent() : $hr;
        var $element = $hr.prev();
        while (isEmptyLine($element)) {
          $element.remove();
          $element = $hr.prev();
        }
      });
    },

    trimWhitespaceAtEndOfNote: function(rootElement) {
      $(rootElement).find("*").reverse().each(function() {
        var $this = $(this);
        if (!$this.is("body, html, head")) {
          var text = this.innerText.replace(/^[\n\s]+$/g,"");
          if (text.length > 0
              || $this.is("#en-editor-last-insertion-point, .encp-media-container, .encp-media-preview, .encp-checkbox")
              || !$this.is("p, span, div, br")
              || ENCPSectionBreak.isBreak(this)) {
            return false;
          } else if ($this.parent(".encp-note-monospace").length > 0
                     || $this.parent(".encp-monospace-inline").length > 0) {
            // Need to keep white space inside of monospace block.
            return false;
          } else {
            $this.remove();
          }
        }
        return true;
      });
    },

    postprocessWebContent: function (rootElement, noteTitle) {
      window.encpPlatform.markBrokenNoteLinks(rootElement);
      this.postprocessWebNoTitleContent(rootElement);
      this.makeImageSourceAbsolute(rootElement);
      this.insertNoteTitle(rootElement, noteTitle)
    },

    postprocessWebNoTitleContent: function (rootElement) {
      window.encpPlatform.markBrokenNoteLinks(rootElement);
      window.encpPlatform.fixEmbeddedMedia(rootElement);
      this.makeImageSourceAbsolute(rootElement);
      this.convertEmbeddedCheckboxesToHTML(rootElement);
    },

    postprocessNoteContent: function (rootElement, noteTitle) {
      window.encpPlatform.markBrokenNoteLinks(rootElement);
      window.encpPlatform.fixEmbeddedMedia(rootElement);
      this.makeImageSourceAbsolute(rootElement);
      this.convertEmbeddedSecureText(rootElement);
      this.convertEmbeddedCheckboxesToHTML(rootElement);
      this.fixFontElements(rootElement);
      this.fixElementsStyle(rootElement);
      this.fixTableStyle(rootElement);
      this.fixElementsColor(rootElement);
      this.fixImageLayout(rootElement);
      this.styleOrderedLists(rootElement);
      this.insertNoteTitle(rootElement, noteTitle);
      this.fixLinks(rootElement);
      this.fixPageBreaks(rootElement);
      this.trimWhitespaceAtEndOfNote(rootElement);
      var monospaceProcessor = new ENCPMonospaceProcessor();
      monospaceProcessor.cleanSegmentedMonospaces(rootElement, this.sectionBreak);
    },

    makeImageSourceAbsolute: function(rootElement) {
      var self = this;
      if (!self.noteBaseURL) {
        return;
      }
      $(rootElement).find("img").each( function() {
        var $img = $(this);
        var srcAttr = $img.attr("src");
        if ((srcAttr && srcAttr.search("^[a-zA-Z]+://") !== 0)) {
          $img.attr("src", self.noteBaseURL + srcAttr);
        }
      });
    },

    /**
     * @param rootElement the element and its children to be changed
     * @param noteAttributes - an object or JSON string containing info about the note: title, source, sourceURL, contentClass, and author
     */
    postprocess: function (rootElement, noteAttributes) {
      if (typeof noteAttributes == "string") {
        noteAttributes = JSON.parse(noteAttributes);
      }
      var typeInfo = this.checkPresentationType(rootElement, noteAttributes);
      this.noteBaseURL = noteAttributes.noteBaseURL;
      this.noteTitle = noteAttributes.title;
      this.postprocessWithTypeInfo(rootElement, noteAttributes.title, typeInfo);
      if (this.callback && typeof this.callback == 'function') {
        this.callback();
      }
      return true;
    },

    postprocessWithTypeInfo: function(rootElement, noteTitle, typeInfo) {
      var $html = $("html");
      $html.attr("encp-source", typeInfo.source);
      $html.attr("encp-content-class", typeInfo.contentClass);
      $html.addClass(typeInfo.cssClass);
      if (typeInfo.isNoteSource) {
        if (typeInfo.isEmpty) {
          $html.addClass("encp-nocontents-in-title");
        }
        this.postprocessNoteContent(rootElement, noteTitle);
      } else {
        if (typeInfo.needsTitle) {
          this.postprocessWebContent(rootElement, noteTitle);
        } else {
          this.postprocessWebNoTitleContent(rootElement);
        }
      }
    },

    checkPresentationType: function(rootElement, noteAttributes) {
      var needsTitle = true;
      var cssClass = null;
      var $rootElement = $(rootElement);
      var hasImages = $rootElement.find("img, embed, object.en-attachment").length > 0;
      var theText = rootElement.innerText;
      var hasText = (theText && theText.trim().length > 0);
      if (noteAttributes.source == "mobile.ios" && noteAttributes.contentClass == "evernote.penultimate.notebook") {
        cssClass = "notesource";
      } else if (noteAttributes.contentClass && noteAttributes.contentClass.indexOf("evernote.skitch") == 0) {
        cssClass = "notesource";
      } else if (!noteAttributes.source &&
          (noteAttributes.sourceURL == "http://evernote.com/" || noteAttributes.sourceURL == "http://yinxiang.com/")) {
        // Welcome note
        cssClass = "websource";
        needsTitle = false;
      } else if (noteAttributes.source == "mobile.android" && noteAttributes.sourceURL && noteAttributes.sourceURL.length > 0) {
        cssClass = "websource";
      } else if (noteAttributes.source == "web.clip" && !hasText) {
        cssClass = "notesource";
      } else if (noteAttributes.source == 'Clearly' ||
          ((noteAttributes.contentClass && noteAttributes.contentClass.indexOf('evernote.food') === 0) ||
           (noteAttributes.contentClass && noteAttributes.contentClass.indexOf('evernote.hello') === 0))) {
        cssClass = "websource";
        needsTitle = false;
      } else if (noteAttributes.contentClass || noteAttributes.source == 'mail.smtp' || noteAttributes.source == 'web.clip') {
        cssClass = "websource";
        // Try being smart and do not add the title if it already exists at the beginning of a note
        var title = noteAttributes.title;
        if (title) {
          if (rootElement.textContent.substr(0, title.length) == title) {
            needsTitle = false;
          }
        }
      } else {
        cssClass = "notesource";
      }
      return {
        source: noteAttributes.source,
        contentClass: noteAttributes.contentClass,
        cssClass: cssClass,
        needsTitle: needsTitle,
        isNoteSource: cssClass == "notesource",
        isEmpty: (!hasText && !hasImages)
      };
    },

    convertEmbeddedSecureText: function(rootElement) {
      var self = this;

      $("embed[type='evernote/x-crypto']", rootElement).replaceWith(function() {
        return $('<span class="encp-crypt" />');
      });

      $(".encp-crypt", rootElement).each(function() {
        if (!!this.previousSibling && ENCPSectionBreak.isDisabledBreak(this.previousSibling)) {
          self.sectionBreak.setBreakHidden(this.previousSibling, true);
        }
        if (!!this.nextSibling && ENCPSectionBreak.isDisabledBreak(this.nextSibling)) {
          self.sectionBreak.setBreakHidden(this.nextSibling, true);
        }
      });
    },

    convertEmbeddedCheckboxesToHTML : function(rootElement) {

      var checkInsideText = function(checkboxElement) {
        var prevSibling = checkboxElement.previousSibling;
        if (prevSibling) {
          if (prevSibling.nodeType == Node.TEXT_NODE) {
            return (prevSibling.length > 0);
          } else {
            return (prevSibling.innerText.length) > 0;
          }
        }
        return false;
      };

      $(rootElement).find("embed[type='evernote/x-todo']").replaceWith(function() {
        var checkbox = $("<div class='encp-checkbox'></div>");
        if (checkInsideText(this)) {
          checkbox.addClass("encp-inside-text")
        }
        if ($(this).attr("todo-checked") == 'true') {
          checkbox.addClass("encp-checked");
        }
        return checkbox;
      });
      $(rootElement).find("object.en-todo").replaceWith(function() {
        var checkbox = $("<div class='encp-checkbox'></div>");
        if (checkInsideText(this)) {
          checkbox.addClass("encp-inside-text")
        }
        if ($(this).is(".en-todo-checked")) {
          checkbox.addClass("encp-checked");
        }
        return checkbox;
      });
      $(rootElement).find("input[type='checkbox']").replaceWith(function() {
        var checkbox = $("<div class='encp-checkbox'></div>");
        if (checkInsideText(this)) {
          checkbox.addClass("encp-inside-text")
        }
        if ($(this).attr("checked") == 'checked') {
          checkbox.addClass("encp-checked");
        }
        return checkbox;
      });
    },

    styleOrderedLists: function(rootElement) {
      $(rootElement).find("ol").each(function() {
        var ol = $(this);
        ol.attr("style",""); // reset styles
        var numberOfList = 0;
        ol.children("li").each(function(index) {
          var liElement = $(this);
          if (liElement.css("list-style-type") != 'none') {
            ++numberOfList;
            liElement.attr("value",numberOfList);
          }
          liElement.css("margin","");
          liElement.wrapInner('<span class="content"></span>');
        });
      });
    },

    insertNoteTitle: function(rootElement, title) {
      if (!title || !title.length) {
        var noTitleTemplate = $("<div class='encp-no-title'/>");
        $(rootElement).prepend(noTitleTemplate);
        return;
      }
      title = title.split("&nbsp;").join(" ");
      var titleTemplate = $(
          "<div class='encp-note-title'>" +
            "<div class='encp-title-container'>" +
            "<h1 class='title'></h1>" +
          "</div>" +
      "</div>");
      $(titleTemplate).find("h1.title").text(title);
      $(rootElement).prepend(titleTemplate);
    },

    addStyle: function(path,title,rel) {
      var style = document.createElement('link');
      style.setAttribute('rel',(rel) ? rel : 'stylesheet');
      style.setAttribute('type','text/css');
      style.setAttribute('href',path);
      style.setAttribute('title',(title) ? title : '');
      document.getElementsByTagName('head')[0].appendChild(style);
    },

    addCommonStyle: function(title) {
      this.addStyle('css/' + title + '.css','','stylesheet');
    },

    addExtraStyle: function(title) {
      this.addStyle('css/' + title + '.css',title,'alternate stylesheet');
    },

    addThemeStyle: function(title) {
      var themeTitle = title;
      while (themeTitle.indexOf('-') > -1) {
        themeTitle = themeTitle.substr(themeTitle.indexOf('-') + 1);
      }
      this.addStyle('css/' + title + '.css',themeTitle,'alternate stylesheet');
    }
  };

  return ENCPClean;
});


