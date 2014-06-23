if (typeof window === "undefined") {
	ENV = "node";
	GLB = global;
	GLB._ = require("lodash");
	GLB.sinon = require("sinon");
	GLB.should = require("should");
	GLB.SockJS = require("./mocks/sockjs.js");
	GLB.DDP = require("../src/ddp.js");
} else {
	ENV = "browser";
	GLB = window;
}

describe("The library ddp.js", function () {

	if (ENV === "node") {
		it("should export a DDP object which should be a constructor", function () {
			_.isFunction(DDP).should.be.true;
			(DDP.prototype.constructor).should.equal(DDP);
		});
	}

	if (ENV === "browser") {
		it("should export a DDP object which should be a constructor", function () {
			_.isFunction(window.DDP).should.be.true;
			(DDP.prototype.constructor).should.equal(DDP);
		});
	}

});

/*
describe("The shimUnderscore private function", function () {

	it("should return an object with forEach and bind methods", function () {
		// Test it with rewire
	});

});
*/

var optionsAutoconnect = {
	endpoint: "",
	SocketConstructor: SockJS
};

var optionsDontAutoconnect = {
	endpoint: "",
	SocketConstructor: SockJS,
	do_not_autoconnect: true
};

describe("Instantiating a DDP instance", function () {

	describe("should return an object with the following public methods:", function () {
		var ddp = new DDP(optionsAutoconnect);

		it("connect", function () {
			_.isFunction(ddp.connect).should.be.true;
		});

		it("method", function () {
			_.isFunction(ddp.method).should.be.true;
		});

		it("sub", function () {
			_.isFunction(ddp.sub).should.be.true;
		});

		it("unsub", function () {
			_.isFunction(ddp.unsub).should.be.true;
		});

		it("on", function () {
			_.isFunction(ddp.on).should.be.true;
		});

		it("off", function () {
			_.isFunction(ddp.off).should.be.true;
		});

	});

	it("should call the \"connect\" method if the third argument passed to the constructor is falsy", function () {
		sinon.spy(DDP.prototype, "connect");
		var ddp = new DDP(optionsAutoconnect);
		ddp.connect.called.should.be.true;
		DDP.prototype.connect.restore();
	});

	it("should not call the \"connect\" method if the third argument passed to the constructor is truthy", function () {
		sinon.spy(DDP.prototype, "connect");
		var ddp = new DDP(optionsDontAutoconnect);
		ddp.connect.called.should.be.false;
		DDP.prototype.connect.restore();
	});

});

describe("The connect method", function () {

	it("should instanciate a new _SocketConstructor instance, calling _SocketConstructor with this._endpoint as sole argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		sinon.spy(ddp, "_SocketConstructor");
		ddp.connect();
		ddp._SocketConstructor.calledWith(ddp._endpoint).should.be.true;
		ddp._SocketConstructor.restore();
	});

	it("should set the readyState to 0", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp.connect();
		ddp.readyState.should.equal(0);
	});

	it("should instanciate a new _SocketConstructor instance and sotre a reference to it in the _socket property", function () {
		var ddp = new DDP(optionsAutoconnect);
		(ddp._socket instanceof ddp._SocketConstructor).should.be.true;
	});

	it("should register _on_socket_open as handler for the _socket \"open\" event", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		sinon.spy(ddp, "_on_socket_open");
		ddp.connect();
		ddp._on_socket_open();
		ddp._on_socket_open.calledOn(ddp).should.be.true;
		ddp._on_socket_open.restore();
	});

	it("should register _on_socket_close as handler for the _socket \"close\" event", function () {
		var ddp = new DDP(optionsAutoconnect);
		sinon.spy(ddp, "_on_socket_close");
		ddp.connect();
		ddp._on_socket_close();
		ddp._on_socket_close.calledOn(ddp).should.be.true;
		ddp._on_socket_close.restore();
	});

	it("should register _on_socket_error as handler for the _socket \"error\" event", function () {
		var ddp = new DDP(optionsAutoconnect);
		sinon.spy(ddp, "_on_socket_error");
		ddp.connect();
		ddp._on_socket_error();
		ddp._on_socket_error.calledOn(ddp).should.be.true;
		ddp._on_socket_error.restore();
	});

	it("should register _on_socket_message as handler for the _socket \"message\" event", function () {
		var tmp = DDP.prototype._on_socket_message;
		DDP.prototype._on_socket_message = sinon.spy();
		var ddp = new DDP(optionsAutoconnect);
		ddp._on_socket_message();
		ddp._on_socket_message.calledOn(ddp).should.be.true;
		DDP.prototype._on_socket_message = tmp;
	});

});

