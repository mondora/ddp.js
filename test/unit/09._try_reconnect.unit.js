describe("The _try_reconnect private method", function () {

	it("should increase _reconnect_counter by 1 each time it's called, for the first ten times", function () {
		var ddp = new DDP(optionsAutoconnect);
		ddp.connect = _.noop;
		var currentCount = ddp._reconnect_count;
		ddp._try_reconnect();
		ddp._reconnect_count.should.equal(currentCount + 1);
	});

	it("and after time 10, it should not", function () {
		var ddp = new DDP(optionsAutoconnect);
		ddp.connect = _.noop;
		var currentCount = ddp._reconnect_count;
		for (var i=0; i<100; i++) {
			ddp._try_reconnect();
		}
		ddp._reconnect_count.should.equal(10);
	});

	it("should increase _reconnect_incremental_timer by 300 each time it's called, for the first ten times", function () {
		var ddp = new DDP(optionsAutoconnect);
		ddp.connect = _.noop;
		var currentTimer = ddp._reconnect_incremental_timer;
		ddp._try_reconnect();
		ddp._reconnect_incremental_timer.should.equal(currentTimer + 300);
	});

	it("and after time 10, it should plateau at 16500", function () {
		var ddp = new DDP(optionsAutoconnect);
		ddp.connect = _.noop;
		var currentTimer = ddp._reconnect_incremental_timer;
		for (var i=0; i<100; i++) {
			ddp._try_reconnect();
		}
		ddp._reconnect_incremental_timer.should.equal(16500);
	});

});
