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
	it("should register its first argument as a handler of the \"connected\" event which should be called with the \"session\" property of the \"connected\" DDP message as its first argument", function (done) {
		var ddp = new DDP("");
		ddp.connect(function (arg) {
			arg.should.equal("sessionId");
			done();
		});
	});
	it("should register its second argument as a handler of the \"failed\" event which should be called with the \"version\" property of the \"failed\" DDP message as its first argument", function (done) {
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
