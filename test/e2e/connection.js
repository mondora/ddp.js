import chai, {expect} from "chai";
import {Client} from "faye-websocket";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import DDP from "../../src/ddp";

chai.use(sinonChai);

const options = {
    endpoint: "ws://localhost:3000/websocket",
    SocketConstructor: Client
};

describe("connection", () => {

    var ddp = null;
    afterEach(done => {
        if (ddp) {
            ddp.on("disconnected", () => done());
            ddp.disconnect();
            ddp = null;
        } else {
            done();
        }
    });

    describe("connecting", () => {

        it("a connection is established on instantiation unless `options.autoConnect === false`", done => {
            /*
            *   The test suceeds when the `connected` event is fired, signaling
            *   the establishment of the connection.
            *   If the event is never fired, the test times out and fails.
            */
            ddp = new DDP(options);
            ddp.on("connected", () => {
                done();
            });
        });

        it("a connection is not established on instantiation when `options.autoConnect === false`", done => {
            /*
            *   The test succeeds if, 1s after the creation of the DDP instance,
            *   a `connected` event has not been fired.
            */
            const ddp = new DDP({
                ...options,
                autoConnect: false
            });
            const connectedHandler = sinon.spy();
            ddp.on("connected", connectedHandler);
            setTimeout(() => {
                try {
                    expect(connectedHandler).to.have.callCount(0);
                    done();
                    return;
                } catch (e) {
                    done(e);
                }
            }, 1000);
        });

    });

    describe("disconnecting", () => {

        it("the connection is closed when calling `ddp.disconnect`", done => {
            /*
            *   The test suceeds when the `disconnected` event is fired,
            *   signaling the termination of the connection.
            *   If the event is never fired, the test times out and fails.
            */
            const ddp = new DDP(options);
            ddp.on("connected", () => {
                ddp.disconnect();
            });
            ddp.on("disconnected", () => {
                done();
            });
        });

        it("the connection is closed when calling `ddp.disconnect` and it's not re-established", done => {
            /*
            *   The test suceeds if, 1s after the `disconnected` event has been
            *   fired, there hasn't been any reconnection.
            */
            const ddp = new DDP({
                ...options,
                reconnectInterval: 10
            });
            const disconnectOnConnection = sinon.spy(() => {
                ddp.disconnect();
            });
            ddp.on("connected", disconnectOnConnection);
            ddp.on("disconnected", () => {
                setTimeout(() => {
                    try {
                        expect(disconnectOnConnection).to.have.callCount(1);
                        done();
                        return;
                    } catch (e) {
                        done(e);
                    }
                }, 1000);
            });
        });

        it("the connection is closed and re-established when the server closes the connection, unless `options.autoReconnect === true`", done => {
            /*
            *   The test suceeds when the `connect` event is fired a second time
            *   after the client gets disconnected from the server (occurrence
            *   marked by the `disconnected` event).
            *   If the event is never fired a second time, the test times out
            *   and fails.
            */
            ddp = new DDP({
                ...options,
                reconnectInterval: 10
            });
            var callCount = 0;
            ddp.on("connected", () => {
                callCount += 1;
                if (callCount === 1) {
                    ddp.method("disconnectMe", []);
                }
                if (callCount === 2) {
                    done();
                }
            });
        });

        it("the connection is closed and _not_ re-established when the server closes the connection and `options.autoReconnect === false`", done => {
            /*
            *   The test suceeds if, 1s after the `disconnected` event has been
            *   fired, there hasn't been any reconnection.
            */
            const ddp = new DDP({
                ...options,
                reconnectInterval: 10,
                autoReconnect: false
            });
            const disconnectMe = sinon.spy(() => {
                ddp.method("disconnectMe", []);
            });
            ddp.on("connected", disconnectMe);
            ddp.on("disconnected", () => {
                setTimeout(() => {
                    try {
                        expect(disconnectMe).to.have.callCount(1);
                        done();
                        return;
                    } catch (e) {
                        done(e);
                    }
                }, 1000);
            });
        });

    });

});
