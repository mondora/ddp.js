require("should");
var sinon        = require("sinon");
var EventEmitter = require("wolfy87-eventemitter");

var DDP = require("../src/ddp.js");

describe("The DDP module", function () {
    it("should export a constructor", function () {
        DDP.should.be.of.type("function");
        DDP.prototype.constructor.should.equal(DDP);
    });
});

describe("The DDP constructor", function () {
    beforeEach(function () {
        sinon.stub(DDP.prototype, "_init");
    });
    afterEach(function () {
        DDP.prototype._init.restore();
    });
    it("should inherit from EventEmitter", function () {
        var ddp = new DDP({});
        ddp.should.be.instanceOf(EventEmitter);
    });
    it("should save the endpoint and SocketConstructor passed to it as properties of the instance", function () {
        var options = {
            endpoint: "endpoint",
            SocketConstructor: function () {
                // Noop
            }
        };
        var ddp = new DDP(options);
        ddp._endpoint.should.equal(options.endpoint);
        ddp._SocketConstructor.should.equal(options.SocketConstructor);
    });
    it("should call the _init method", function () {
        var ddp = new DDP({});
        ddp._init.called.should.equal(true);
    });
});

describe("The connect method", function () {
    it("should _socket.send a connect message", function () {
        var ctx = {
            _socket: {
                send: sinon.spy()
            }
        };
        var c = require("../src/lib/constants.js");
        DDP.prototype.connect.call(ctx);
        ctx._socket.send.firstCall.args[0].should.eql({
            msg: "connect",
            version: c.DDP_VERSION,
            support: [c.DDP_VERSION]
        });
    });
});

describe("The method method", function () {
    it("should _socket.send a method message", function () {
        var ctx = {
            _socket: {
                send: sinon.spy()
            }
        };
        DDP.prototype.method.call(ctx, "methodName", ["list", "of", "params"]);
        var arg = ctx._socket.send.firstCall.args[0];
        arg.should.eql({
            msg: "method",
            id: arg.id,
            method: "methodName",
            params: ["list", "of", "params"]
        });
    });
    it("should return the id of the method call", function () {
        var ctx = {
            _socket: {
                send: sinon.spy()
            }
        };
        var ret = DDP.prototype.method.call(ctx, "methodName", []);
        ret.should.equal(ctx._socket.send.firstCall.args[0].id);
    });
});

describe("The ping method", function () {
    it("should _socket.send a ping message", function () {
        var ctx = {
            _socket: {
                send: sinon.spy()
            }
        };
        DDP.prototype.ping.call(ctx);
        var arg = ctx._socket.send.firstCall.args[0];
        arg.should.eql({
            msg: "ping",
            id: arg.id
        });
    });
    it("should return the id of the ping call", function () {
        var ctx = {
            _socket: {
                send: sinon.spy()
            }
        };
        var ret = DDP.prototype.ping.call(ctx);
        ret.should.equal(ctx._socket.send.firstCall.args[0].id);
    });
});

describe("The pong method", function () {
    it("should _socket.send a pong message", function () {
        var ctx = {
            _socket: {
                send: sinon.spy()
            }
        };
        DDP.prototype.pong.call(ctx, "0");
        ctx._socket.send.firstCall.args[0].should.eql({
            msg: "pong",
            id: "0"
        });
    });
    it("should return the id of the pong call", function () {
        var ctx = {
            _socket: {
                send: sinon.spy()
            }
        };
        var ret = DDP.prototype.pong.call(ctx, "0");
        ret.should.equal("0");
    });
});

describe("The sub method", function () {
    it("should _socket.send a sub message", function () {
        var ctx = {
            _socket: {
                send: sinon.spy()
            }
        };
        DDP.prototype.sub.call(ctx, "subName", ["list", "of", "params"]);
        var arg = ctx._socket.send.firstCall.args[0];
        arg.should.eql({
            msg: "sub",
            id: arg.id,
            name: "subName",
            params: ["list", "of", "params"]
        });
    });
    it("should return the id of the sub call", function () {
        var ctx = {
            _socket: {
                send: sinon.spy()
            }
        };
        var ret = DDP.prototype.sub.call(ctx, "subName", []);
        ret.should.equal(ctx._socket.send.firstCall.args[0].id);
    });
});

describe("The unsub method", function () {
    it("should _socket.send a unsub message", function () {
        var ctx = {
            _socket: {
                send: sinon.spy()
            }
        };
        DDP.prototype.unsub.call(ctx, "0");
        ctx._socket.send.firstCall.args[0].should.eql({
            msg: "unsub",
            id: "0"
        });
    });
    it("should return the id of the unsub call", function () {
        var ctx = {
            _socket: {
                send: sinon.spy()
            }
        };
        var ret = DDP.prototype.unsub.call(ctx, "0");
        ret.should.equal("0");
    });
});