describe("The method method", function () {

	it("should send a \"method\" DDP message to the server", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var ddpMethod = {
			msg: "method",
			method: "ok",
			params: ["params"]
		};
		ddp.on("connected", function () {
			ddp._send = sinon.spy();
			ddp.method(ddpMethod.method, ddpMethod.params);
			_.omit(ddp._send.args[0][0], "id").should.eql(ddpMethod);
			done();
		});
	});

	it("should register its thrid argument as handler for the \"result\" event", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var handler = function () {};
		ddp.on("connected", function () {
			ddp.method("method", [""], handler);
			_.contains(ddp._onResultCallbacks, handler).should.be.true;
			done();
		});
	});

	it("should register its fourth argument as handler for the \"updated\" event", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var handler = function () {};
		ddp.on("connected", function () {
			ddp.method("method", [""], null, handler);
			_.contains(ddp._onUpdatedCallbacks, handler).should.be.true;
			done();
		});
	});

	it("should return the id of the method", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var handler = function () {};
		ddp.on("connected", function () {
			var id = ddp.method("method", [""], handler);
			ddp._onResultCallbacks[id].should.equal(handler);
			done();
		});
	});

});

describe("The sub method", function () {

	it("should send a \"sub\" DDP message to the server", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var ddpSub = {
			msg: "sub",
			name: "sub",
			params: ["params"]
		};
		ddp.on("connected", function () {
			ddp._send = sinon.spy();
			ddp.sub(ddpSub.name, ddpSub.params);
			_.omit(ddp._send.args[0][0], "id").should.eql(ddpSub);
			done();
		});
	});

	it("should register its thrid argument as handler for the \"ready\" event", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var onReady = function () {};
		ddp.on("connected", function () {
			ddp.sub("method", [""], onReady);
			_.contains(ddp._onReadyCallbacks, onReady).should.be.true;
			done();
		});
	});

	it("should register its fourth and fifth arguments as handlers for the \"nosub\" event", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var onStop = function () {};
		var onError = function () {};
		ddp.on("connected", function () {
			ddp.sub("method", [""], null, onStop, onError);
			_.contains(ddp._onStopCallbacks, onStop).should.be.true;
			_.contains(ddp._onErrorCallbacks, onError).should.be.true;
			done();
		});
	});

	it("should return the id of the subscription", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var onReady = function () {};
		ddp.on("connected", function () {
			var id = ddp.sub("method", [""], onReady);
			ddp._onReadyCallbacks[id].should.equal(onReady);
			done();
		});
	});

});

describe("The unsub method", function () {

	it("should send an \"unsub\" DDP message to the server", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var ddpUnsub = {
			msg: "unsub",
			id: "fake_sub_id"
		};
		ddp.on("connected", function () {
			ddp._send = sinon.spy();
			ddp.unsub(ddpUnsub.id);
			ddp._send.args[0][0].should.eql(ddpUnsub);
			done();
		});
	});

});

describe("The on method", function () {

	it("should register the function provided as second argument as a handler for the event provided as first argument", function () {
		var ddp = new DDP(optionsAutoconnect);
		var event = {
			name: "name",
			handler: function () {}
		};
		ddp.on(event.name, event.handler);
		_.contains(ddp._events[event.name], event.handler).should.be.true;
	});

});

