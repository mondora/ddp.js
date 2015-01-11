"use strict";

require("should");
var sinon        = require("sinon");
var EventEmitter = require("wolfy87-eventemitter");

var ddpConnection = require("../src/ddp-connection.js");

describe("The ddp-connection module", function () {
    it("should export a function", function () {
        ddpConnection.should.be.of.type("function");
    });
});

describe("The ddpConnection function", function () {
    it("should register handlers for _socket events", function () {
        var ctx = {
            _socket: {
                on: sinon.spy()
            }
        };
        ddpConnection.call(ctx);
        ctx._socket.on.getCalls().forEach(function (call) {
            call.args[0].should.be.of.type("string");
            call.args[1].should.be.of.type("function");
        });
    });
});

describe("A _socket open event", function () {
    it("should trigger a call to the connect method of the context", function () {
        var ctx = {
            _socket: new EventEmitter(),
            connect: sinon.spy()
        };
        ddpConnection.call(ctx);
        ctx._socket.emit("open");
        ctx.connect.called.should.equal(true);
    });
});

describe("A _socket close event", function () {
    beforeEach(function () {
        sinon.stub(global, "setTimeout");
    });
    afterEach(function () {
        global.setTimeout.restore();
    });
    it("should trigger a disconnected event on the context", function () {
        var ctx = {
            _socket: new EventEmitter(),
            emit: sinon.spy()
        };
        ddpConnection.call(ctx);
        ctx._socket.emit("close");
        ctx.emit.firstCall.args[0].should.equal("disconnected");
    });
    it("should register a timeout for establishing a new socket connection", function () {
        var ctx = {
            _socket: new EventEmitter(),
            emit: sinon.spy()
        };
        ddpConnection.call(ctx);
        ctx._socket.emit("close");
        global.setTimeout.firstCall.args[0].should.be.of.type("function");
    });
});

describe("A _socket message:in event carrying a connected message", function () {
    it("should trigger a connected event on the context", function () {
        var ctx = {
            _socket: new EventEmitter(),
            emit: sinon.spy()
        };
        ddpConnection.call(ctx);
        ctx._socket.emit("message:in", {
            msg: "connected"
        });
        ctx.emit.firstCall.args[0].should.equal("connected");
    });
});
