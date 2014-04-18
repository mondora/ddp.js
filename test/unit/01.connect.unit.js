describe("The connect method", function () {

	it("should instanciate a new _SocketConstructor instance, calling _SocketConstructor with this._endpoint as sole argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		sinon.spy(ddp, "_SocketConstructor");
		ddp.connect();
		ddp._SocketConstructor.calledWith(ddp._endpoint).should.be.true;
		ddp._SocketConstructor.restore();
	});

	it("should set the readyState to 0", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		ddp.connect();
		ddp.readyState.should.equal(0);
	});

	it("should instanciate a new _SocketConstructor instance and sotre a reference to it in the _socket property", function () {
		var ddp = new DDP(optionsAutoconnect);
		(ddp._socket instanceof ddp._SocketConstructor).should.be.true;
	});

	it("should register _on_socket_open as handler for the _socket \"open\" event", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		sinon.spy(ddp, "_on_socket_open");
		ddp.connect();
		ddp._on_socket_open();
		ddp._on_socket_open.calledOn(ddp).should.be.true;
		ddp._on_socket_open.restore();
	});

	it("should register _on_socket_close as handler for the _socket \"close\" event", function () {
		var ddp = new DDP(optionsAutoconnect);
		sinon.spy(ddp, "_on_socket_close");
		ddp.connect();
		ddp._on_socket_close();
		ddp._on_socket_close.calledOn(ddp).should.be.true;
		ddp._on_socket_close.restore();
	});

	it("should register _on_socket_error as handler for the _socket \"error\" event", function () {
		var ddp = new DDP(optionsAutoconnect);
		sinon.spy(ddp, "_on_socket_error");
		ddp.connect();
		ddp._on_socket_error();
		ddp._on_socket_error.calledOn(ddp).should.be.true;
		ddp._on_socket_error.restore();
	});

	it("should register _on_socket_message as handler for the _socket \"message\" event", function () {
		var tmp = DDP.prototype._on_socket_message;
		DDP.prototype._on_socket_message = sinon.spy();
		var ddp = new DDP(optionsAutoconnect);
		ddp._on_socket_message();
		ddp._on_socket_message.calledOn(ddp).should.be.true;
		DDP.prototype._on_socket_message = tmp;
	});

});
