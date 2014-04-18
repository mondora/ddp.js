describe("The _on_socket_close private method", function () {

	it("should call the emit method, with \"socket_close\" as first argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._emit = sinon.spy();
		ddp._try_reconnect = _.noop;
		ddp._on_socket_close();
		ddp._emit.calledWith("socket_close").should.be.true;
	});

	it("should set the readyState to 4", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._on_socket_close();
		ddp.readyState.should.equal(4);
	});

	it("should call the _try_reconnect method if _autoreconnect is truthy", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._emit = _.noop;
		ddp._try_reconnect = sinon.spy();
		ddp._on_socket_close();
		ddp._try_reconnect.called.should.be.true;
	});

	it("should not call the _try_reconnect method if _autoreconnect is falsy", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._autoreconnect = false;
		ddp._emit = _.noop;
		ddp._try_reconnect = sinon.spy();
		ddp._on_socket_close();
		ddp._try_reconnect.called.should.be.false;
	});

});
