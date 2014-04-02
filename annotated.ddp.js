//    ddp.js v0.1.0
//    <br />
//    https://pscanf.github.io/ddp.js
//    <br />
//    (c) 2014 Paolo Scanferla
//    <br />
//    ddp.js may be freely distributed under the MIT license.

// <hr />

// Wrap the code in a function to prevent spamming the global object
(function () {


    // Use ECMAScript 5 strict mode
    "use strict";

    // Function to generate a unique id
    var uniqueId = (function () {
        var i = 0;
        return function () {
            return (i++).toString();
        };
    })();
    // Initial message the DDP server may send upon connection
    var INIT_DDP_MESSAGE = "{\"server_id\":\"0\"}";
    // Maximum number of reconnect attempts
    var MAX_RECONNECT_ATTEMPTS = 10;
    // Delay increment between each reconnect attempt
    var TIMER_INCREMENT = 500;

	// <hr />

    // ####DDP constructor function

	//
    var DDP = function (endpoint, SocketConstructor, do_not_autoconnect, do_not_autoreconnect) {
        // Keep references to the necessary arguments
        this._endpoint = endpoint;
        this._SocketConstructor = SocketConstructor;
        this._autoreconnect = !do_not_autoreconnect;
        // Define containers for the various event callbacks we'll
        // be handling.
        this._onReadyCallbacks   = {};
        this._onResultCallbacks  = {};
        this._onUpdatedCallbacks = {};
        this._events = {};
        // By default, connect to the DDP server.
        if (!do_not_autoconnect) this.connect();
    };
    DDP.prototype.constructor = DDP;

	// <hr />

    // ###DDP public methods

    // #####connect

	//
    DDP.prototype.connect = function () {
        // Instantiate a new socket.
        this._socket = new this._SocketConstructor(this._endpoint);
        // Attach socket event listeners (binding them to the correct object).
        this._socket.onopen    = this._onSocketOpen.bind(this);
        this._socket.onmessage = this._onSocketMessage.bind(this);
        this._socket.onerror   = this._onSocketError.bind(this);
        this._socket.onclose   = this._onSocketClose.bind(this);
        // Reset reconnect counts and timer increments.
        this._reconnect_count = 0;
        this._reconnect_incremental_timer = 0;
    };

    // #####method

	//
    DDP.prototype.method = function (name, params, onResult, onUpdated) {
        // Generate a unique id for the method invocation.
        var id = uniqueId();
        // Register the onResult callback.
        this._onResultCallbacks[id] = onResult;
        // Register the onUpdated callback.
        this._onUpdatedCallbacks[id] = onUpdated;
        // Construct the appropriate DDP message and send it to the server.
        this._send({
            msg: "method",
            id: id,
            method: name,
            params: params
        });
    };

    // #####sub

	//
    DDP.prototype.sub = function (name, params, onReady) {
        // Generate a unique id for the method invocation.
        var id = uniqueId();
        // Register the onReady callback.
        this._onReadyCallbacks[id] = onReady;
        // Construct the appropriate DDP message and send it to the server.
        this._send({
            msg: "sub",
            id: id,
            name: name,
            params: params
        });
    };

    // #####unsub

	//
    DDP.prototype.unsub = function (id) {
        // Construct the appropriate DDP message and send it to the server.
        this._send({
            msg: "unsub",
            id: id
        });
    };

    // #####on

	//
    DDP.prototype.on = function (name, handler) {
        // Construct the array which will hold handlers. If one already
        // exists, use that.
        this._events[name] = this._events[name] || [];
        // Add the handler to the array.
        this._events[name].push(handler);
    };

    // #####off

	//
    DDP.prototype.off = function (name, handler) {
        // Check if any handlers are registered for the event.
        if (name in this._events === false) return;
        // If so, remove the provided handler (if it's contained in the array).
        this._events[name].splice(this._events[name].indexOf(handler), 1);
    };

    // #####emit

	//
    DDP.prototype.emit = function (name /* , arguments */) {
        // Check if any handlers are registered for the event.
        if (name in this._events === false) return;
        // If so, call each of the handlers, binding them to the right object
        // and passing them the provided arguments.
        var args = arguments;
        var self = this;
        this._events[name].forEach(function (handler) {
            handler.apply(self, Array.prototype.slice.call(args, 1));
        });
    };

	// <hr />

    // ###DDP private methods

    // #####_send

	//
    DDP.prototype._send = function (object) {
        var message;
        // If EJSON is available, use it to stringify the object.
        if (typeof EJSON === "undefined") {
            message = JSON.stringify(object);
        } else {
            message = EJSON.stringify(object);
        }
        // Send the message to the server.
        this._socket.send(message);
    };

    // #####_try_reconnect

	//
    DDP.prototype._try_reconnect = function () {
        // If we haven't tried too many times, try again after the appropriate
        // amount of time.
        if (this._reconnect_count < MAX_RECONNECT_ATTEMPTS) {
            setTimeout(this.connect.bind(this), this._reconnect_incremental_timer);
        }
        // Increase the reconnect count and the incremental timer to keep
        // reconnect attempts under control.
        this._reconnect_count += 1;
        this._reconnect_incremental_timer += TIMER_INCREMENT * this._reconnect_count;
    };

	// <hr />

    // ####DDP events handled by the library

    // Object containing built-in event handlers
    DDP.prototype._on = {};

    // #####_on.result

	//
    DDP.prototype._on.result = function (data) {
        // Try invoking the cllback.
        try {
            this._onResultCallbacks[data.id](data.error, data.result);
        // Silently ignore fails.
        } catch (e) {
        // Delete the callback(s) to prevent memory leaks.
        } finally {
            delete this._onResultCallbacks[data.id];
            if (data.error) delete this._onUpdatedCallbacks[data.id];
        }
    };

    // #####_on.updated

	//
    DDP.prototype._on.updated = function (data) {
        var self = this;
        // Since an "updated" message can refer to many methods, iterate
        // through the metodhs list.
        data.methods.forEach(function (id) {
            // Try invoking the cllback.
            try {
                self._onUpdatedCallbacks[id]();
            // Silently ignore fails.
            } catch (e) {
            // Delete the callback to prevent memory leaks.
            } finally {
                delete self._onUpdatedCallbacks[id];
            }
        });
    };

    // #####_on.nosub

	//
    DDP.prototype._on.nosub = function (data) {
        // Try invoking the cllback.
        try {
            this._onReadyCallbacks[data.id](data.error);
        // Silently ignore fails.
        } catch (e) {
        // Delete the callback to prevent memory leaks.
        } finally {
            delete this._onReadyCallbacks[data.id];
        }
    };

    // #####_on.ready

	//
    DDP.prototype._on.ready = function (data) {
        var self = this;
        // Since an "ready" message can refer to many subscriptions, iterate
        // through the metodhs list.
        data.subs.forEach(function (id) {
            // Try invoking the cllback.
            try {
                self._onReadyCallbacks[id]();
            // Silently ignore fails.
            } catch (e) {
            // Delete the callback to prevent memory leaks.
            } finally {
                delete self._onReadyCallbacks[id];
            }
        });
    };

	// <hr />

    // ####DDP events **not** handled by the library

	//
    DDP.prototype._on.error = function (data) {
        this.emit("error", data);
    };
    DDP.prototype._on.connected = function (data) {
        this.emit("connected", data);
    };
    DDP.prototype._on.failed = function (data) {
        this.emit("failed", data);
    };
    DDP.prototype._on.added = function (data) {
        this.emit("added", data);
    };
    DDP.prototype._on.removed = function (data) {
        this.emit("removed", data);
    };
    DDP.prototype._on.changed = function (data) {
        this.emit("changed", data);
    };

	// <hr />

    // ####Socket event handlers (handled by the library)

	//
    DDP.prototype._onSocketClose = function () {
        this.emit("socket_close");
        if (this._autoreconnect) this._try_reconnect();
    };
    DDP.prototype._onSocketError = function (e) {
        this.emit("socket_error", e);
        if (this._autoreconnect) this._try_reconnect();
    };
    DDP.prototype._onSocketOpen = function () {
        this._send({
            msg: "connect",
            version: "pre1",
            support: ["pre1"]
        });
    };

    // #####_onSocketMessage

	//
    DDP.prototype._onSocketMessage = function (message) {
        // Ignore the INIT_DDP_MESSAGE
        if (message.data === INIT_DDP_MESSAGE) return;
        try {
            var data;
            // Parse the message, using EJSON if available.
            if (typeof EJSON === "undefined") {
                data = JSON.parse(message.data);
            } else {
                data = EJSON.parse(message.data);
            }
            // Call the appropriate message handler.
            this._on[data.msg].call(this, data);
        } catch (e) {
            // If the message does not parse and therefore (E)JSON.parse
            // throws an error, warn the user about the malformed message.
            console.warn("Non DDP message received:");
            console.warn(message.data);
        }
    };

	// <hr />

    // Export the DDP constructor if running in node, attatch it to the
    // window object if running in the browser.
    if (typeof module !== "undefined" && module.exports) {
        module.exports = DDP;
    } else {
        window.DDP = DDP;
    }


})();
