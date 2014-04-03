describe("The _on_removed private method", function () {

	it("should call the emit method, with \"removed\" as the first argument and its first argument as second argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var arg = {};
		ddp._emit = sinon.spy();
		ddp._on_removed(arg);
		ddp._emit.calledWith("removed", arg).should.be.true;
	});

});
