describe("The library ddp.js", function () {
	it("should export a DDP object which should be a constructor", function () {
		_.isFunction(window.DDP).should.be.true;
		(DDP.prototype.constructor).should.equal(DDP);
	});
});

describe("Instantiating a DDP instance", function () {
	it("should throw an error a string is not provided as first parameter to the constructor", function () {
		(function () {
			new DDP();
		}).should.throw("First argument must be a string.");
	});
	describe("should return an object with the following public methods:", function () {
		var ddp = new DDP("");
		it("connect", function () {
			_.isFunction(ddp.connect).should.be.true;
		});
		it("disconnect", function () {
			_.isFunction(ddp.disconnect).should.be.true;
		});
		it("getStatus", function () {
			_.isFunction(ddp.getStatus).should.be.true;
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
		it("once", function () {
			_.isFunction(ddp.once).should.be.true;
		});
		it("off", function () {
			_.isFunction(ddp.off).should.be.true;
		});
		it("getListeners", function () {
			_.isFunction(ddp.getListeners).should.be.true;
		});
	});
});

describe("The connect method", function () {
	it("should send a \"connect\" DDP message to the server", function (done) {
		var ddp = new DDP("");
		var ddpConnect = JSON.stringify({
			msg: "connect",
			version: "pre1",
			support: ["pre1"]
		});
		ddp.connect(function (arg) {
			ddp._socket.lastSentMessage.should.equal(ddpConnect);
			done();
		});
	});
	it("should register its first argument as a handler for the \"connected\" event which should be called with the \"session\" property of the \"connected\" DDP message as its first argument", function (done) {
		var ddp = new DDP("");
		ddp.connect(function (arg) {
			arg.should.equal("sessionId");
			done();
		});
	});
	it("should register its second argument as a handler for the \"failed\" event which should be called with the \"version\" property of the \"failed\" DDP message as its first argument", function (done) {
		var ddp = new DDP("");
		var ddpFailed = JSON.stringify({
			msg: "failed",
			version: "pre1"
		});
		var onConnected = function () {
			ddp._status = "connecting";
			ddp._socket._emit("message", ddpFailed);
		};
		var onFailed = function (arg) {
			arg.should.equal("pre1");
			done();
		};
		ddp.connect(onConnected, onFailed);
	});
	it("should throw an error if a connection has already been established", function () {
		(function () {
			var ddp = new DDP("");
			ddp.connect();
			ddp.connect();
		}).should.throw("This DDP connection has already been opened.");
	});
});

describe("The disconnect method", function () {
	it("should register its first argument as a handler for the \"disconnected\" event which should be called when the underlying socket is closed", function (done) {
		var ddp = new DDP("");
		ddp.connect(function () {
			ddp.disconnect(function () {
				done();
			});
		});
	});
	it("should throw an error if the connection is not open", function (done) {
		var ddp = new DDP("");
		ddp.connect(function () {
			ddp.disconnect(function () {
				(function () {
					ddp.disconnect();
				}).should.throw("This DDP connection is not open.");
				done();
			});
		});
	});
});

describe("The method method", function () {
	it("should send a \"method\" DDP message to the server", function (done) {
		var ddp = new DDP("");
		var ddpMethod = {
			msg: "method",
			method: "methodName",
			params: ["params"]
		};
		var onConnect = function () {
			ddp.method(ddpMethod.method, ddpMethod.params);
			var sent = JSON.parse(ddp._socket.lastSentMessage);
			ddpMethod.id = sent.id;
			ddpMethod.should.eql(sent);
			done();
		};
		ddp.connect(onConnect);
	});
	it("should register its thrid argument as handler for the \"result\" event which should be called with the \"error\" and \"result\" properties of the \"result\" DDP message as arguments", function (done) {
		var ddp = new DDP("");
		var ddpMethod = {
			msg: "method",
			method: "methodName",
			params: ["params"]
		};
		var ddpResult = {
			msg: "result",
			error: "firstArgument",
			result: "secondArgument"
		};
		var onResult = function (err, res) {
			err.should.equal("firstArgument");
			res.should.equal("secondArgument");
			done();
		};
		var onConnect = function () {
			ddp._socket.send = function (message) {
				message = JSON.parse(message);
				ddpResult.id = message.id;
				var msg = JSON.stringify(ddpResult);
				ddp._socket._emit("message", msg);
			};
			ddp.method(ddpMethod.method, ddpMethod.params, onResult);
		};
		ddp.connect(onConnect);
	});
	it("should throw an error if the \"result\" DDP message has an error and a thrid argument is not provided", function (done) {
		var ddp = new DDP("");
		var ddpMethod = {
			msg: "method",
			method: "methodName",
			params: ["params"]
		};
		var ddpResult = {
			msg: "result",
			error: "firstArgument",
			result: "secondArgument"
		};
		var onConnect = function () {
			ddp._socket.send = function (message) {
				message = JSON.parse(message);
				ddpResult.id = message.id;
				var msg = JSON.stringify(ddpResult);
				ddp._socket._emit("message", msg);
			};
			(function () {
				ddp.method(ddpMethod.method, ddpMethod.params);
			}).should.throw("DDP Method Error");
			done();
		};
		ddp.connect(onConnect);
	});
	it("should register its fourth argument as handler for the \"updated\" event regarding the called method", function (done) {
		var ddp = new DDP("");
		var ddpMethod = {
			msg: "method",
			method: "methodName",
			params: ["params"]
		};
		var ddpUpdated = {
			msg: "updated"
		};
		var onUpdated = function () {
			done();
		};
		var onConnect = function () {
			ddp._socket.send = function (message) {
				message = JSON.parse(message);
				ddpUpdated.methods = [message.id];
				var msg = JSON.stringify(ddpUpdated);
				ddp._socket._emit("message", msg);
			};
			ddp.method(ddpMethod.method, ddpMethod.params, null, onUpdated);
		};
		ddp.connect(onConnect);
	});
});
