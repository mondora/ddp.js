describe("The _on_error private method", function () {

	it("should call the emit method, with \"error\" as the first argument and its first argument as second argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var arg = {};
		ddp._emit = sinon.spy();
		ddp._on_error(arg);
		ddp._emit.calledWith("error", arg).should.be.true;
	});

});
