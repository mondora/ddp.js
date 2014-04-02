describe("The _try_reconnect private method", function () {

	it("should increase _reconnect_counter by 1 each time it's called", function () {
		var ddp = new DDP("", SockJS);
		ddp.connect = _.noop;
		var currentCount = ddp._reconnect_count;
		ddp._try_reconnect();
		ddp._reconnect_count.should.equal(currentCount + 1);
	});

	it("should increase _reconnect_incremental_timer by 500 each time it's called", function () {
		var ddp = new DDP("", SockJS);
		ddp.connect = _.noop;
		var currentTimer = ddp._reconnect_incremental_timer;
		ddp._try_reconnect();
		ddp._reconnect_incremental_timer.should.equal(currentTimer + 500);
	});

});
