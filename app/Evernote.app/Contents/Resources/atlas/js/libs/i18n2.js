/**
 * (c) 2011 Evernote Corp
 * 
 * i18N support for Javascript via JSON.
 * 
 * <h3>Configuration Options:</h3>
 *  Before loading the JS file cause the following Objects to be in existence before 
 *  you load this library.
 *  e.g. 
 *  <pre>
 *  <script>
 *    var Evernote;
 *    if (!Evernote) {
 *      Evernote = {};
 *    }
 *    Evernote.i18n = { 
 *      "baseUrl": "override source location of i18n files - default /js/i18n/i18n",
 *      "fataError": function(msg) { ...some other fatal error handler - default log to console if it exists... }
 *    }
 *  </script>
 *  <script src="/js/evernoteClient/i18n2.js"></script>
 *  </pre>
 *  
 *  <h3>Library Usage:</h3>
 *  
 *  Syntax: Evernote.i18n.L("key", [ Array | Object ]);
 *  
 *  You must use string Object notation when using the object style because JavaScript does not support
 *  numbers to be used as object element names.
 *  
 *  e.g.
 *  Array style substitution done in order using tokens from 0 - 9. 
 *  
 *    Evernote.i18n.L("my.key.1", [ "sub1", "sub2" ]);
 *    
 *  Object style substitution done using tokens.
 *  
 *    Evernote.i18n.L("my.key.1", { "0": "value1", "1": "value2" });
 *  
 *  If no parameters are required you can simply use
 *
 *    Evernote.i18n.L("my.key.1");
 */
var EV = window.EV || {};
if (!EV.i18n) {
  EV.i18n = {};
}

/**
 * attach our load function to window on load using an anon function
 */
  (function () {
    var self = EV.i18n;
    self.ready = false;
    self.fns = [];
    if (!self.baseUrl) {
      self.baseUrl = "/js/i18n/i18n";
    }
    if (!self.fatalError) {
      self.fatalError = function(msg) {
        if (console && console.error) {
          console.error(msg);
        }
      };
    }
    
    self.setMessages = function (msgs) {
        self.messages = msgs;
        self.ready = true;
        self.runReady();
    };

    self.loadLocaleFn = function (metaLocale) {
      var client = new XMLHttpRequest();
      var locale = (metaLocale === "en") ? "" : "_" + metaLocale;
      var url = self.baseUrl + locale + ".json";
      client.open("GET", url, true);
      client.onreadystatechange = function () {
        if (client.readyState === 4) {
          if (client.status === 200) {
            try {
              self.messages = JSON.parse(client.responseText) || {};
            } catch (e) {
              self.fatalError("Error parsing Evernote locale \"" + metaLocale + "\".\n" + e.toString());
            }
            self.ready = true;
            self.runReady();
          } else {
            self.fatalError("Error loading Evernote locale \"" + metaLocale + "\".\nError: " + url + " " + client.statusText);
            if (metaLocale !== "en") {
              // Try and load english as a fallback
              return self.loadLocaleFn("en");
            }
          }
        }
      };
      client.send();
    };
//    if (window.attachEvent) {
      /* IE */
//      window.attachEvent("onload", function () { loadLocaleFn(metaLocale); });
//    } else {
//      window.addEventListener("load", function () { loadLocaleFn(metaLocale); }, false);
//    }
      EV.i18n = self;
  })();
  EV.i18n.isFunction = function (fn) {
    return typeof fn !== "undefined" && typeof fn === "function";
  };
  /**
   * invoke functions once library has loaded
   */
  EV.i18n.onReady = function (fn) {
    var self = EV.i18n;
    if (self.ready === true) {
        // execute immediately
        fn.call(document);
        return;
    }
    if (self.isFunction(fn)) {
      self.fns.push(fn);
    }
  };

  EV.i18n.runReady = function() {
    var self = EV.i18n;
    var fns = self.fns;
    if (fns == null) {
      return;
    }
    self.fns = null;
    var fn;
    while(fn = fns.shift()) {
      fn.call(document);
    }
  };
  /**
   * Array version of l10n method.
   * @param msg with tokens
   * @param args to substitute
   * @returns string
   */
  EV.i18n.LArray = function (msg, args) {
    for (var i = 0, iMax = args.length; i < iMax; ++i) {
      msg = msg.replace(/\{\{ ([0-9]+) \}\}/g, function (whole, index) {
        return (args[index] ? args[index] : ""); 
      });
    }
    return msg;
  };
  /**
   * Object version of l10n method.
   * @param msg with tokens
   * @param args to substitute
   * @returns string
   */
  EV.i18n.LObject = function (msg, args) {
    for (var k in args) {
      if (args.hasOwnProperty(k)) {
        msg = msg.replace(new RegExp("\{\{ " + k + " \}\}","g"), args[k]);
      }
    }
    return msg;
  };
  /**
   * Based on a i18n key, create a localized message with substituted parameters.
   * 
   * @param key to use
   * @param args to substitute
   * @returns string or key if null
   */
  EV.i18n.L = function (key, args) {
    var self = EV.i18n;
    if (self.messages === {}) {
     return key;
    }
    var msg = "";
    try {
      msg = self.messages[key];
    } catch(err) {
      self.fatalError(err + " on while looking up key " + key);
    }
    if (!msg) {
      return key;
    }
    if (Object.prototype.toString.call(args) === "[object Array]") {
      return self.LArray(msg, args);
    }
    return self.LObject(msg,args);
  };