describe("The off method", function () {

	it("should de-register the function provided as second argument as a handler for the event provided as first argument", function () {
		var ddp = new DDP(optionsAutoconnect);
		var event = {
			name: "name",
			handler: function () {}
		};
		ddp.on(event.name, event.handler);
		_.contains(ddp._events[event.name], event.handler).should.be.true;
		ddp.off(event.name, event.handler);
		_.contains(ddp._events[event.name], event.handler).should.be.false;
	});

});

describe("The _emit private method", function () {

	it("should call all registered handlers on the event provided as first argument", function () {
		var ddp = new DDP(optionsAutoconnect);
		var event = {
			name: "name",
			handler: sinon.spy()
		};
		ddp.on(event.name, event.handler);
		_.contains(ddp._events[event.name], event.handler).should.be.true;
		ddp._emit(event.name);
		event.handler.called.should.be.true;
	});

	it("should proxy all arguments except the first to the handler", function () {
		var ddp = new DDP(optionsAutoconnect);
		var event = {
			name: "name",
			handler: sinon.spy()
		};
		var aa1 = {};
		var aa2 = {};
		var aa3 = {};
		var aa4 = {};
		ddp.on(event.name, event.handler, aa1, aa2, aa3, aa4);
		_.contains(ddp._events[event.name], event.handler).should.be.true;
		ddp._emit(event.name);
		_.contains(event.handler.args[0], aa1);
		_.contains(event.handler.args[0], aa2);
		_.contains(event.handler.args[0], aa3);
		_.contains(event.handler.args[0], aa4);
	});

});

describe("The _send private method", function () {

	describe("if the \"readyState\" property of the DDP instance equals 1", function () {

		it("should stringify the first argument passed to it with EJSON if available", function () {
			var ddp = new DDP(optionsAutoconnect);
			ddp._socket.send = _.noop;
			ddp.readyState = 1;
			var obj = {};
			GLB.EJSON = {
				stringify: sinon.spy()
			};
			ddp._send(obj);
			EJSON.stringify.calledWith(obj).should.be.true;
			delete GLB.EJSON;
		});

		it("should stringify the first argument passed to it with JSON if EJSON is not available", function () {
			var ddp = new DDP(optionsAutoconnect);
			ddp._socket.send = _.noop;
			ddp.readyState = 1;
			var obj = {};
			var tmp = JSON.stringify;
			JSON.stringify = sinon.spy();
			ddp._send(obj);
			JSON.stringify.calledWith(obj).should.be.true;
			JSON.stringify = tmp;
		});

		it("should call the _socket.send method with the stringified object as first argument", function () {
			var ddp = new DDP(optionsAutoconnect);
			ddp._socket.send = sinon.spy();
			ddp.readyState = 1;
			var obj = {};
			ddp._send(obj);
			ddp._socket.send.calledWith("{}").should.be.true;
		});

	});

	describe("if the \"readyState\" property of the DDP instance does not equal 1", function () {

		it("should add its first argument at the end of the \"_queue\" array", function () {
			var ddp = new DDP(optionsAutoconnect);
			ddp.readyState = 0;
			var obj = {};
			ddp._send(obj);
			ddp._queue[ddp._queue.length - 1].should.equal(obj);
		});
	});

});

describe("The _try_reconnect private method", function () {

	it("should increase _reconnect_counter by 1 each time it's called, for the first ten times", function () {
		var ddp = new DDP(optionsAutoconnect);
		ddp.connect = _.noop;
		var currentCount = ddp._reconnect_count;
		ddp._try_reconnect();
		ddp._reconnect_count.should.equal(currentCount + 1);
	});

	it("and after time 10, it should not", function () {
		var ddp = new DDP(optionsAutoconnect);
		ddp.connect = _.noop;
		var currentCount = ddp._reconnect_count;
		for (var i=0; i<100; i++) {
			ddp._try_reconnect();
		}
		ddp._reconnect_count.should.equal(10);
	});

	it("should increase _reconnect_incremental_timer by 300 each time it's called, for the first ten times", function () {
		var ddp = new DDP(optionsAutoconnect);
		ddp.connect = _.noop;
		var currentTimer = ddp._reconnect_incremental_timer;
		ddp._try_reconnect();
		ddp._reconnect_incremental_timer.should.equal(currentTimer + 300);
	});

	it("and after time 10, it should plateau at 16500", function () {
		var ddp = new DDP(optionsAutoconnect);
		ddp.connect = _.noop;
		var currentTimer = ddp._reconnect_incremental_timer;
		for (var i=0; i<100; i++) {
			ddp._try_reconnect();
		}
		ddp._reconnect_incremental_timer.should.equal(16500);
	});

});

