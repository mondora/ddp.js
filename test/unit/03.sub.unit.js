describe("The sub method", function () {

	it("should send a \"sub\" DDP message to the server", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var ddpSub = {
			msg: "sub",
			name: "sub",
			params: ["params"]
		};
		ddp.on("connected", function () {
			ddp._send = sinon.spy();
			ddp.sub(ddpSub.name, ddpSub.params);
			_.omit(ddp._send.args[0][0], "id").should.eql(ddpSub);
			done();
		});
	});

	it("should register its thrid argument as handler for the \"ready\" event", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var onReady = function () {};
		ddp.on("connected", function () {
			ddp.sub("method", [""], onReady);
			_.contains(ddp._onReadyCallbacks, onReady).should.be.true;
			done();
		});
	});

	it("should register its fourth and fifth arguments as handlers for the \"nosub\" event", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var onStop = function () {};
		var onError = function () {};
		ddp.on("connected", function () {
			ddp.sub("method", [""], null, onStop, onError);
			_.contains(ddp._onStopCallbacks, onStop).should.be.true;
			_.contains(ddp._onErrorCallbacks, onError).should.be.true;
			done();
		});
	});

	it("should return the id of the subscription", function (done) {
		var ddp = new DDP(optionsAutoconnect);
		var onReady = function () {};
		ddp.on("connected", function () {
			var id = ddp.sub("method", [""], onReady);
			ddp._onReadyCallbacks[id].should.equal(onReady);
			done();
		});
	});

});
