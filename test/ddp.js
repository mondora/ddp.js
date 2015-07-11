import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import takeTen from "./take-ten";

chai.use(sinonChai);

import DDP from "../src/ddp";
import Socket from "../src/socket";

class SocketConstructorMock {
    send () {}
}
const options = {
    SocketConstructor: SocketConstructorMock
};

describe("`DDP` class", function () {

    describe("`constructor` method", function () {

        beforeEach(function () {
            sinon.stub(Socket.prototype, "on");
            sinon.stub(Socket.prototype, "connect");
        });

        afterEach(function () {
            Socket.prototype.on.restore();
            Socket.prototype.connect.restore();
        });

        it("instantiates a `Socket`", function () {
            var ddp = new DDP(options);
            expect(ddp.socket).to.be.an.instanceOf(Socket);
        });

        it("registers handlers for `socket` events", function () {
            var ddp = new DDP(options);
            expect(ddp.socket.on).to.have.always.been.calledWithMatch(
                sinon.match.string,
                sinon.match.func
            );
        });

        it("calls `socket.connect`", function () {
            var ddp = new DDP(options);
            expect(ddp.socket.connect).to.have.callCount(1);
        });

    });

    describe("`method` method", function () {

        it("sends a DDP `method` message", function () {
            var ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            var id = ddp.method("name", ["param"]);
            expect(ddp.messageQueue.push).to.have.been.calledWith({
                msg: "method",
                id: id,
                method: "name",
                params: ["param"]
            });
        });

        it("returns the method's `id`", function () {
            var ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            var id = ddp.method("name", ["param"]);
            expect(id).to.be.a("string");
        });

    });

    describe("`sub` method", function () {

        it("sends a DDP `sub` message", function () {
            var ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            var id = ddp.sub("name", ["param"]);
            expect(ddp.messageQueue.push).to.have.been.calledWith({
                msg: "sub",
                id: id,
                name: "name",
                params: ["param"]
            });
        });

        it("returns the sub's `id`", function () {
            var ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            var id = ddp.sub("name", ["param"]);
            expect(id).to.be.a("string");
        });

    });

    describe("`unsub` method", function () {

        it("sends a DDP `unsub` message", function () {
            var ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            var id = ddp.unsub("id");
            expect(ddp.messageQueue.push).to.have.been.calledWith({
                msg: "unsub",
                id: id
            });
        });

        it("returns the sub's `id`", function () {
            var ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            var id = ddp.unsub("id");
            expect(id).to.be.a("string");
            expect(id).to.equal("id");
        });

    });

    describe("`socket` `open` handler", function () {

        it("sends the `connect` DDP message", function (done) {
            var ddp = new DDP(options);
            ddp.socket.send = sinon.spy();
            ddp.socket.emit("open");
            takeTen(() => {
                expect(ddp.socket.send).to.have.been.calledWith({
                    msg: "connect",
                    version: "1",
                    support: ["1"]
                });
            }, done);
        });

    });

    describe("`socket` `close` handler", function () {

        before(function () {
            sinon.spy(global, "setTimeout");
        });

        after(function () {
            global.setTimeout.restore();
        });

        it("emits the `disconnected` event", function (done) {
            var ddp = new DDP(options);
            ddp.emit = sinon.spy();
            ddp.socket.emit("close");
            takeTen(() => {
                expect(ddp.emit).to.have.been.calledWith("disconnected");
            }, done);
        });

        it("sets the status to `disconnected`", function (done) {
            var ddp = new DDP(options);
            ddp.status = "connected";
            ddp.emit = sinon.spy();
            ddp.socket.emit("close");
            takeTen(() => {
                expect(ddp.status).to.equal("disconnected");
            }, done);
        });

        it("schedules a reconnection", function (done) {
            var ddp = new DDP(options);
            ddp.socket.emit("close");
            var RECONNECT_INTERVAL = 10000;
            takeTen(() => {
                expect(global.setTimeout).to.have.been.calledWithMatch(
                    sinon.match.func,
                    RECONNECT_INTERVAL
                );
            }, done);
        });

    });

    describe("`socket` `message:in` handler", function () {

        it("responds to `ping` DDP messages", function (done) {
            var ddp = new DDP(options);
            ddp.socket.send = sinon.spy();
            ddp.socket.emit("message:in", {
                id: "id",
                msg: "ping"
            });
            takeTen(() => {
                expect(ddp.socket.send).to.have.been.calledWith({
                    id: "id",
                    msg: "pong"
                });
            }, done);
        });

        it("triggers `messageQueue` processing upon connection", function (done) {
            var ddp = new DDP(options);
            ddp.emit = sinon.spy();
            ddp.messageQueue.process = sinon.spy();
            ddp.socket.emit("message:in", {msg: "connected"});
            takeTen(() => {
                expect(ddp.messageQueue.process).to.have.callCount(1);
            }, done);
        });

        it("sets the status to `connected` upon connection", function (done) {
            var ddp = new DDP(options);
            ddp.emit = sinon.spy();
            ddp.socket.emit("message:in", {msg: "connected"});
            takeTen(() => {
                expect(ddp.status).to.equal("connected");
            }, done);
        });

        it("emits public DDP messages as events", function (done) {
            var ddp = new DDP(options);
            ddp.emit = sinon.spy();
            var message = {
                id: "id",
                msg: "result"
            };
            ddp.socket.emit("message:in", message);
            takeTen(() => {
                expect(ddp.emit).to.have.been.calledWith("result", message);
            }, done);
        });

        it("ignores unknown (or non public) DDP messages", function (done) {
            var ddp = new DDP(options);
            ddp.emit = sinon.spy();
            var message = {
                id: "id",
                msg: "not-a-ddp-message"
            };
            ddp.socket.emit("message:in", message);
            takeTen(() => {
                expect(ddp.emit).to.have.callCount(0);
            }, done);
        });

    });

    describe("`messageQueue` consumer", function () {

        it("acks if `status` is `connected`", function () {
            var ddp = new DDP(options);
            ddp.status = "connected";
            var ack = ddp.messageQueue.consumer({});
            expect(ack).to.equal(true);
        });

        it("doesn't ack if `status` is `disconnected`", function () {
            var ddp = new DDP(options);
            ddp.status = "disconnected";
            var ack = ddp.messageQueue.consumer({});
            expect(ack).to.equal(false);
        });

    });

});