describe("The _on_result private method", function () {

	describe("receives as only argument an object containing the properties id, error, result and", function () {

		describe("if _onResultCallbacks[id] exists", function () {

			it("should call it, passing error and result as first and second arguments respectively", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {},
					result: {}
				};
				var cb = sinon.spy();
				ddp._onResultCallbacks[0] = cb;
				ddp._on_result(obj);
				cb.calledWith(obj.error, obj.result).should.be.true;
			});

			it("should delete that reference to the function after calling it", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {},
					result: {}
				};
				var cb = sinon.spy();
				ddp._onResultCallbacks[0] = cb;
				ddp._on_result(obj);
				_.isUndefined(ddp._onResultCallbacks[0]).should.be.true;
			});

			it("and if error is truthy, should delete the _onUpdatedCallbacks[id] after calling _onResultCallbacks[id]", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {},
					result: {}
				};
				var cb = sinon.spy();
				ddp._onResultCallbacks[0] = cb;
				ddp._onUpdatedCallbacks[0] = cb;
				ddp._on_result(obj);
				_.isUndefined(ddp._onUpdatedCallbacks[0]).should.be.true;
			});

		});

		describe("if _onResultCallbacks[id] doesn't exist", function () {

			it("should not throw an error if error is falsy", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					result: {}
				};
				(function () {
					ddp._on_result(obj);
				}).should.not.throw();
			});

			it("should throw an error if error is truthy", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {}
				};
				(function () {
					ddp._on_result(obj);
				}).should.throw(obj.error);
			});

			it("should delete the _onUpdatedCallbacks[id] if error is truthy", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {},
					result: {}
				};
				ddp._onUpdatedCallbacks[0] = _.noop;
				(function () {
					ddp._on_result(obj);
				}).should.throw(obj.error);
				_.isUndefined(ddp._onUpdatedCallbacks[0]).should.be.true;
			});

		});

	});

});

describe("The _on_updated private method", function () {

	describe("receives as only argument an object containing the property methods (an array of ids) and", function () {

		it("it should call all of the _onUpdatedCallbacks[id] where id belongs to method", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				methods: ["0", "1", "2", "3"]
			};
			var cb = sinon.spy();
			ddp._onUpdatedCallbacks[0] = cb;
			ddp._onUpdatedCallbacks[1] = cb;
			ddp._onUpdatedCallbacks[2] = cb;
			ddp._onUpdatedCallbacks[3] = cb;
			ddp._on_updated(obj);
			cb.callCount.should.equal(4);
		});

		it("it should delete the _onUpdatedCallbacks[id]-s it calls after calling them", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				methods: ["0", "1", "2", "3"]
			};
			var cb = sinon.spy();
			ddp._onUpdatedCallbacks[0] = cb;
			ddp._onUpdatedCallbacks[1] = cb;
			ddp._onUpdatedCallbacks[2] = cb;
			ddp._onUpdatedCallbacks[3] = cb;
			ddp._on_updated(obj);
			cb.callCount.should.equal(4);
			_.isUndefined(ddp._onUpdatedCallbacks[0]).should.be.true;
			_.isUndefined(ddp._onUpdatedCallbacks[1]).should.be.true;
			_.isUndefined(ddp._onUpdatedCallbacks[2]).should.be.true;
			_.isUndefined(ddp._onUpdatedCallbacks[3]).should.be.true;
		});

		it("it should not call _onUpdatedCallbacks[id] if id belongs to method but _onUpdatedCallbacks[id] is undefined", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				methods: ["0", "1", "2", "3", "4"]
			};
			(function () {
				ddp._on_updated(obj);
			}).should.not.throw();
		});

	});

});

