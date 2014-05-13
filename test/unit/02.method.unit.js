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
