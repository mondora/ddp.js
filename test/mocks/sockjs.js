(function () {

	var SockJS = function (url) {
		this.url = url;
		this.onerror   = _.noop;
		this.onmessage = _.noop;
		this.onopen    = _.noop;
		this.onclose   = _.noop;
		_.defer(_.bind(this._emit, this, "open"));
	};
	SockJS.prototype.constructor = SockJS;

	SockJS.prototype.close = function () {
		this._emit("close");
	};

	SockJS.prototype.send = function (message) {
		message = JSON.parse(message);
		this.lastSentMessage = message;
		this._server(message);
	};

	SockJS.prototype._emit = function (event, arg) {
		switch (event) {
			case "open":
				this.onopen(arg);
				break;
			case "close":
				this.onclose(arg);
				break;
			case "message":
				this.onmessage(arg);
				break;
			case "error":
				this.onerror(arg);
				break;
			default:
				throw new Error("SockJS Unknown event");
		}
	};

	SockJS.prototype._server = function (message) {
		var res = {};
		var data = {};
		switch (message.msg) {
			case "connect":
				data.msg = "connected";
				data.session = "fake_session_id";
				res.data = JSON.stringify(data);
				this._emit("message", res);
				break;
			case "sub":

				if (message.name === "ok") {
					data.msg = "ready";
					data.subs = [message.id];
					res.data = JSON.stringify(data);
					this._emit("message", res);
				}

				if (message.name === "nosub") {
					data.id = message.id;
					data.msg = "nosub";
					data.error = "error";
					res.data = JSON.stringify(data);
					this._emit("message", res);
				}

				break;
			case "unsub":
				break;
			case "method":

				if (message.method === "ok") {
					data.id = message.id;
					data.msg = "result";
					data.result = "result";
					res.data = JSON.stringify(data);
					this._emit("message", res);
				}

				if (message.method === "throw") {
					data.id = message.id;
					data.msg = "result";
					data.error = "error";
					res.data = JSON.stringify(data);
					this._emit("message", res);
				}

				if (message.method === "update") {
					data.msg = "updated";
					data.methods = [message.id];
					res.data = JSON.stringify(data);
					this._emit("message", res);
				}

				break;
			default:
		}
	};

    if (typeof module !== "undefined" && module.exports) {
        module.exports = SockJS;
    } else {
        window.SockJS = SockJS;
    }

})();
