describe("The _send private method", function () {

	it("should stringify the first argument passed to it with EJSON if available", function () {
		var ddp = new DDP(optionsAutoconnect);
		ddp._socket.send = _.noop;
		var obj = {};
		GLB.EJSON = {
			stringify: sinon.spy()
		};
		ddp._send(obj);
		EJSON.stringify.calledWith(obj).should.be.true;
		delete GLB.EJSON;
	});

	it("should stringify the first argument passed to it with JSON if EJSON is not available", function () {
		var ddp = new DDP(optionsAutoconnect);
		ddp._socket.send = _.noop;
		var obj = {};
		var tmp = JSON.stringify;
		JSON.stringify = sinon.spy();
		ddp._send(obj);
		JSON.stringify.calledWith(obj).should.be.true;
		JSON.stringify = tmp;
	});

	it("should call the _socket.send method with the stringified object as first argument", function () {
		var ddp = new DDP(optionsAutoconnect);
		ddp._socket.send = sinon.spy();
		var obj = {};
		ddp._send(obj);
		ddp._socket.send.calledWith("{}").should.be.true;
	});

});
