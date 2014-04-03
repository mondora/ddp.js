describe("The _on_connected private method", function () {

	it("should call the emit method, with \"connected\" as the first argument and its first argument as second argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var arg = {};
		ddp._emit = sinon.spy();
		ddp._on_connected(arg);
		ddp._emit.calledWith("connected", arg).should.be.true;
	});

	it("should reset _reconnect_count and _reconnect_incremental_timer to 0", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var arg = {};
        ddp._reconnect_count = 1;
        ddp._reconnect_incremental_timer = 1;
		ddp._on_connected(arg);
        ddp._reconnect_count.should.equal(0);
        ddp._reconnect_incremental_timer.should.equal(0);
	});

});