describe("The _on_nosub private method", function () {

	describe("receives as only argument an object containing the properties id and an optional error, and", function () {

		describe("if error is defined", function () {

			describe("if an error handler exists", function () {

				it("should call the error handler with error as first argument", function () {
					var ddp = new DDP(optionsDontAutoconnect);
					var obj = {
						id: "0",
						error: {}
					};
					var cb = sinon.spy();
					ddp._onErrorCallbacks[0] = cb;
					ddp._on_nosub(obj);
					cb.calledWith(obj.error).should.be.true;
				});

			});

			describe("if an error handler doesn't exist", function () {

				it("should throw the error", function () {
					var ddp = new DDP(optionsDontAutoconnect);
					var obj = {
						id: "0",
						error: {}
					};
					var cb = sinon.spy();
					var troublemaker = function () {
						ddp._on_nosub(obj);
					};
					troublemaker.should.throw(obj.error);
				});

			});

			it("should delete all handlers for the subscription", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0",
					error: {}
				};
				ddp._onReadyCallbacks[0] = _.noop;
				ddp._onStopCallbacks[0] = _.noop;
				ddp._onErrorCallbacks[0] = _.noop;
				ddp._on_nosub(obj);
				_.isUndefined(ddp._onReadyCallbacks[0]).should.be.true;
				_.isUndefined(ddp._onStopCallbacks[0]).should.be.true;
				_.isUndefined(ddp._onErrorCallbacks[0]).should.be.true;
			});

		});

		describe("if error is not defined", function () {

			it("should call the stop handler", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0"
				};
				var cb = sinon.spy();
				ddp._onStopCallbacks[0] = cb;
				ddp._on_nosub(obj);
				cb.called.should.be.true;
			});

			it("should delete all handlers for the subscription", function () {
				var ddp = new DDP(optionsDontAutoconnect);
				var obj = {
					id: "0"
				};
				ddp._onReadyCallbacks[0] = _.noop;
				ddp._onStopCallbacks[0] = _.noop;
				ddp._onErrorCallbacks[0] = _.noop;
				ddp._on_nosub(obj);
				_.isUndefined(ddp._onReadyCallbacks[0]).should.be.true;
				_.isUndefined(ddp._onStopCallbacks[0]).should.be.true;
				_.isUndefined(ddp._onErrorCallbacks[0]).should.be.true;
			});

		});

	});

});

describe("The _on_ready private method", function () {

	describe("receives as only argument an object containing the property subs (an array of ids) and", function () {

		it("should call all of the _onReadyCallbacks[id] where id belongs to method", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				subs: ["0", "1", "2", "3"]
			};
			var cb = sinon.spy();
			ddp._onReadyCallbacks[0] = cb;
			ddp._onReadyCallbacks[1] = cb;
			ddp._onReadyCallbacks[2] = cb;
			ddp._onReadyCallbacks[3] = cb;
			ddp._on_ready(obj);
			cb.callCount.should.equal(4);
		});

		it("it should delete the _onReadyCallbacks[id]-s it calls after calling them", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				subs: ["0", "1", "2", "3"]
			};
			var cb = sinon.spy();
			ddp._onReadyCallbacks[0] = cb;
			ddp._onReadyCallbacks[1] = cb;
			ddp._onReadyCallbacks[2] = cb;
			ddp._onReadyCallbacks[3] = cb;
			ddp._on_ready(obj);
			cb.callCount.should.equal(4);
			_.isUndefined(ddp._onReadyCallbacks[0]).should.be.true;
			_.isUndefined(ddp._onReadyCallbacks[1]).should.be.true;
			_.isUndefined(ddp._onReadyCallbacks[2]).should.be.true;
			_.isUndefined(ddp._onReadyCallbacks[3]).should.be.true;
		});

		it("it should not call _onReadyCallbacks[id] if id belongs to subs but _onReadyCallbacks[id] is undefined", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				subs: ["0", "1", "2", "3", "4"]
			};
			(function () {
				ddp._on_ready(obj);
			}).should.not.throw();
		});

	});

});

