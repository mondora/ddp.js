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
	// List of legitimate DDP server messages, to avoid the danger
	// of a rogue server triggering unwanted events on the client.
	var DDP_SERVER_MESSAGES = [
		"added", "changed", "connected", "error", "failed",
		"nosub", "ready", "removed", "result", "updated"
	];

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
		// Reset reconnect parameters
		this._reconnect_count = 0;
		this._reconnect_incremental_timer = 0;
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
        this._socket.onopen = this._on_socket_open.bind(this);
        this._socket.onmessage = this._on_socket_message.bind(this);
        this._socket.onerror = this._on_socket_error.bind(this);
        this._socket.onclose = this._on_socket_close.bind(this);
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
        if (!this._events[name]) return;
        // If so, remove the provided handler (if it's contained in the array).
        this._events[name].splice(this._events[name].indexOf(handler), 1);
    };

	// <hr />

    // ###DDP private methods

    // #####_emit

	//
    DDP.prototype._emit = function (name /* , arguments */) {
        // Check if any handlers are registered for the event.
        if (!this._events[name]) return;
        // If so, call each of the handlers, binding them to the right object
        // and passing them the provided arguments.
        var args = arguments;
        var self = this;
        this._events[name].forEach(function (handler) {
            handler.apply(self, Array.prototype.slice.call(args, 1));
        });
    };

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

    // #####_on_result

	//
    DDP.prototype._on_result = function (data) {
		// If a callback is defined
		if (this._onResultCallbacks[data.id]) {
			// Invoke it with the right arguments, then delete it
			this._onResultCallbacks[data.id](data.error, data.result);
			delete this._onResultCallbacks[data.id];
			// If the method resulted in an error, there won't be any
			// "updated" message, therefore delete the callback
			// associated to it (if any)
			if (data.error) delete this._onUpdatedCallbacks[data.id];
		// If there is no callback
		} else {
			// If the method resulted in an error
			if (data.error) {
				// Delete the "updated" callback (if any)
				delete this._onUpdatedCallbacks[data.id];
				// Raise an exception
				throw new Error(data.error);
			}
		}
    };

    // #####_on_updated

	//
    DDP.prototype._on_updated = function (data) {
        var self = this;
        // Since an "updated" message can refer to many methods, iterate
        // through the metodhs list.
        data.methods.forEach(function (id) {
			// And if there is a callback for an id
			if (self._onUpdatedCallbacks[id]) {
				// Invoke it
				self._onUpdatedCallbacks[id]();
				// Delete it
				delete self._onUpdatedCallbacks[id];
			}
        });
    };

    // #####_on_nosub

	//
    DDP.prototype._on_nosub = function (data) {
		// If there is a callback for the "ready" message
		if (this._onReadyCallbacks[data.id]) {
			// Call it passing it the error
			this._onReadyCallbacks[data.id](data.error);
			// Delete it
			delete this._onReadyCallbacks[data.id];
		// If there is no such callback
		} else {
			// Raise an exception
			throw new Error(data.error);
		}
    };

    // #####_on_ready

	//
    DDP.prototype._on_ready = function (data) {
        var self = this;
        // Since an "ready" message can refer to many subscriptions, iterate
        // through the metodhs list.
        data.subs.forEach(function (id) {
			// And if there is a callback for an id
			if (self._onReadyCallbacks[id]) {
				// Invoke it
				self._onReadyCallbacks[id]();
				// Delete it
				delete self._onReadyCallbacks[id];
			}
        });
    };

	// <hr />

    // ####DDP events **not** handled by the library

	//
    DDP.prototype._on_error = function (data) {
        this._emit("error", data);
    };
    DDP.prototype._on_connected = function (data) {
		// Reset reconnect counters
        this._reconnect_count = 0;
        this._reconnect_incremental_timer = 0;
        this._emit("connected", data);
    };
    DDP.prototype._on_failed = function (data) {
        this._emit("failed", data);
    };
    DDP.prototype._on_added = function (data) {
        this._emit("added", data);
    };
    DDP.prototype._on_removed = function (data) {
        this._emit("removed", data);
    };
    DDP.prototype._on_changed = function (data) {
        this._emit("changed", data);
    };

	// <hr />

    // ####Socket event handlers (handled by the library)

	//
    DDP.prototype._on_socket_close = function () {
        this._emit("socket_close");
        if (this._autoreconnect) this._try_reconnect();
    };
    DDP.prototype._on_socket_error = function (e) {
        this._emit("socket_error", e);
        if (this._autoreconnect) this._try_reconnect();
    };
    DDP.prototype._on_socket_open = function () {
        this._send({
            msg: "connect",
            version: "pre1",
            support: ["pre1"]
        });
    };

    // #####_on_socket_message

	//
    DDP.prototype._on_socket_message = function (message) {
		var data;
        // Ignore the INIT_DDP_MESSAGE
        if (message.data === INIT_DDP_MESSAGE) return;
        try {
            // Parse the message, using EJSON if available.
            if (typeof EJSON === "undefined") {
                data = JSON.parse(message.data);
            } else {
                data = EJSON.parse(message.data);
            }
			if (DDP_SERVER_MESSAGES.indexOf(data.msg) === -1) throw new Error();
        } catch (e) {
            // If the message does not parse and therefore (E)JSON.parse
            // throws an error, warn the user about the malformed message.
            console.warn("Non DDP message received:");
            console.warn(message.data);
			return;
        }
        // Call the appropriate message handler.
		this["_on_" + data.msg](data);
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
