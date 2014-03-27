describe("The library ddp.js", function () {
	it("should export a DDP object which should be a constructor", function () {
		_.isFunction(window.DDP).should.be.true;
		(DDP.prototype.constructor).should.equal(DDP);
	});
});

describe("Instantiating a DDP instance", function () {
	it("should throw an error a string is not provided as first parameter to the constructor", function () {
		(function () {
			new DDP();
		}).should.throw("First argument must be a string.");
	});
	describe("should return an object with the following public methods:", function () {
		var ddp = new DDP("");
		it("connect", function () {
			_.isFunction(ddp.connect).should.be.true;
		});
		it("disconnect", function () {
			_.isFunction(ddp.disconnect).should.be.true;
		});
		it("getStatus", function () {
			_.isFunction(ddp.getStatus).should.be.true;
		});
		it("method", function () {
			_.isFunction(ddp.method).should.be.true;
		});
		it("sub", function () {
			_.isFunction(ddp.sub).should.be.true;
		});
		it("unsub", function () {
			_.isFunction(ddp.unsub).should.be.true;
		});
		it("on", function () {
			_.isFunction(ddp.on).should.be.true;
		});
		it("once", function () {
			_.isFunction(ddp.once).should.be.true;
		});
		it("off", function () {
			_.isFunction(ddp.off).should.be.true;
		});
		it("getListeners", function () {
			_.isFunction(ddp.getListeners).should.be.true;
		});
	});
});
