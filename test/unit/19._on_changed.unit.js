describe("The _on_changed private method", function () {

	it("should call the emit method, with \"changed\" as the first argument and its first argument as second argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var arg = {};
		ddp._emit = sinon.spy();
		ddp._on_changed(arg);
		ddp._emit.calledWith("changed", arg).should.be.true;
	});

});
