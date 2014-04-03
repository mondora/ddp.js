describe("The off method", function () {

	it("should de-register the function provided as second argument as a handler for the event provided as first argument", function () {
		var ddp = new DDP(optionsAutoconnect);
		var event = {
			name: "name",
			handler: function () {}
		};
		ddp.on(event.name, event.handler);
		_.contains(ddp._events[event.name], event.handler).should.be.true;
		ddp.off(event.name, event.handler);
		_.contains(ddp._events[event.name], event.handler).should.be.false;
	});

});
