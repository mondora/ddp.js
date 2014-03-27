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
