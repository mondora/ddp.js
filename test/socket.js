import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import Socket from "../src/socket";

class SocketConstructorMock {}

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

    describe("`connect` method", () => {

        it("instantiates a `SocketConstructor`", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.connect();
            expect(socket.rawSocket).to.be.an.instanceOf(SocketConstructorMock);
        });

        it("registers handlers for `rawSocket` events", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.connect();
            expect(socket.rawSocket.onopen).to.be.a("function");
            expect(socket.rawSocket.onclose).to.be.a("function");
            expect(socket.rawSocket.onerror).to.be.a("function");
            expect(socket.rawSocket.onmessage).to.be.a("function");
        });

    });

    describe("`rawSocket` `onopen` handler", () => {

        it("emits an `open` event", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.emit = sinon.spy();
            socket.connect();
            socket.rawSocket.onopen();
            expect(socket.emit).to.have.been.calledWith("open");
        });

    });

    describe("`rawSocket` `onclose` handler", () => {

        it("emits a `close` event", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.emit = sinon.spy();
            socket.connect();
            socket.rawSocket.onclose();
            expect(socket.emit).to.have.been.calledWith("close");
        });

    });

    describe("`rawSocket` `onerror` handler", () => {

        it("emits an `error` event", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.emit = sinon.spy();
            const error = {};
            socket.connect();
            socket.rawSocket.onerror(error);
            expect(socket.emit).to.have.been.calledWith("error", error);
        });

    });

    describe("`rawSocket` `onmessage` handler", () => {

        it("parses message data into an object", () => {
            const socket = new Socket(SocketConstructorMock);
            sinon.stub(JSON, "parse");
            socket.connect();
            socket.rawSocket.onmessage({data: "message"});
            expect(JSON.parse).to.have.been.calledWith("message");
            JSON.parse.restore();
        });

        it("ignores malformed messages", () => {
            const socket = new Socket(SocketConstructorMock);
            sinon.stub(JSON, "parse").throws();
            socket.connect();
            expect(socket.rawSocket.onmessage).not.to.throw();
            JSON.parse.restore();
        });

        it("emits `message:in` events", () => {
            const socket = new Socket(SocketConstructorMock);
            socket.emit = sinon.spy();
            socket.connect();
            socket.rawSocket.onmessage({data: JSON.stringify({a: "a"})});
            expect(socket.emit).to.have.been.calledWith("message:in", {a: "a"});
        });

    });

});
