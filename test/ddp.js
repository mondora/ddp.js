"use strict";

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
    it("should create an instane with a property _socket which is an EventEmitter", function () {
        var ddp = new DDP({});
        ddp._socket.should.be.instanceOf(EventEmitter);
    });
    it("should call the _init method", function () {
        var ddp = new DDP({});
        ddp._init.called.should.equal(true);
    });
});

describe("The _initSteps property", function () {
    it("should be an array of functions", function () {
        DDP.prototype._initSteps.forEach(function (fn) {
            fn.should.be.of.type("function");
        });
    });
});

describe("The _init method", function () {
    it("should call each of the _initSteps functions with the context of the instance", function () {
        var ctx = {
            _initSteps: [sinon.spy()]
        };
        DDP.prototype._init.call(ctx);
        ctx._initSteps[0].firstCall.thisValue.should.equal(ctx);
    });
});

describe("The _send method", function () {
    it("should stringify the passed object and pass it to the _rawSocket.send function", function () {
        var ctx = {
            _rawSocket: {
                send: sinon.spy()
            },
            _socket: {
                emit: sinon.spy()
            }
        };
        var obj = {
           key: "value"
        };
        DDP.prototype._send.call(ctx, obj);
        ctx._rawSocket.send.firstCall.args[0].should.equal(JSON.stringify(obj));
    });
    it("should trigger a message:out event to the _socket property", function () {
        var ctx = {
            _rawSocket: {
                send: sinon.spy()
            },
            _socket: {
                emit: sinon.spy()
            }
        };
        var obj = {
            key: "value"
        };
        DDP.prototype._send.call(ctx, obj);
        ctx._socket.emit.firstCall.args[0].should.equal("message:out");
        ctx._socket.emit.firstCall.args[1].should.not.equal(obj);
        ctx._socket.emit.firstCall.args[1].should.eql(obj);
    });
});

describe("The connect method", function () {
    it("should _send a connect message", function () {
        var ctx = {
            _send: sinon.spy()
        };
        var c = require("../src/lib/constants.js");
        DDP.prototype.connect.call(ctx);
        ctx._send.firstCall.args[0].should.eql({
            msg: "connect",
            version: c.DDP_VERSION,
            support: [c.DDP_VERSION]
        });
    });
});

describe("The method method", function () {
    it("should _send a method message", function () {
        var ctx = {
            _send: sinon.spy()
        };
        DDP.prototype.method.call(ctx, "methodName", ["list", "of", "params"]);
        var arg = ctx._send.firstCall.args[0];
        arg.should.eql({
            msg: "method",
            id: arg.id,
            method: "methodName",
            params: ["list", "of", "params"]
        });
    });
    it("should return the id of the method call", function () {
        var ctx = {
            _send: sinon.spy()
        };
        var ret = DDP.prototype.method.call(ctx, "methodName", []);
        ret.should.equal(ctx._send.firstCall.args[0].id);
    });
});

describe("The ping method", function () {
    it("should _send a ping message", function () {
        var ctx = {
            _send: sinon.spy()
        };
        DDP.prototype.ping.call(ctx);
        var arg = ctx._send.firstCall.args[0];
        arg.should.eql({
            msg: "ping",
            id: arg.id
        });
    });
    it("should return the id of the ping call", function () {
        var ctx = {
            _send: sinon.spy()
        };
        var ret = DDP.prototype.ping.call(ctx);
        ret.should.equal(ctx._send.firstCall.args[0].id);
    });
});

describe("The pong method", function () {
    it("should _send a pong message", function () {
        var ctx = {
            _send: sinon.spy()
        };
        DDP.prototype.pong.call(ctx, "0");
        ctx._send.firstCall.args[0].should.eql({
            msg: "pong",
            id: "0"
        });
    });
    it("should return the id of the pong call", function () {
        var ctx = {
            _send: sinon.spy()
        };
        var ret = DDP.prototype.pong.call(ctx, "0");
        ret.should.equal("0");
    });
});

describe("The sub method", function () {
    it("should _send a sub message", function () {
        var ctx = {
            _send: sinon.spy()
        };
        DDP.prototype.sub.call(ctx, "subName", ["list", "of", "params"]);
        var arg = ctx._send.firstCall.args[0];
        arg.should.eql({
            msg: "sub",
            id: arg.id,
            name: "subName",
            params: ["list", "of", "params"]
        });
    });
    it("should return the id of the sub call", function () {
        var ctx = {
            _send: sinon.spy()
        };
        var ret = DDP.prototype.sub.call(ctx, "subName", []);
        ret.should.equal(ctx._send.firstCall.args[0].id);
    });
});

describe("The unsub method", function () {
    it("should _send a unsub message", function () {
        var ctx = {
            _send: sinon.spy()
        };
        DDP.prototype.unsub.call(ctx, "0");
        ctx._send.firstCall.args[0].should.eql({
            msg: "unsub",
            id: "0"
        });
    });
    it("should return the id of the unsub call", function () {
        var ctx = {
            _send: sinon.spy()
        };
        var ret = DDP.prototype.unsub.call(ctx, "0");
        ret.should.equal("0");
    });
});















//
