"use strict";

require("should");
var EventEmitter = require("wolfy87-eventemitter");
var sinon        = require("sinon");

var socketConnection = require("../src/socket-connection.js");

describe("The socket-connection module", function () {
    it("should export a function", function () {
        socketConnection.should.be.of.type("function");
    });
});

describe("The socketConnection function", function () {
    it("should attach a _rawSocket object to its context", function () {
        var ctx = {
            _SocketConstructor: function () {
                // Do nothing
            },
            _socket: new EventEmitter()
        };
        socketConnection.call(ctx);
        ctx._rawSocket.should.be.instanceOf(ctx._SocketConstructor);
    });
    it("should register handlers for _rawSocket events", function () {
        var ctx = {
            _SocketConstructor: function () {
                // Do nothing
            },
            _socket: new EventEmitter()
        };
        socketConnection.call(ctx);
        ctx._rawSocket.onopen.should.be.of.type("function");
        ctx._rawSocket.onerror.should.be.of.type("function");
        ctx._rawSocket.onclose.should.be.of.type("function");
        ctx._rawSocket.onmessage.should.be.of.type("function");
    });
});

describe("A _rawSocket open event", function () {
    it("should trigger a _socket open event", function () {
        var ctx = {
            _SocketConstructor: function () {
                // Do nothing
            },
            _socket: new EventEmitter()
        };
        socketConnection.call(ctx);
        var spy = sinon.spy();
        ctx._socket.on("open", spy);
        ctx._rawSocket.onopen();
        spy.called.should.equal(true);
    });
});

describe("A _rawSocket close event", function () {
    it("should trigger a _socket close event", function () {
        var ctx = {
            _SocketConstructor: function () {
                // Do nothing
            },
            _socket: new EventEmitter()
        };
        socketConnection.call(ctx);
        var spy = sinon.spy();
        ctx._socket.on("close", spy);
        ctx._rawSocket.onclose();
        spy.called.should.equal(true);
    });
});

describe("A _rawSocket error event", function () {
    it("should trigger a _socket error event", function () {
        var ctx = {
            _SocketConstructor: function () {
                // Do nothing
            },
            _socket: new EventEmitter()
        };
        socketConnection.call(ctx);
        var spy = sinon.spy();
        ctx._socket.on("error", spy);
        ctx._rawSocket.onerror();
        spy.called.should.equal(true);
    });
});

describe("A _rawSocket message event", function () {
    it("should trigger a _socket message:in event if the message is well-formed JSON", function () {
        var ctx = {
            _SocketConstructor: function () {
                // Do nothing
            },
            _socket: new EventEmitter()
        };
        socketConnection.call(ctx);
        var spy = sinon.spy();
        ctx._socket.on("message:in", spy);
        ctx._rawSocket.onmessage({
            data: JSON.stringify({})
        });
        spy.called.should.equal(true);
    });
    it("should not trigger a _socket event if the message is malformed JSON", function () {
        var ctx = {
            _SocketConstructor: function () {
                // Do nothing
            },
            _socket: new EventEmitter()
        };
        socketConnection.call(ctx);
        var spy = sinon.spy();
        ctx._socket.on("message:in", spy);
        ctx._rawSocket.onmessage({
            data: "not JSON"
        });
        spy.called.should.equal(false);
    });
});

describe("The data of a _rawSocket message event", function () {
    it("should be passed as parsed JSON to _socket message:in event listeners", function () {
        var ctx = {
            _SocketConstructor: function () {
                // Do nothing
            },
            _socket: new EventEmitter()
        };
        socketConnection.call(ctx);
        var spy = sinon.spy();
        ctx._socket.on("message:in", spy);
        ctx._rawSocket.onmessage({
            data: JSON.stringify({a: 0})
        });
        spy.firstCall.args[0].should.eql({a: 0});
    });
});
