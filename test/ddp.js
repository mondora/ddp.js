import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import takeTen from "./take-ten";

chai.use(sinonChai);

import DDP from "../src/ddp";
import Socket from "../src/socket";

class SocketConstructorMock {
    send () {}
    close () {}
}
const options = {
    SocketConstructor: SocketConstructorMock
};

describe("`DDP` class", () => {

    describe("`constructor` method", () => {

        beforeEach(() => {
            sinon.stub(Socket.prototype, "on");
            sinon.stub(Socket.prototype, "open");
        });

        afterEach(() => {
            Socket.prototype.on.restore();
            Socket.prototype.open.restore();
        });

        it("instantiates a `Socket`", () => {
            const ddp = new DDP(options);
            expect(ddp.socket).to.be.an.instanceOf(Socket);
        });

        it("registers handlers for `socket` events", () => {
            const ddp = new DDP(options);
            expect(ddp.socket.on).to.have.always.been.calledWithMatch(
                sinon.match.string,
                sinon.match.func
            );
        });

        it("opens a connection to the server (by calling `socket.open`)", () => {
            const ddp = new DDP(options);
            expect(ddp.socket.open).to.have.callCount(1);
        });

    });

    describe("`method` method", () => {

        it("sends a DDP `method` message", () => {
            const ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            const id = ddp.method("name", ["param"]);
            expect(ddp.messageQueue.push).to.have.been.calledWith({
                msg: "method",
                id: id,
                method: "name",
                params: ["param"]
            });
        });

        it("returns the method's `id`", () => {
            const ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            const id = ddp.method("name", ["param"]);
            expect(id).to.be.a("string");
        });

    });

    describe("`sub` method", () => {

        it("sends a DDP `sub` message", () => {
            const ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            const id = ddp.sub("name", ["param"]);
            expect(ddp.messageQueue.push).to.have.been.calledWith({
                msg: "sub",
                id: id,
                name: "name",
                params: ["param"]
            });
        });

        it("returns the sub's `id`", () => {
            const ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            const id = ddp.sub("name", ["param"]);
            expect(id).to.be.a("string");
        });

    });

    describe("`unsub` method", () => {

        it("sends a DDP `unsub` message", () => {
            const ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            const id = ddp.unsub("id");
            expect(ddp.messageQueue.push).to.have.been.calledWith({
                msg: "unsub",
                id: id
            });
        });

        it("returns the sub's `id`", () => {
            const ddp = new DDP(options);
            ddp.messageQueue.push = sinon.spy();
            const id = ddp.unsub("id");
            expect(id).to.be.a("string");
            expect(id).to.equal("id");
        });

    });

    describe("`connect` method", () => {

        beforeEach(() => {
            sinon.stub(Socket.prototype, "open");
        });

        afterEach(() => {
            Socket.prototype.open.restore();
        });

        it("opens the WebSocket connection", () => {
            const ddp = new DDP(options);
            Socket.prototype.open.reset();
            ddp.connect();
            expect(ddp.socket.open).to.have.callCount(1);
        });

    });

    describe("`disconnect` method", () => {

        beforeEach(() => {
            sinon.stub(Socket.prototype, "close");
        });

        afterEach(() => {
            Socket.prototype.close.restore();
        });

        it("closes the WebSocket connection", () => {
            const ddp = new DDP(options);
            ddp.disconnect();
            expect(ddp.socket.close).to.have.callCount(1);
        });

    });

    describe("`socket` `open` handler", () => {

        it("sends the `connect` DDP message", done => {
            const ddp = new DDP(options);
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

    describe("`socket` `close` handler", () => {

        before(() => {
            sinon.spy(global, "setTimeout");
        });

        after(() => {
            global.setTimeout.restore();
        });

        it("emits the `disconnected` event", done => {
            const ddp = new DDP(options);
            ddp.emit = sinon.spy();
            ddp.socket.emit("close");
            takeTen(() => {
                expect(ddp.emit).to.have.been.calledWith("disconnected");
            }, done);
        });

        it("sets the status to `disconnected`", done => {
            const ddp = new DDP(options);
            ddp.status = "connected";
            ddp.emit = sinon.spy();
            ddp.socket.emit("close");
            takeTen(() => {
                expect(ddp.status).to.equal("disconnected");
            }, done);
        });

        it("schedules a reconnection", done => {
            const ddp = new DDP(options);
            ddp.socket.emit("close");
            const RECONNECT_INTERVAL = 10000;
            takeTen(() => {
                expect(global.setTimeout).to.have.been.calledWithMatch(
                    sinon.match.func,
                    RECONNECT_INTERVAL
                );
            }, done);
        });

    });

    describe("`socket` `message:in` handler", () => {

        it("responds to `ping` DDP messages", done => {
            const ddp = new DDP(options);
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

        it("triggers `messageQueue` processing upon connection", done => {
            const ddp = new DDP(options);
            ddp.emit = sinon.spy();
            ddp.messageQueue.process = sinon.spy();
            ddp.socket.emit("message:in", {msg: "connected"});
            takeTen(() => {
                expect(ddp.messageQueue.process).to.have.callCount(1);
            }, done);
        });

        it("sets the status to `connected` upon connection", done => {
            const ddp = new DDP(options);
            ddp.emit = sinon.spy();
            ddp.socket.emit("message:in", {msg: "connected"});
            takeTen(() => {
                expect(ddp.status).to.equal("connected");
            }, done);
        });

        it("emits public DDP messages as events", done => {
            const ddp = new DDP(options);
            ddp.emit = sinon.spy();
            const message = {
                id: "id",
                msg: "result"
            };
            ddp.socket.emit("message:in", message);
            takeTen(() => {
                expect(ddp.emit).to.have.been.calledWith("result", message);
            }, done);
        });

        it("ignores unknown (or non public) DDP messages", done => {
            const ddp = new DDP(options);
            ddp.emit = sinon.spy();
            const message = {
                id: "id",
                msg: "not-a-ddp-message"
            };
            ddp.socket.emit("message:in", message);
            takeTen(() => {
                expect(ddp.emit).to.have.callCount(0);
            }, done);
        });

    });

    describe("`messageQueue` consumer", () => {

        it("acks if `status` is `connected`", () => {
            const ddp = new DDP(options);
            ddp.status = "connected";
            const ack = ddp.messageQueue.consumer({});
            expect(ack).to.equal(true);
        });

        it("doesn't ack if `status` is `disconnected`", () => {
            const ddp = new DDP(options);
            ddp.status = "disconnected";
            const ack = ddp.messageQueue.consumer({});
            expect(ack).to.equal(false);
        });

    });

});
