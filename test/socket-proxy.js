require("should");
var sinon        = require("sinon");
var EventEmitter = require("wolfy87-eventemitter");

var socketProxy = require("../src/socket-proxy.js");

describe("The socket-proxy module", function () {
    it("should export a function", function () {
        socketProxy.should.be.of.type("function");
    });
});

describe("The socketProxy function", function () {
    it("should attach a _socket object to its context", function () {
        var ctx = {};
        socketProxy.call(ctx);
        ctx._socket.should.be.instanceOf(EventEmitter);
    });
});

describe("The _socket object", function () {
    it("should have a send method", function () {
        var ctx = {};
        socketProxy.call(ctx);
        ctx._socket.send.should.be.of.type("function");
    });
});

describe("The send method", function () {
    it("should stringify the passed object and pass it to the _rawSocket.send function", function () {
        var ctx = {
            _rawSocket: {
                send: sinon.spy()
            }
        };
        var obj = {
            key: "value"
        };
        socketProxy.call(ctx);
        ctx._socket.send(obj);
        ctx._rawSocket.send.firstCall.args[0].should.equal(JSON.stringify(obj));
    });
    it("should trigger a message:out event to the _socket property", function () {
        var ctx = {
            _rawSocket: {
                send: sinon.spy()
            }
        };
        var obj = {
            key: "value"
        };
        socketProxy.call(ctx);
        ctx._socket.emit = sinon.spy();
        ctx._socket.send(obj);
        ctx._socket.emit.firstCall.args[0].should.equal("message:out");
        ctx._socket.emit.firstCall.args[1].should.not.equal(obj);
        ctx._socket.emit.firstCall.args[1].should.eql(obj);
    });
});
