describe("The disconnect method", function () {
	it("should register its first argument as a handler for the \"disconnected\" event which should be called when the underlying socket is closed", function (done) {
		var ddp = new DDP("");
		ddp.connect(function () {
			ddp.disconnect(function () {
				done();
			});
		});
	});
	it("should throw an error if the connection is not open", function (done) {
		var ddp = new DDP("");
		ddp.connect(function () {
			ddp.disconnect(function () {
				(function () {
					ddp.disconnect();
				}).should.throw("This DDP connection is not open.");
				done();
			});
		});
	});
});
