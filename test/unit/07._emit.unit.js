describe("The _emit private method", function () {

	it("should call all registered handlers on the event provided as first argument", function () {
		var ddp = new DDP(optionsAutoconnect);
		var event = {
			name: "name",
			handler: sinon.spy()
		};
		ddp.on(event.name, event.handler);
		_.contains(ddp._events[event.name], event.handler).should.be.true;
		ddp._emit(event.name);
		event.handler.called.should.be.true;
	});

	it("should proxy all arguments except the first to the handler", function () {
		var ddp = new DDP(optionsAutoconnect);
		var event = {
			name: "name",
			handler: sinon.spy()
		};
		var aa1 = {};
		var aa2 = {};
		var aa3 = {};
		var aa4 = {};
		ddp.on(event.name, event.handler, aa1, aa2, aa3, aa4);
		_.contains(ddp._events[event.name], event.handler).should.be.true;
		ddp._emit(event.name);
		_.contains(event.handler.args[0], aa1);
		_.contains(event.handler.args[0], aa2);
		_.contains(event.handler.args[0], aa3);
		_.contains(event.handler.args[0], aa4);
	});

});
