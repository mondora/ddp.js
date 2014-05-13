describe("The _on_connected private method", function () {

	describe("if this is a first connection", function () {

		it("should call the emit method, with \"connected\" as the first argument and its first argument as second argument", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var arg = {};
			ddp._emit = sinon.spy();
			ddp._on_connected(arg);
			ddp._emit.calledWith("connected", arg).should.be.true;
		});

	});

	describe("if this is a reconnection", function () {

		it("should call the emit method, with \"reconnected\" as the first argument and its first argument as second argument", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var arg = {};
			ddp._emit = sinon.spy();
			ddp._reconnect_count = 1;
			ddp._on_connected(arg);
			ddp._emit.calledWith("reconnected", arg).should.be.true;
		});

	});

	it("should reset _reconnect_count and _reconnect_incremental_timer to 0", function () {
		var ddp = new DDP(optionsDontAutoconnect);
        ddp._reconnect_count = 1;
        ddp._reconnect_incremental_timer = 1;
		ddp._on_connected();
        ddp._reconnect_count.should.equal(0);
        ddp._reconnect_incremental_timer.should.equal(0);
	});

	it("should set the readyState to 1", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._on_connected();
		ddp.readyState.should.equal(1);
	});

	it("should send (calling the \"_send\" method) all queued messages in order", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._queue = [0, 1, 2, 3];
		var length = ddp._queue.length;
		ddp._send = sinon.spy();
		ddp._on_connected();
		ddp._send.callCount.should.equal(length);
		for (var i=0; i<length; i++) {
			ddp._send.getCall(i).args[0].should.equal(i);
		}
	});

	it("should empty the queue", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._queue = [0, 1, 2, 3];
		ddp._send = _.noop;
		ddp._on_connected();
		ddp._queue.length.should.equal(0);
	});

});
