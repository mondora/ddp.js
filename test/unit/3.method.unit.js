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
