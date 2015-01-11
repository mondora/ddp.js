var DDP =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var EventEmitter = __webpack_require__(1);

	var DDP = function (options) {
	    // Configuration
	    this._endpoint          = options.endpoint;
	    this._SocketConstructor = options.SocketConstructor;
	    // Init
	    this._init();
	};
	DDP.prototype = Object.create(EventEmitter.prototype);
	DDP.prototype.constructor = DDP;

	DDP.prototype._init = function () {
	    __webpack_require__(2).call(this);
	    __webpack_require__(3).call(this);
	    __webpack_require__(4).call(this);
	    __webpack_require__(5).call(this);
	    __webpack_require__(6).call(this);
	};

	DDP.prototype.connect = function () {
	    var c = __webpack_require__(7);
	    this._socket.send({
	        msg: "connect",
	        version: c.DDP_VERSION,
	        support: [c.DDP_VERSION]
	    });
	};

	DDP.prototype.method = function (name, params) {
	    var id = __webpack_require__(8).uniqueId();
	    this._socket.send({
	        msg: "method",
	        id: id,
	        method: name,
	        params: params
	    });
	    return id;
	};

	DDP.prototype.ping = function () {
	    var id = __webpack_require__(8).uniqueId();
	    this._socket.send({
	        msg: "ping",
	        id: id
	    });
	    return id;
	};

	DDP.prototype.pong = function (id) {
	    this._socket.send({
	        msg: "pong",
	        id: id
	    });
	    return id;
	};

	DDP.prototype.sub = function (name, params) {
	    var id = __webpack_require__(8).uniqueId();
	    this._socket.send({
	        msg: "sub",
	        id: id,
	        name: name,
	        params: params
	    });
	    return id;
	};

	DDP.prototype.unsub = function (id) {
	    this._socket.send({
	        msg: "unsub",
	        id: id
	    });
	    return id;
	};

	module.exports = DDP;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = EventEmitter;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*
	*   Set up the _socket proxy
	*/

	"use strict";

	module.exports = function () {
	    // _socket is a proxy for the _rawSocket, with the purpose of exposing a
	    // more consistent event api
	    var EventEmitter = __webpack_require__(1);
	    this._socket = new EventEmitter();
	    this._socket.send = (function (object) {
	        var message = JSON.stringify(object);
	        this._rawSocket.send(message);
	        // Emit a copy of the object, as we don't know who might be listening
	        this._socket.emit("message:out", JSON.parse(message));
	    }).bind(this);
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*
	*   Maintain a DDP connection with the server
	*/

	"use strict";

	module.exports = function () {
	    // Register handlers for the `_socket` events that are responsible for
	    // establishing and maintaining the DDP connection
	    this._socket.on("open", (function () {
	        // When the socket opens, send the `connect` message
	        // to establish the DDP connection
	        this.connect();
	    }).bind(this));
	    this._socket.on("close", (function () {
	        // When the socket closes, emit the `disconnected` event to the DDP
	        // connection, and try reconnecting after a timeout
	        this.emit("disconnected");
	        setTimeout(
	            __webpack_require__(6).bind(this),
	            __webpack_require__(7).RECONNECT_INTERVAL
	        );
	    }).bind(this));
	    this._socket.on("message:in", (function (message) {
	        // When the `connected` message is received, emit the `connected` event
	        // to the DDP connection
	        if (message.msg === "connected") {
	            this.emit("connected");
	        }
	    }).bind(this));
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
	*   Emits subscription and method related events
	*/

	"use strict";

	module.exports = function () {
	    this._socket.on("message:in", (function (message) {
	        var msgs = [
	            // Subscription messages
	            "ready",
	            "nosub",
	            "added",
	            "changed",
	            "removed",
	            // Method messages
	            "result",
	            "updated"
	        ];
	        if (__webpack_require__(8).contains(msgs, message.msg)) {
	            this.emit(message.msg, message);
	        }
	    }).bind(this));
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
	*   Responds to ping messages
	*/

	"use strict";

	module.exports = function () {
	    this._socket.on("message:in", (function (message) {
	        if (message.msg === "ping") {
	            this.pong(message.id);
	        }
	    }).bind(this));
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
	*   Create the socket instance and register event listeners
	*/

	"use strict";

	module.exports = function () {
	    // The `open`, `error` and `close` events are simply proxy-ed to `_socket`.
	    // The `message` event is instead parsed into a js object (if possible) and
	    // then passed as a parameter of the `message:in` event
	    this._rawSocket = new this._SocketConstructor(this._endpoint);
	    this._rawSocket.onopen    = this._socket.emit.bind(this._socket, "open");
	    this._rawSocket.onerror   = this._socket.emit.bind(this._socket, "error");
	    this._rawSocket.onclose   = this._socket.emit.bind(this._socket, "close");
	    this._rawSocket.onmessage = (function (message) {
	        var object;
	        try {
	            object = JSON.parse(message.data);
	        } catch (ignore) {
	            // Simply ignore the malformed message and return
	            return;
	        }
	        // Outside the try-catch block as it must only catch JSON parsing
	        // errors, not errors that may occur inside a "message:in" event handler
	        this._socket.emit("message:in", object);
	    }).bind(this);
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	    DDP_VERSION: "1",
	    DEFAULT_PING_INTERVAL: 10000,
	    RECONNECT_INTERVAL: 10000
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var uniqueId = (function () {
	    var i = 0;
	    return function () {
	        return (i++).toString();
	    };
	})();

	var contains = function (array, element) {
	    return array.indexOf(element) !== -1;
	};

	module.exports = {
	    uniqueId: uniqueId,
	    contains: contains
	};


/***/ }
/******/ ])