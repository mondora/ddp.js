import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import DDP from "../../src/ddp";
import Socket from "../../src/socket";

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

        it("opens a connection to the server (by calling `socket.open`) unless `options.autoConnect === false`", () => {
            const ddp = new DDP(options);
            expect(ddp.socket.open).to.have.callCount(1);
        });

        it("does not open a connection when `options.autoConnect === false`", () => {
            const ddp = new DDP({
                ...options,
                autoConnect: false
            });
            expect(ddp.socket.open).to.have.callCount(0);
        });

        it("sets the instance `reconnectInterval` to `options.reconnectInterval` if specified", () => {
            const ddp = new DDP({
                ...options,
                reconnectInterval: 1,
                autoConnect: false
            });
            expect(ddp.reconnectInterval).to.equal(1);
        });

        it("sets the instance `reconnectInterval` to a default value if `options.reconnectInterval` is not specified", () => {
            const ddp = new DDP({
                ...options,
                autoConnect: false
            });
            expect(ddp.reconnectInterval).to.equal(10000);
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

        it("generates unique id when not specified", () => {
            const ddp = new DDP(options);
            var ids = [];
            ids.push(ddp.sub("echo", [ 0 ]));
            ids.push(ddp.sub("echo", [ 0 ]));
            expect(ids[0]).to.be.a("string");
            expect(ids[1]).to.be.a("string");
            expect(ids[0]).not.to.equal(ids[1]);
        });

        it("allows manually specifying sub's id", () => {
            const ddp = new DDP(options);
            const subId = ddp.sub("echo", [ 0 ], "12345");
            expect(subId).to.equal("12345");
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

        it("sets the `autoReconnect` flag to false", () => {
            const ddp = new DDP(options);
            ddp.disconnect();
            expect(ddp.autoReconnect).to.equal(false);
        });

    });

    describe("`socket` `open` handler", () => {

        beforeEach(() => {
            sinon.stub(global, "setTimeout", fn => fn());
        });
        afterEach(() => {
            global.setTimeout.restore();
        });

        it("sends the `connect` DDP message", () => {
            const ddp = new DDP(options);
            ddp.socket.send = sinon.spy();
            ddp.socket.emit("open");
            expect(ddp.socket.send).to.have.been.calledWith({
                msg: "connect",
                version: "1",
                support: ["1"]
            });
        });

    });

    describe("`socket` `close` handler", () => {

        beforeEach(() => {
            sinon.stub(global, "setTimeout", fn => fn());
        });
        afterEach(() => {
            global.setTimeout.restore();
        });

        it("emits the `disconnected` event", () => {
            const ddp = new DDP(options);
            ddp.emit = sinon.spy();
            ddp.socket.emit("close");
            expect(ddp.emit).to.have.been.calledWith("disconnected");
        });

        it("sets the status to `disconnected`", () => {
            const ddp = new DDP(options);
            ddp.status = "connected";
            ddp.emit = sinon.spy();
            ddp.socket.emit("close");
            expect(ddp.status).to.equal("disconnected");
        });

        it("schedules a reconnection unless `options.autoReconnect === false`", () => {
            const ddp = new DDP(options);
            ddp.socket.open = sinon.spy();
            ddp.socket.emit("close");
            expect(ddp.socket.open).to.have.callCount(1);
        });

        it("doesn't schedule a reconnection when `options.autoReconnect === false`", () => {
            const ddp = new DDP({
                ...options,
                autoReconnect: false
            });
            ddp.socket.open = sinon.spy();
            ddp.socket.emit("close");
            expect(ddp.socket.open).to.have.callCount(0);
        });

    });

    describe("`socket` `message:in` handler", () => {

        beforeEach(() => {
            sinon.stub(global, "setTimeout", fn => fn());
        });
        afterEach(() => {
            global.setTimeout.restore();
        });

        it("responds to `ping` DDP messages", () => {
            const ddp = new DDP(options);
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

        it("triggers `messageQueue` processing upon connection", () => {
            const ddp = new DDP(options);
            ddp.emit = sinon.spy();
            ddp.messageQueue.process = sinon.spy();
            ddp.socket.emit("message:in", {msg: "connected"});
            expect(ddp.messageQueue.process).to.have.callCount(1);
        });

        it("sets the status to `connected` upon connection", () => {
            const ddp = new DDP(options);
            ddp.emit = sinon.spy();
            ddp.socket.emit("message:in", {msg: "connected"});
            expect(ddp.status).to.equal("connected");
        });

        it("emits public DDP messages as events", () => {
            const ddp = new DDP(options);
            ddp.emit = sinon.spy();
            const message = {
                id: "id",
                msg: "result"
            };
            ddp.socket.emit("message:in", message);
            expect(ddp.emit).to.have.been.calledWith("result", message);
        });

        it("ignores unknown (or non public) DDP messages", () => {
            const ddp = new DDP(options);
            ddp.emit = sinon.spy();
            const message = {
                id: "id",
                msg: "not-a-ddp-message"
            };
            ddp.socket.emit("message:in", message);
            expect(ddp.emit).to.have.callCount(0);
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
