import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import Socket from "../../src/socket";

class SocketConstructorMock {
    close () {}
    send () {}
}

describe("`Socket` class", () => {

    describe("`send` method", () => {

        it("sends a message through the `rawSocket`", () => {
            const socket = new Socket();
            socket.rawSocket = {
                send: sinon.spy()
            };
            socket.send({});
            expect(socket.rawSocket.send).to.have.callCount(1);
        });

        it("stringifies the object to send", () => {
            const socket = new Socket();
            socket.rawSocket = {
                send: sinon.spy()
            };
            const object = {
                a: "a"
            };
            const expectedMessage = JSON.stringify(object);
            socket.send(object);
            expect(socket.rawSocket.send).to.have.been.calledWith(expectedMessage);
        });

        it("emits a `message:out` event", () => {
            const socket = new Socket();
            socket.rawSocket = {
                send: sinon.spy()
            };
            socket.emit = sinon.spy();
            const object = {
                a: "a"
            };
            socket.send(object);
            expect(socket.emit).to.have.been.calledWith("message:out", object);
        });

    });

    describe("`open` method", () => {

        it("no-op if `rawSocket` is already defined", () => {
            const socket = new Socket(SocketConstructorMock);
            const rawSocket = {};
            socket.rawSocket = rawSocket;
            socket.open();
            // Test, for instance, that `rawSocket` has not been replaced.
            expect(socket.rawSocket).to.equal(rawSocket);
        });

        it("instantiates a `SocketConstructor`", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.open();
            expect(socket.rawSocket).to.be.an.instanceOf(SocketConstructorMock);
        });

        it("registers handlers for `rawSocket` events", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.open();
            expect(socket.rawSocket.onopen).to.be.a("function");
            expect(socket.rawSocket.onclose).to.be.a("function");
            expect(socket.rawSocket.onerror).to.be.a("function");
            expect(socket.rawSocket.onmessage).to.be.a("function");
        });

    });

    describe("`close` method", () => {

        it("closes the `rawSocket`", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.open();
            socket.rawSocket.close = sinon.spy();
            socket.close();
            expect(socket.rawSocket.close).to.have.callCount(1);
        });

        it("doesn't throw if there's no `rawSocket`", () => {
            const socket = new Socket(SocketConstructorMock);
            const peacemaker = () => {
                socket.close();
            };
            expect(peacemaker).not.to.throw();
        });

    });

    describe("`rawSocket` `onopen` handler", () => {

        it("emits an `open` event", () => {
            const socket = new Socket(SocketConstructorMock);
            const handler = sinon.spy();
            socket.on("open", handler);
            socket.open();
            socket.rawSocket.onopen();
            expect(handler).to.have.callCount(1);
        });

    });

    describe("`rawSocket` `onclose` handler", () => {

        it("emits a `close` event", () => {
            const socket = new Socket(SocketConstructorMock);
            const handler = sinon.spy();
            socket.on("close", handler);
            socket.open();
            socket.rawSocket.onclose();
            expect(handler).to.have.callCount(1);
        });

        it("null-s the `rawSocket` property", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.open();
            socket.rawSocket.onclose();
            expect(socket.rawSocket).to.equal(null);
        });

    });

    describe("`rawSocket` `onerror` handler", () => {

        it("closes `rawSocket` (by calling `rawSocket.close`)", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.open();
            const rawSocket = socket.rawSocket;
            rawSocket.close = sinon.spy();
            socket.rawSocket.onerror();
            expect(rawSocket.close).to.have.callCount(1);
        });

        it("de-registers the `rawSocket.onclose` callback", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.open();
            const rawSocket = socket.rawSocket;
            expect(rawSocket).to.have.property("onclose");
            socket.rawSocket.onerror();
            expect(rawSocket).not.to.have.property("onclose");
        });

        it("emits a `close` event", () => {
            const socket = new Socket(SocketConstructorMock);
            const handler = sinon.spy();
            socket.on("close", handler);
            socket.open();
            socket.rawSocket.onerror();
            expect(handler).to.have.callCount(1);
        });

        it("null-s the `rawSocket` property", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.open();
            socket.rawSocket.onerror();
            expect(socket.rawSocket).to.equal(null);
        });

    });

    describe("`rawSocket` `onmessage` handler", () => {

        it("parses message data into an object", () => {
            const socket = new Socket(SocketConstructorMock);
            sinon.stub(JSON, "parse");
            socket.open();
            socket.rawSocket.onmessage({data: "message"});
            expect(JSON.parse).to.have.been.calledWith("message");
            JSON.parse.restore();
        });

        it("ignores malformed messages", () => {
            const socket = new Socket(SocketConstructorMock);
            sinon.stub(JSON, "parse").throws();
            socket.open();
            expect(socket.rawSocket.onmessage).not.to.throw();
            JSON.parse.restore();
        });

        it("emits `message:in` events", () => {
            const socket = new Socket(SocketConstructorMock);
            const handler = sinon.spy();
            socket.on("message:in", handler);
            socket.open();
            socket.rawSocket.onmessage({data: JSON.stringify({a: "a"})});
            expect(handler).to.have.callCount(1);
            expect(handler).to.have.been.calledWith({a: "a"});
        });

    });

});
