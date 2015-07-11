require("should");
var sinon        = require("sinon");
var EventEmitter = require("wolfy87-eventemitter");

var pingPong = require("../src/ping-pong.js");

describe("The ping-pong module", function () {
    it("should export a function", function () {
        pingPong.should.be.of.type("function");
    });
});

describe("The pingPong function", function () {
    it("should register handlers for _socket events", function () {
        var ctx = {
            _socket: {
                on: sinon.spy()
            }
        };
        pingPong.call(ctx);
        ctx._socket.on.getCalls().forEach(function (call) {
            call.args[0].should.be.of.type("string");
            call.args[1].should.be.of.type("function");
        });
    });
});

describe("A _socket message:in event carrying a ping message", function () {
    it("should trigger a call to the pong method of the context", function () {
        var ctx = {
            _socket: new EventEmitter(),
            pong: sinon.spy()
        };
        pingPong.call(ctx);
        ctx._socket.emit("message:in", {
            msg: "ping",
            id: "0"
        });
        ctx.pong.firstCall.args[0].should.equal("0");
    });
});
