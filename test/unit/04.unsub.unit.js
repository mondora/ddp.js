describe("The unsub method", function () {

	it("should send an \"unsub\" DDP message to the server", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var ddpUnsub = {
			msg: "unsub",
			id: "fake_sub_id"
		};
		ddp.on("connected", function () {
			ddp._send = sinon.spy();
			ddp.unsub(ddpUnsub.id);
			ddp._send.args[0][0].should.eql(ddpUnsub);
			done();
		});
	});

});
