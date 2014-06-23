describe("The _on_socket_open private method", function () {

	it("should call the _send method with a DDP connect message object as first argument", function () {
		var ddp = new DDP(optionsDontAutoconnect);
		var obj = {
            msg: "connect",
            version: "pre2",
            support: ["pre2"]
		};
		ddp._send = sinon.spy();
		ddp._on_socket_open();
		ddp._send.calledWith(obj).should.be.true;
	});

});
