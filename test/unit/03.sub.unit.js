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

	it("should register its thrid argument as handler for the \"ready\" and \"nosub\" events", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var handler = function () {};
		ddp.on("connected", function () {
			ddp.sub("method", [""], handler);
			_.contains(ddp._onReadyCallbacks, handler).should.be.true;
			done();
		});
	});

});
