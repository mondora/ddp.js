if (typeof window === "undefined") {
	ENV = "node";
	GLB = global;
	GLB._ = require("lodash");
	GLB.sinon = require("sinon");
	GLB.should = require("should");
	GLB.SockJS = require("./mocks/sockjs.js");
	GLB.DDP = require("../src/ddp.js");
} else {
	ENV = "browser";
	GLB = window;
}

describe("The library ddp.js", function () {

	if (ENV === "node") {
		it("should export a DDP object which should be a constructor", function () {
			_.isFunction(DDP).should.be.true;
			(DDP.prototype.constructor).should.equal(DDP);
		});
	}

	if (ENV === "browser") {
		it("should export a DDP object which should be a constructor", function () {
			_.isFunction(window.DDP).should.be.true;
			(DDP.prototype.constructor).should.equal(DDP);
		});
	}

});

/*
describe("The shimUnderscore private function", function () {

	it("should return an object with forEach and bind methods", function () {
		// Test it with rewire
	});

});
*/

var optionsAutoconnect = {
	endpoint: "",
	SocketConstructor: SockJS
};

var optionsDontAutoconnect = {
	endpoint: "",
	SocketConstructor: SockJS,
	do_not_autoconnect: true
};

describe("Instantiating a DDP instance", function () {

	describe("should return an object with the following public methods:", function () {
		var ddp = new DDP(optionsAutoconnect);

		it("connect", function () {
			_.isFunction(ddp.connect).should.be.true;
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

		it("off", function () {
			_.isFunction(ddp.off).should.be.true;
		});

	});

	it("should call the \"connect\" method if the third argument passed to the constructor is falsy", function () {
		sinon.spy(DDP.prototype, "connect");
		var ddp = new DDP(optionsAutoconnect);
		ddp.connect.called.should.be.true;
		DDP.prototype.connect.restore();
	});

	it("should not call the \"connect\" method if the third argument passed to the constructor is truthy", function () {
		sinon.spy(DDP.prototype, "connect");
		var ddp = new DDP(optionsDontAutoconnect);
		ddp.connect.called.should.be.false;
		DDP.prototype.connect.restore();
	});

});
