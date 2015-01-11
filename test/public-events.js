"use strict";

require("should");
var sinon        = require("sinon");
var EventEmitter = require("wolfy87-eventemitter");

var publicEvents = require("../src/public-events.js");

describe("The public-events module", function () {
    it("should export a function", function () {
        publicEvents.should.be.of.type("function");
    });
});

describe("The publicEvents function", function () {
    it("should register handlers for _socket events", function () {
        var ctx = {
            _socket: {
                on: sinon.spy()
            }
        };
        publicEvents.call(ctx);
        ctx._socket.on.getCalls().forEach(function (call) {
            call.args[0].should.be.of.type("string");
            call.args[1].should.be.of.type("function");
        });
    });
});

describe("Any _socket message:in event carrying ddp method or subscription messages", function () {
    it("should be proxy-ed to the context with the name of the ddp message", function () {
        var ctx = {
            _socket: new EventEmitter()
        };
        publicEvents.call(ctx);
        [
            // Subscription messages
            "ready",
            "nosub",
            "added",
            "changed",
            "removed",
            // Method messages
            "result",
            "updated"
        ].forEach(function (msg) {
            ctx.emit = sinon.spy();
            var message = {
                msg: msg
            };
            ctx._socket.emit("message:in", message);
            ctx.emit.firstCall.args[0].should.equal(msg);
            ctx.emit.firstCall.args[1].should.equal(message);
        });
    });
});
