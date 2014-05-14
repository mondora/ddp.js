describe("The _on_socket_error private method", function () {

	it("should call the emit method, with \"socket_error\" as first argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._emit = sinon.spy();
		ddp._try_reconnect = _.noop;
		ddp._on_socket_error();
		ddp._emit.calledWith("socket_error").should.be.true;
	});

	it("should set the readyState to 4", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp._on_socket_error();
		ddp.readyState.should.equal(4);
	});

});
