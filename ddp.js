(function () {

    "use strict";

    var uniqueId = (function () {
        var i = 0;
        return function () {
            return (i++).toString();
        };
    })();

	var shimUnderscore = function () {
		var _ = {};
		_.forEach = function(obj, iterator, context) {
			var nativeForEach = Array.prototype.forEach;
			if (nativeForEach && obj.forEach === nativeForEach) {
				return obj.forEach(iterator, context);
			}
			throw new Error("Unsupported browser. Include underscore.js for compatibility.");
		}; 
		_.bind = function(func, context) {
			var nativeBind = Function.prototype.bind;
			if (nativeBind && func.bind === nativeBind) {
				return nativeBind.apply(func, Array.prototype.slice.call(arguments, 1));
			}
			throw new Error("Unsupported browser. Include underscore.js for compatibility.");
		};
		return _;
	};
	if (typeof _ === "undefined") {
		var _ = shimUnderscore();
	}

    var INIT_DDP_MESSAGE = "{\"server_id\":\"0\"}";
    var MAX_RECONNECT_ATTEMPTS = 10;
    var TIMER_INCREMENT = 500;
	var DDP_SERVER_MESSAGES = [
		"added", "changed", "connected", "error", "failed",
		"nosub", "ready", "removed", "result", "updated"
	];

    var DDP = function (options) {
        this._endpoint = options.endpoint;
        this._SocketConstructor = options.SocketConstructor;
        this._autoreconnect = !options.do_not_autoreconnect;
        this._onReadyCallbacks   = {};
        this._onResultCallbacks  = {};
        this._onUpdatedCallbacks = {};
        this._events = {};
		this._reconnect_count = 0;
		this._reconnect_incremental_timer = 0;
        if (!options.do_not_autoconnect) this.connect();
    };
    DDP.prototype.constructor = DDP;

    DDP.prototype.connect = function () {
        this._socket = new this._SocketConstructor(this._endpoint);
        this._socket.onopen = _.bind(this._on_socket_open, this);
        this._socket.onmessage = _.bind(this._on_socket_message, this);
        this._socket.onerror = _.bind(this._on_socket_error, this);
        this._socket.onclose = _.bind(this._on_socket_close, this);
    };

    DDP.prototype.method = function (name, params, onResult, onUpdated) {
        var id = uniqueId();
        this._onResultCallbacks[id] = onResult;
        this._onUpdatedCallbacks[id] = onUpdated;
        this._send({
            msg: "method",
            id: id,
            method: name,
            params: params
        });
    };

    DDP.prototype.sub = function (name, params, onReady) {
        var id = uniqueId();
        this._onReadyCallbacks[id] = onReady;
        this._send({
            msg: "sub",
            id: id,
            name: name,
            params: params
        });
    };

    DDP.prototype.unsub = function (id) {
        this._send({
            msg: "unsub",
            id: id
        });
    };

    DDP.prototype.on = function (name, handler) {
        this._events[name] = this._events[name] || [];
        this._events[name].push(handler);
    };

    DDP.prototype.off = function (name, handler) {
        if (!this._events[name]) return;
        this._events[name].splice(this._events[name].indexOf(handler), 1);
    };

    DDP.prototype._emit = function (name /* , arguments */) {
        if (!this._events[name]) return;
        var args = arguments;
        var self = this;
        _.forEach(this._events[name], function (handler) {
            handler.apply(self, Array.prototype.slice.call(args, 1));
        });
    };

    DDP.prototype._send = function (object) {
        var message;
        if (typeof EJSON === "undefined") {
            message = JSON.stringify(object);
        } else {
            message = EJSON.stringify(object);
        }
        this._socket.send(message);
    };

    DDP.prototype._try_reconnect = function () {
        if (this._reconnect_count < MAX_RECONNECT_ATTEMPTS) {
            setTimeout(_.bind(this.connect, this), this._reconnect_incremental_timer);
        }
        this._reconnect_count += 1;
        this._reconnect_incremental_timer += TIMER_INCREMENT * this._reconnect_count;
    };

    DDP.prototype._on_result = function (data) {
		if (this._onResultCallbacks[data.id]) {
			this._onResultCallbacks[data.id](data.error, data.result);
			delete this._onResultCallbacks[data.id];
			if (data.error) delete this._onUpdatedCallbacks[data.id];
		} else {
			if (data.error) {
				delete this._onUpdatedCallbacks[data.id];
				throw new Error(data.error);
			}
		}
    };
    DDP.prototype._on_updated = function (data) {
        var self = this;
        _.forEach(data.methods, function (id) {
			if (self._onUpdatedCallbacks[id]) {
				self._onUpdatedCallbacks[id]();
				delete self._onUpdatedCallbacks[id];
			}
        });
    };
    DDP.prototype._on_nosub = function (data) {
		if (this._onReadyCallbacks[data.id]) {
			this._onReadyCallbacks[data.id](data.error);
			delete this._onReadyCallbacks[data.id];
		} else {
			throw new Error(data.error);
		}
    };
    DDP.prototype._on_ready = function (data) {
        var self = this;
        _.forEach(data.subs, function (id) {
			if (self._onReadyCallbacks[id]) {
				self._onReadyCallbacks[id]();
				delete self._onReadyCallbacks[id];
			}
		});
    };

    DDP.prototype._on_error = function (data) {
        this._emit("error", data);
    };
    DDP.prototype._on_connected = function (data) {
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
    DDP.prototype._on_socket_message = function (message) {
        var data;
        if (message.data === INIT_DDP_MESSAGE) return;
        try {
            if (typeof EJSON === "undefined") {
                data = JSON.parse(message.data);
            } else {
                data = EJSON.parse(message.data);
            }
			if (DDP_SERVER_MESSAGES.indexOf(data.msg) === -1) throw new Error();
        } catch (e) {
            console.warn("Non DDP message received:");
            console.warn(message.data);
			return;
		}
		this["_on_" + data.msg](data);
	};

    if (typeof module !== "undefined" && module.exports) {
        module.exports = DDP;
    } else {
        window.DDP = DDP;
    }

})();
