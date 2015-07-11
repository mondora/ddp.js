import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import DDP from "../src/ddp";
import Socket from "../src/socket";

class SocketConstructorMock {}
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
            ddp.socket.send = sinon.spy();
            var id = ddp.method("name", ["param"]);
            expect(ddp.socket.send).to.have.been.calledWith({
                msg: "method",
                id: id,
                method: "name",
                params: ["param"]
            });
        });

        it("returns the method's `id`", function () {
            var ddp = new DDP(options);
            ddp.socket.send = sinon.spy();
            var id = ddp.method("name", ["param"]);
            expect(id).to.be.a("string");
        });

    });

    describe("`sub` method", function () {

        it("sends a DDP `sub` message", function () {
            var ddp = new DDP(options);
            ddp.socket.send = sinon.spy();
            var id = ddp.sub("name", ["param"]);
            expect(ddp.socket.send).to.have.been.calledWith({
                msg: "sub",
                id: id,
                name: "name",
                params: ["param"]
            });
        });

        it("returns the sub's `id`", function () {
            var ddp = new DDP(options);
            ddp.socket.send = sinon.spy();
            var id = ddp.sub("name", ["param"]);
            expect(id).to.be.a("string");
        });

    });

    describe("`unsub` method", function () {

        it("sends a DDP `unsub` message", function () {
            var ddp = new DDP(options);
            ddp.socket.send = sinon.spy();
            var id = ddp.unsub("id");
            expect(ddp.socket.send).to.have.been.calledWith({
                msg: "unsub",
                id: id
            });
        });

        it("returns the sub's `id`", function () {
            var ddp = new DDP(options);
            ddp.socket.send = sinon.spy();
            var id = ddp.unsub("id");
            expect(id).to.be.a("string");
            expect(id).to.equal("id");
        });

    });

    describe("`socket` `open` handler", function () {

        it("sends the `connect` DDP message", function () {
            var ddp = new DDP(options);
            ddp.socket.send = sinon.spy();
            ddp.socket.emit("open");
            expect(ddp.socket.send).to.have.been.calledWith({
                msg: "connect",
                version: "1",
                support: ["1"]
            });
        });

    });

    describe("`socket` `close` handler", function () {

        beforeEach(function () {
            sinon.stub(global, "setTimeout");
        });

        afterEach(function () {
            global.setTimeout.restore();
        });

        it("emits the `disconnected` event", function () {
            var ddp = new DDP(options);
            ddp.emit = sinon.spy();
            ddp.socket.emit("close");
            expect(ddp.emit).to.have.been.calledWith("disconnected");
        });

        it("schedules a reconnection", function () {
            var ddp = new DDP(options);
            ddp.socket.emit("close");
            expect(global.setTimeout).to.have.been.calledWithMatch(
                sinon.match.func,
                sinon.match.number
            );
        });

    });

    describe("`socket` `message:in` handler", function () {

        beforeEach(function () {
            sinon.stub(global, "setTimeout");
        });

        afterEach(function () {
            global.setTimeout.restore();
        });

        it("responds to `ping` DDP messages", function () {
            var ddp = new DDP(options);
            ddp.socket.send = sinon.spy();
            ddp.socket.emit("message:in", {
                id: "id",
                msg: "ping"
            });
            expect(ddp.socket.send).to.have.been.calledWith({
                id: "id",
                msg: "pong"
            });
        });

        it("emits public DDP messages as events", function () {
            var ddp = new DDP(options);
            ddp.emit = sinon.spy();
            var message = {
                id: "id",
                msg: "result"
            };
            ddp.socket.emit("message:in", message);
            expect(ddp.emit).to.have.been.calledWith("result", message);
        });

        it("ignores unknown (or non public) DDP messages", function () {
            var ddp = new DDP(options);
            ddp.emit = sinon.spy();
            var message = {
                id: "id",
                msg: "not-a-ddp-message"
            };
            ddp.socket.emit("message:in", message);
            expect(ddp.emit).to.have.callCount(0);
        });

    });

});
