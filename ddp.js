(function($){

	/////////////////////
	// DDP constructor //
	/////////////////////

	var DDP = function (url) {
		this._status = "pristine";
		this._url = url;
		this._onReadyCallbacks = {};
		this._onResultCallbacks = {};
		this._onUpdatedCallbacks = {};
		this._onAddedCallbacks = [];
		this._onRemovedCallbacks = [];
		this._onChangedCallbacks = [];
	};

	DDP.prototype.constructor = DDP;

	////////////////////////
	// DDP public methods //
	////////////////////////

	DDP.prototype.connect = function (onConnected, onFailed) {
		if (this._status !== "pristine") {
			throw new Error("This DDP connection has already been opened.");
		}
		this._status = "connecting";
		this.onConnected = onConnected;
		this.onFailed    = onFailed;
		this._socket = new SockJS(this._url);
		this._socket.onopen    = _.bind(this._onSocketOpen, this);
		this._socket.onmessage = _.bind(this._onSocketMessage, this);
		this._socket.onerror   = _.bind(this._onSocketError, this);
		this._socket.onclose   = _.bind(this._onSocketClose, this);
	};

	DDP.prototype.disconnect = function (onDisconnected) {
		this.onDisconnected = onDisconnected;
		this._socket.close();
	};

	DDP.prototype.method = function (name, params, onResult, onUpdated) {
		var id = _.uniqueId();
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
		var id = _.uniqueId();
		this._onReadyCallbacks[id] = onReady || _.noop;
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

	DDP.prototype.getStatus = function () {
		return this._status;
	};

	DDP.prototype.on = function (eventName, eventHandler) {
		if (_.isString(eventName) && _.isFunction(eventHandler)) {
			switch (eventName) {
				case "added":
					this._onAddedCallbacks.push(eventHandler);
					break;
				case "removed":
					this._onRemovedCallbacks.push(eventHandler);
					break;
				case "changed":
					this._onChangedCallbacks.push(eventHandler);
					break;
				default:
					throw new Error("DDP Unknown event name.");
			}
			return;
		}
		throw new Error("DDP Bad call to the \"on\" method.");
	};

	DDP.prototype.once = function (eventName, eventHandler) {
		if (_.isString(eventName) && _.isFunction(eventHandler)) {
			eventHandler = _.once(eventHandler);
			switch (eventName) {
				case "added":
					this._onAddedCallbacks.push(eventHandler);
					break;
				case "removed":
					this._onRemovedCallbacks.push(eventHandler);
					break;
				case "changed":
					this._onChangedCallbacks.push(eventHandler);
					break;
				default:
					throw new Error("DDP Unknown event name.");
			}
			return;
		}
		throw new Error("DDP Bad call to the \"once\" method.");
	};

	DDP.prototype.off = function (eventName, eventHandler) {
		if (_.isUndefined(eventName) && _.isUndefined(eventHandler)) {
			this._onAddedCallbacks   = [];
			this._onRemovedCallbacks = [];
			this._onChangedCallbacks = [];
			return;
		}
		if (_.isFunction(eventName) && _.isUndefined(eventHandler)) {
			this._onAddedCallbacks   = _.without(this._onAddedCallbacks,   eventHandler);
			this._onRemovedCallbacks = _.without(this._onRemovedCallbacks, eventHandler);
			this._onChangedCallbacks = _.without(this._onChangedCallbacks, eventHandler);
			return;
		}
		if (_.isString(eventName) && _.isUndefined(eventHandler)) {
			switch (eventName) {
				case "added":
					this._onAddedCallbacks = [];
					break;
				case "removed":
					this._onRemovedCallbacks = [];
					break;
				case "changed":
					this._onChangedCallbacks = [];
					break;
				default:
					throw new Error("DDP Unknown event name.");
			}
			return;
		}
		if (_.isString(eventName) && _.isFunction(eventHandler)) {
			switch (eventName) {
				case "added":
					this._onAddedCallbacks   = _.without(this._onAddedCallbacks,   eventHandler);
					break;
				case "removed":
					this._onRemovedCallbacks = _.without(this._onRemovedCallbacks, eventHandler);
					break;
				case "changed":
					this._onChangedCallbacks = _.without(this._onChangedCallbacks, eventHandler);
					break;
				default:
					throw new Error("DDP Unknown event name.");
			}
			return;
		}
		throw new Error("DDP Bad call to the \"off\" method.");
	};

	DDP.prototype.getListeners = function (eventName) {
		if (_.isString(eventName)) {
			switch (eventName) {
				case "added":
					return this._onAddedCallbacks;
				case "removed":
					return this._onRemovedCallbacks;
				case "changed":
					return this._onChangedCallbacks;
				default:
					throw new Error("DDP Unknown event name.");
			}
		}
		return {
			added:   this._onAddedCallbacks,
			removed: this._onRemovedCallbacks,
			changed: this._onChangedCallbacks
		};
	};

	/////////////////////////
	// DDP private methods //
	/////////////////////////

	DDP.prototype._send = function (object) {
		this._socket.send(JSON.stringify(object));
	};

	//////////////////////////
	// DDP message handlers //
	//////////////////////////

	DDP.prototype._onError = function (data) {
		console.log(data);
		throw new Error("DDP Error");
	};

	DDP.prototype._onConnected = function (data) {
		this._status = "connected";
		if (_.isFunction(this.onConnected)) {
			this.onConnected(data.sessionId);
		}
	};

	DDP.prototype._onFailed = function (data) {
		this._status = "failed";
		if (_.isFunction(this.onFailed)) {
			this.onFailed(data.version);
		} else {
			console.log(data);
			throw new Error("DDP Connection Failed");
		}
	};

	DDP.prototype._onResult = function (data) {
		var cb = this._onResultCallbacks[data.id];
		if (data.error) {
			if (_.isFunction(cb)) {
				cb(data.error, data.result);
				delete this._onResultCallbacks[data.id];
				delete this._onUpdatedCallbacks[data.id];
			} else {
				delete this._onUpdatedCallbacks[data.id];
				console.log(data);
				throw new Error("DDP Method Error");
			}
		} else {
			if (_.isFunction(cb)) {
				cb(false, data.result);
				delete this._onResultCallbacks[data.id];
			}
		}
	};

	DDP.prototype._onUpdated = function (data) {
		var self = this;
		_.forEach(data.methods, function (id) {
			var cb = self._onUpdatedCallbacks[id];
			if (_.isFunction(cb)) {
				cb();
			}
			delete self._onUpdatedCallbacks[id];
		});
	};

	DDP.prototype._onNosub = function (data) {
		var cb = this._onReadyCallbacks[id];
		if (_.isFunction(cb)) {
			cb(data.error);
			delete this._onReadyCallbacks[id];
		} else {
			console.log(data);
			throw new Error("DDP Nosub Error");
		}
	};

	DDP.prototype._onReady = function (data) {
		var self = this;
		_.forEach(data.subs, function (id) {
			var cb = self._onReadyCallbacks[id];
			if (_.isFunction(cb)) {
				cb();
			}
			delete self._onReadyCallbacks[id];
		});
	};

	DDP.prototype._onAdded = function (data) {
		_.forEach(this._onAddedCallbacks, function (fn) {
			fn(data);
		});
	};

	DDP.prototype._onRemoved = function (data) {
		_.forEach(this._onRemovedCallbacks, function (fn) {
			fn(data);
		});
	};

	DDP.prototype._onChanged = function (data) {
		_.forEach(this._onChangedCallbacks, function (fn) {
			fn(data);
		});
	};

	///////////////////////////
	// Socket event handlers //
	///////////////////////////

	DDP.prototype._onSocketClose = function () {
		this._status = "disconnected";
		_.isFunction(this.onDisconnected) && this.onDisconnected();
	};

	DDP.prototype._onSocketError = function (e) {
		this._status = "error";
		console.log(e);
		throw new Error("Socket Error");
	};

	DDP.prototype._onSocketOpen = function (e) {
		this._send({
			msg: "connect",
			version: "pre1",
			support: ["pre1"]
		});
	};

	DDP.prototype._onSocketMessage = function (message) {
		var data = JSON.parse(message.data);
		if (_.isUndefined(data.msg)) {
			return;
		}
		switch (data.msg) {
			case "error":
				this._onError(data);
				break;
			case "connected":
				this._onConnected(data);
				break;
			case "failed":
				this._onFailed(data);
				break;
			case "result":
				this._onResult(data);
				break;
			case "updated":
				this._onUpdated(data);
				break;
			case "nosub":
				this._onNosub(data);
				break;
			case "ready":
				this._onReady(data);
				break;
			case "added":
				this._onAdded(data);
				break;
			case "removed":
				this._onRemoved(data);
				break;
			case "changed":
				this._onChanged(data);
				break;
			default:
				console.log(data);
				throw new Error("DDP No Corresponding Message");
		}
	};

	$.DDP = DDP;
})(window);
