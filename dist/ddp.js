(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("wolfy87-eventemitter"));
	else if(typeof define === 'function' && define.amd)
		define(["wolfy87-eventemitter"], factory);
	else if(typeof exports === 'object')
		exports["DDP"] = factory(require("wolfy87-eventemitter"));
	else
		root["DDP"] = factory(root["wolfy87-eventemitter"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _wolfy87Eventemitter = __webpack_require__(1);

	var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

	var _queue = __webpack_require__(2);

	var _queue2 = _interopRequireDefault(_queue);

	var _socket = __webpack_require__(3);

	var _socket2 = _interopRequireDefault(_socket);

	var _utils = __webpack_require__(4);

	var DDP_VERSION = "1";
	var PUBLIC_EVENTS = [
	// Subscription messages
	"ready", "nosub", "added", "changed", "removed",
	// Method messages
	"result", "updated",
	// Error messages
	"error"];
	var RECONNECT_INTERVAL = 10000;

	var DDP = (function (_EventEmitter) {
	    _inherits(DDP, _EventEmitter);

	    _createClass(DDP, [{
	        key: "emit",
	        value: function emit() {
	            var _this = this;

	            var args = arguments;
	            setTimeout(function () {
	                _get(Object.getPrototypeOf(DDP.prototype), "emit", _this).apply(_this, args);
	            }, 0);
	        }
	    }]);

	    function DDP(options) {
	        var _this2 = this;

	        _classCallCheck(this, DDP);

	        _get(Object.getPrototypeOf(DDP.prototype), "constructor", this).call(this);

	        this.status = "disconnected";

	        this.messageQueue = new _queue2["default"](function (message) {
	            if (_this2.status === "connected") {
	                _this2.socket.send(message);
	                return true;
	            } else {
	                return false;
	            }
	        });

	        this.socket = new _socket2["default"](options.SocketConstructor, options.endpoint);

	        this.socket.on("open", function () {
	            // When the socket opens, send the `connect` message
	            // to establish the DDP connection
	            _this2.socket.send({
	                msg: "connect",
	                version: DDP_VERSION,
	                support: [DDP_VERSION]
	            });
	        });

	        this.socket.on("close", function () {
	            _this2.status = "disconnected";
	            _this2.messageQueue.empty();
	            _this2.emit("disconnected");
	            // Schedule a reconnection
	            setTimeout(_this2.socket.connect.bind(_this2.socket), RECONNECT_INTERVAL);
	        });

	        this.socket.on("message:in", function (message) {
	            if (message.msg === "connected") {
	                _this2.status = "connected";
	                _this2.messageQueue.process();
	                _this2.emit("connected");
	            } else if (message.msg === "ping") {
	                // Reply with a `pong` message to prevent the server from
	                // closing the connection
	                _this2.socket.send({ msg: "pong", id: message.id });
	            } else if ((0, _utils.contains)(PUBLIC_EVENTS, message.msg)) {
	                _this2.emit(message.msg, message);
	            }
	        });

	        this.socket.connect();
	    }

	    _createClass(DDP, [{
	        key: "method",
	        value: function method(name, params) {
	            var id = (0, _utils.uniqueId)();
	            this.messageQueue.push({
	                msg: "method",
	                id: id,
	                method: name,
	                params: params
	            });
	            return id;
	        }
	    }, {
	        key: "sub",
	        value: function sub(name, params) {
	            var id = (0, _utils.uniqueId)();
	            this.messageQueue.push({
	                msg: "sub",
	                id: id,
	                name: name,
	                params: params
	            });
	            return id;
	        }
	    }, {
	        key: "unsub",
	        value: function unsub(id) {
	            this.messageQueue.push({
	                msg: "unsub",
	                id: id
	            });
	            return id;
	        }
	    }, {
	        key: "ping",
	        value: function ping() {
	            var id = (0, _utils.uniqueId)();
	            this.messageQueue.push({
	                msg: "ping",
	                id: id
	            });
	            return id;
	        }
	    }, {
	        key: "close",
	        value: function close() {
	            this.socket.close();
	        }
	    }]);

	    return DDP;
	})(_wolfy87Eventemitter2["default"]);

	exports["default"] = DDP;
	module.exports = exports["default"];

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Queue = (function () {

	    /*
	    *   As the name implies, `consumer` is the (sole) consumer of the queue.
	    *   It gets called with each element of the queue and its return value
	    *   serves as a ack, determining whether the element is removed or not from
	    *   the queue, allowing then subsequent elements to be processed.
	    */

	    function Queue(consumer) {
	        _classCallCheck(this, Queue);

	        this.consumer = consumer;
	        this.queue = [];
	    }

	    _createClass(Queue, [{
	        key: "push",
	        value: function push(element) {
	            this.queue.push(element);
	            this.process();
	        }
	    }, {
	        key: "process",
	        value: function process() {
	            var _this = this;

	            setTimeout(function () {
	                if (_this.queue.length !== 0) {
	                    var ack = _this.consumer(_this.queue[0]);
	                    if (ack) {
	                        _this.queue.shift();
	                        _this.process();
	                    }
	                }
	            }, 0);
	        }
	    }, {
	        key: "empty",
	        value: function empty() {
	            this.queue = [];
	        }
	    }]);

	    return Queue;
	})();

	exports["default"] = Queue;
	module.exports = exports["default"];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _wolfy87Eventemitter = __webpack_require__(1);

	var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

	var Socket = (function (_EventEmitter) {
	    _inherits(Socket, _EventEmitter);

	    _createClass(Socket, [{
	        key: "emit",
	        value: function emit() {
	            var _this = this;

	            var args = arguments;
	            setTimeout(function () {
	                _get(Object.getPrototypeOf(Socket.prototype), "emit", _this).apply(_this, args);
	            }, 0);
	        }
	    }]);

	    function Socket(SocketConstructor, endpoint) {
	        _classCallCheck(this, Socket);

	        _get(Object.getPrototypeOf(Socket.prototype), "constructor", this).call(this);
	        this.SocketConstructor = SocketConstructor;
	        this.endpoint = endpoint;
	    }

	    _createClass(Socket, [{
	        key: "send",
	        value: function send(object) {
	            var message = JSON.stringify(object);
	            this.rawSocket.send(message);
	            // Emit a copy of the object, as the listener might mutate it.
	            this.emit("message:out", JSON.parse(message));
	        }
	    }, {
	        key: "connect",
	        value: function connect() {
	            var _this2 = this;

	            this.rawSocket = new this.SocketConstructor(this.endpoint);

	            /*
	            *   The `open`, `error` and `close` events are simply proxy-ed to `_socket`.
	            *   The `message` event is instead parsed into a js object (if possible) and
	            *   then passed as a parameter of the `message:in` event
	            */

	            this.rawSocket.onopen = function () {
	                return _this2.emit("open");
	            };
	            this.rawSocket.onerror = function (error) {
	                return _this2.emit("error", error);
	            };
	            this.rawSocket.onclose = function () {
	                return _this2.emit("close");
	            };
	            this.rawSocket.onmessage = function (message) {
	                var object;
	                try {
	                    object = JSON.parse(message.data);
	                } catch (ignore) {
	                    // Simply ignore the malformed message and return
	                    return;
	                }
	                // Outside the try-catch block as it must only catch JSON parsing
	                // errors, not errors that may occur inside a "message:in" event handler
	                _this2.emit("message:in", object);
	            };
	        }
	    }, {
	        key: "close",
	        value: function close() {
	            this.rawSocket.close();
	        }
	    }]);

	    return Socket;
	})(_wolfy87Eventemitter2["default"]);

	exports["default"] = Socket;
	module.exports = exports["default"];

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.uniqueId = uniqueId;
	exports.contains = contains;
	var i = 0;

	function uniqueId() {
	    return (i++).toString();
	}

	function contains(array, element) {
	    return array.indexOf(element) !== -1;
	}

/***/ }
/******/ ])
});
;