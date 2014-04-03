describe("The _on_added private method", function () {

	it("should call the emit method, with \"added\" as the first argument and its first argument as second argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var arg = {};
		ddp._emit = sinon.spy();
		ddp._on_added(arg);
		ddp._emit.calledWith("added", arg).should.be.true;
	});

});
