//  Copyright (c) 2014 Evernote. All rights reserved.

define(function (require) {
  "use strict";

  // Same as in Mac/ENHIPluginHost.h
  var LOGGER_LEVEL_DEBUG = 1;
  var LOGGER_LEVEL_INFO = 2;
  var LOGGER_LEVEL_WARN = 3;
  var LOGGER_LEVEL_ERROR = 4;

  var LOGGER_LEVEL_NAME = {};
  LOGGER_LEVEL_NAME[LOGGER_LEVEL_DEBUG] = 'DEBUG';
  LOGGER_LEVEL_NAME[LOGGER_LEVEL_INFO] = 'INFO';
  LOGGER_LEVEL_NAME[LOGGER_LEVEL_WARN] = 'WARN';
  LOGGER_LEVEL_NAME[LOGGER_LEVEL_ERROR] = 'ERROR';

  function ENCPLogger () {
    /**
     * The output function takes an object as a parameter. The object contains:
     *   caller: The caller of the function
     *   file: File and location of caller
     */
    this.outputFunction = null;
  }

  function logLevel(level, logArguments) {
    var argArray = Array.prototype.slice.call(logArguments, 0);
    var message = argArray.join(", ");
    var caller = undefined;
    var file = undefined;
    try {
      //noinspection ExceptionCaughtLocallyJS
      throw new Error();
    } catch (error) {
      // Error stack: Safari/Webkit | Chrome/V8
      // [0] => logLevel (this one) | "Error"
      // [1] => log... API function | logLevel (this one)
      // [2] => actual caller       | log... API function
      // [3]                        | actual caller
      if (error.stack) {
        var stack = error.stack.split("\n");
        if  (stack[0] == "Error") {
          var chromeLocation = stack[3].match('^\\s+at\\s+(.+)\\s+\\((.*)\\)$');
          caller = (chromeLocation) ? chromeLocation[1] : undefined;
          file = (chromeLocation) ? chromeLocation[2].split('/').slice(-1)[0] : undefined;
        } else {
          var safariLocation = stack[2].match('^((.+)@)?(.*)$');
          caller = (safariLocation) ? safariLocation[2] : undefined;
          file = (safariLocation) ? safariLocation[3].split('/').slice(-1)[0] : undefined;
        }
      }
    }
    caller = caller || "(unnamed)";
    console.log( '[' + LOGGER_LEVEL_NAME[level] + ': ' + caller + ', ' + file + '] ' + message);
    if (this.outputFunction) {
      var outArguments = {
        caller : caller,
        message : message,
        file : file,
        level : level
      };
      this.outputFunction(outArguments);
    }
  }

  ENCPLogger.prototype.logDebug = function () {
    logLevel.call(this, LOGGER_LEVEL_DEBUG, arguments);
  };

  ENCPLogger.prototype.logInfo = function () {
    logLevel.call(this, LOGGER_LEVEL_INFO, arguments);
  };

  ENCPLogger.prototype.logWarn = function () {
    logLevel.call(this, LOGGER_LEVEL_WARN, arguments);
  };

  ENCPLogger.prototype.logError = function () {
    logLevel.call(this, LOGGER_LEVEL_ERROR, arguments);
  };

  // Returning object here!
  return new ENCPLogger();
});
