//  Copyright (c) 2014 Evernote. All rights reserved.

// TODO: We need to replace that with promise.js
define(function (require) {
  "use strict";

  /**
   * ENCPDeferred provides simple async sequential callbacks with method chaining.
   * @param finalCallback - to be called after all registered callbacks run.
   * @returns {*} an instance of ENCPDeferred object.
   * @constructor
   */
  var ENCPDeferred = function(finalCallback) {
    this.queue = [];
    this.timer = null;
    this.finalCallback = (typeof finalCallback == 'function') ? finalCallback : null;
    return this;
  };

  /**
   * Execute the given callback immediately.
   * @param callback - to be run immediately.
   * @returns {ENCPDeferred}
   */
  ENCPDeferred.doNow = function(callback) {
    if (!ENCPDeferred.list) {
      ENCPDeferred.list = [];
    }
    if (callback) {
      if (typeof callback != 'function') {
        throw 'error: a callback must be a function.';
      }
      callback();
    }
    var deferred = new ENCPDeferred(function() {
      ENCPDeferred.list.shift();
    });
    ENCPDeferred.list.push(deferred);
    return deferred;
  };

  /**
   * Cancel all progress queues.
   */
  ENCPDeferred.tearDown = function() {
    if (ENCPDeferred.list) {
      for (var i = 0,n = ENCPDeferred.list.length; i < n; ++i) {
        ENCPDeferred.list[i].cancel();
      }
      ENCPDeferred.list = [];
    }
  };

  ENCPDeferred.prototype = {
    /**
     * Register callback into deferred queue.
     * @param callback
     * @returns {*} instance of the object to allow method chaining.
     */
    then: function(callback) {
      if (typeof callback != 'function') {
        throw 'error: a callback must be a function.';
      }
      this.queue.push({call:callback,wait:false});
      return this;
    },
    /**
     * Register a conditional callback for deferred queue.
     * @param callback - returns true if it's ok to execute the next callback.
     * @returns {*} instance of the object to allow method chaining.
     */
    waitUntil: function(callback) {
      if (typeof callback != 'function') {
        throw 'error: a callback must be a function.';
      }
      this.queue.push({call:callback,wait:true});
      return this;
    },
    /**
     * Cancel all callbacks which have not run yet.
     */
    cancel: function() {
      if (this.timer) {
        window.clearTimeout(this.timer);
      }
      this.queue = [];
    },
    /**
     * Start firing all registered callbacks sequentially.
     */
    done: function() {
      var self = this;
      self.timer = window.setTimeout(function() {
        var prop = self.queue.shift();
        var result = prop.call();
        if (prop.wait && !result) {
          self.queue.unshift(prop);
        }
        if (self.queue.length > 0) {
          self.done();
        } else if (self.finalCallback) {
          self.finalCallback();
        }
      }, 10);
    }
  };

  return ENCPDeferred;
});
