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
