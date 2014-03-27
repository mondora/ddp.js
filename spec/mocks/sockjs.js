(function ($) {

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

	SockJS.prototype.send = function (msg) {
		this.lastSentMsg = msg;
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

	$.SockJS = SockJS;
})(window);