describe("The _on_error private method", function () {

	it("should call the emit method, with \"error\" as the first argument and its first argument as second argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var arg = {};
		ddp._emit = sinon.spy();
		ddp._on_error(arg);
		ddp._emit.calledWith("error", arg).should.be.true;
	});

});

describe("The _on_connected private method", function () {

	describe("if this is a first connection", function () {

		it("should call the emit method, with \"connected\" as the first argument and its first argument as second argument", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var arg = {};
			ddp._emit = sinon.spy();
			ddp._on_connected(arg);
			ddp._emit.calledWith("connected", arg).should.be.true;
		});

	});

	describe("if this is a reconnection", function () {

		it("should call the emit method, with \"reconnected\" as the first argument and its first argument as second argument", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var arg = {};
			ddp._emit = sinon.spy();
			ddp._reconnect_count = 1;
			ddp._on_connected(arg);
			ddp._emit.calledWith("reconnected", arg).should.be.true;
		});

	});

	it("should reset _reconnect_count and _reconnect_incremental_timer to 0", function () {
		var ddp = new DDP(optionsDontAutoconnect);
        ddp._reconnect_count = 1;
        ddp._reconnect_incremental_timer = 1;
		ddp._on_connected();
        ddp._reconnect_count.should.equal(0);
        ddp._reconnect_incremental_timer.should.equal(0);
	});

	it("should set the readyState to 1", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._on_connected();
		ddp.readyState.should.equal(1);
	});

	it("should send (calling the \"_send\" method) all queued messages in order", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._queue = [0, 1, 2, 3];
		var length = ddp._queue.length;
		ddp._send = sinon.spy();
		ddp._on_connected();
		ddp._send.callCount.should.equal(length);
		for (var i=0; i<length; i++) {
			ddp._send.getCall(i).args[0].should.equal(i);
		}
	});

	it("should empty the queue", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._queue = [0, 1, 2, 3];
		ddp._send = _.noop;
		ddp._on_connected();
		ddp._queue.length.should.equal(0);
	});

});

describe("The _on_failed private method", function () {

	it("should call the emit method, with \"failed\" as the first argument and its first argument as second argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var arg = {};
		ddp._emit = sinon.spy();
		ddp._on_failed(arg);
		ddp._emit.calledWith("failed", arg).should.be.true;
	});

	it("should set the readyState to 4", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._on_failed();
		ddp.readyState.should.equal(4);
	});

});

describe("The _on_added private method", function () {

	it("should call the emit method, with \"added\" as the first argument and its first argument as second argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var arg = {};
		ddp._emit = sinon.spy();
		ddp._on_added(arg);
		ddp._emit.calledWith("added", arg).should.be.true;
	});

});

describe("The _on_removed private method", function () {

	it("should call the emit method, with \"removed\" as the first argument and its first argument as second argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var arg = {};
		ddp._emit = sinon.spy();
		ddp._on_removed(arg);
		ddp._emit.calledWith("removed", arg).should.be.true;
	});

});

describe("The _on_changed private method", function () {

	it("should call the emit method, with \"changed\" as the first argument and its first argument as second argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var arg = {};
		ddp._emit = sinon.spy();
		ddp._on_changed(arg);
		ddp._emit.calledWith("changed", arg).should.be.true;
	});

});

describe("The _on_socket_close private method", function () {

	it("should call the emit method, with \"socket_close\" as first argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._emit = sinon.spy();
		ddp._try_reconnect = _.noop;
		ddp._on_socket_close();
		ddp._emit.calledWith("socket_close").should.be.true;
	});

	it("should set the readyState to 4", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._on_socket_close();
		ddp.readyState.should.equal(4);
	});

	it("should call the _try_reconnect method if _autoreconnect is truthy", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._emit = _.noop;
		ddp._try_reconnect = sinon.spy();
		ddp._on_socket_close();
		ddp._try_reconnect.called.should.be.true;
	});

	it("should not call the _try_reconnect method if _autoreconnect is falsy", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._autoreconnect = false;
		ddp._emit = _.noop;
		ddp._try_reconnect = sinon.spy();
		ddp._on_socket_close();
		ddp._try_reconnect.called.should.be.false;
	});

});

describe("The _on_socket_error private method", function () {

	it("should call the emit method, with \"socket_error\" as first argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._emit = sinon.spy();
		ddp._try_reconnect = _.noop;
		ddp._on_socket_error();
		ddp._emit.calledWith("socket_error").should.be.true;
	});

	it("should set the readyState to 4", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._on_socket_error();
		ddp.readyState.should.equal(4);
	});

});

describe("The _on_socket_open private method", function () {

	it("should call the _send method with a DDP connect message object as first argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var obj = {
            msg: "connect",
            version: "pre2",
            support: ["pre2"]
		};
		ddp._send = sinon.spy();
		ddp._on_socket_open();
		ddp._send.calledWith(obj).should.be.true;
	});

});

describe("The _on_socket_message private method", function () {

	describe("gets called with an object having a data property (a string) as first argument and", function () {

		it("should do nothing if data === {\"server_id\":\"0\"}", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var INIT_DDP_MESSAGE = "{\"server_id\":\"0\"}";
			var obj = {
				data: INIT_DDP_MESSAGE
			};
			sinon.spy(JSON, "parse");
			ddp._on_socket_message(obj);
			JSON.parse.callCount.should.equal(0);
			JSON.parse.restore();
		});

		it("if EJSON is available, should try to parse data with EJSON.parse", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				data: ""
			};
			GLB.EJSON = {
				parse: sinon.spy()
			};
			sinon.stub(console, "warn");
			ddp._on_socket_message(obj);
			EJSON.parse.calledWith(obj.data).should.be.true;
			delete GLB.EJSON;
			console.warn.restore();
		});

		it("if EJSON is not available, should try to parse data with JSON.parse", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				data: "{}"
			};
			sinon.spy(JSON, "parse");
			sinon.stub(console, "warn");
			ddp._on_socket_message(obj);
			JSON.parse.calledWith(obj.data).should.be.true;
			JSON.parse.restore();
			console.warn.restore();
		});

		it("if EJSON is available, should console.warn the user if data does not parse with EJSON", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				data: "{ ] not_JSON"
			};
			GLB.EJSON = {
				parse: function () {
					throw new Error();
				}
			};
			sinon.stub(console, "warn");
			ddp._on_socket_message(obj);
			console.warn.callCount.should.equal(2);
			console.warn.restore();
			delete GLB.EJSON;
		});

		it("if EJSON is not available, should console.warn the user if data does not parse with JSON", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				data: "{ ] not_JSON"
			};
			sinon.stub(console, "warn");
			ddp._on_socket_message(obj);
			console.warn.callCount.should.equal(2);
			console.warn.restore();
		});

		it("should console.warn the user if data.msg is not a DDP server message", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				data: JSON.stringify({
					msg: "socket_open"
				})
			};
			sinon.stub(console, "warn");
			ddp._on_socket_message(obj);
			console.warn.callCount.should.equal(2);
			console.warn.restore();
		});

		it("should call the DDP[\"_on_\" + data.msg] method, passing the parsed data as first argument", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var data = {
				msg: "added"
			};
			var obj = {
				data: JSON.stringify(data)
			};
			ddp._on_added = sinon.spy();
			ddp._on_socket_message(obj);
			ddp._on_added.calledWith(data).should.be.true;
		});

	});

});
