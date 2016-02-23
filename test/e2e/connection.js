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

        it("a connection is established on instantiation unless `autoConnect === false`", done => {
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

        it("a connection is not established on instantiation when `autoConnect === false`", done => {
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
                } catch (e) {
                    done(e);
                }
            }, 1000);
        });

        it("a connection can be established manually when `autoConnect === false`", done => {
            /*
            *   The test suceeds when the `connected` event is fired, signaling
            *   the establishment of the connection.
            *   If the event is never fired, the test times out and fails.
            */
            ddp = new DDP({
                ...options,
                autoConnect: false
            });
            ddp.connect();
            ddp.on("connected", () => {
                done();
            });
        });

        it("manually connecting several times doesn't causes multiple simultaneous connections [CASE: `autoConnect === true`]", done => {
            /*
            *   The test suceeds if 1s after having called `connect` several
            *   times only one connection has been established.
            */
            ddp = new DDP(options);
            const connectedSpy = sinon.spy();
            ddp.connect();
            ddp.connect();
            ddp.connect();
            ddp.connect();
            ddp.on("connected", connectedSpy);
            setTimeout(() => {
                try {
                    expect(connectedSpy).to.have.callCount(1);
                    done();
                } catch (e) {
                    done(e);
                }
            }, 1000);
        });

        it("manually connecting several times doesn't causes multiple simultaneous connections [CASE: `autoConnect === false`]", done => {
            /*
            *   The test suceeds if 1s after having called `connect` several
            *   times only one connection has been established.
            */
            ddp = new DDP({
                ...options,
                autoConnect: false
            });
            const connectedSpy = sinon.spy();
            ddp.connect();
            ddp.connect();
            ddp.connect();
            ddp.connect();
            ddp.on("connected", connectedSpy);
            setTimeout(() => {
                try {
                    expect(connectedSpy).to.have.callCount(1);
                    done();
                } catch (e) {
                    done(e);
                }
            }, 1000);
        });

    });

    describe("disconnecting", () => {

        it("the connection is closed when calling `disconnect`", done => {
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

        it("calling `disconnect` several times causes no issues", done => {
            /*
            *   The test suceeds if:
            *   - calling `disconnect` several times doesn't throw, both before
            *     and after the `disconnected` event has been received
            *   - one and only one `disconnected` event is fired (check after
            *     1s)
            */
            const ddp = new DDP(options);
            const disconnectSpy = sinon.spy(() => {
                try {
                    ddp.disconnect();
                    ddp.disconnect();
                    ddp.disconnect();
                    ddp.disconnect();
                } catch (e) {
                    done(e);
                }
            });
            ddp.on("connected", () => {
                try {
                    ddp.disconnect();
                    ddp.disconnect();
                    ddp.disconnect();
                    ddp.disconnect();
                } catch (e) {
                    done(e);
                }
            });
            ddp.on("disconnected", disconnectSpy);
            setTimeout(() => {
                try {
                    expect(disconnectSpy).to.have.callCount(1);
                    done();
                } catch (e) {
                    done(e);
                }
            }, 1000);
        });

        it("the connection is closed when calling `disconnect` and it's not re-established", done => {
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
                    } catch (e) {
                        done(e);
                    }
                }, 1000);
            });
        });

        it("the connection is closed and re-established when the server closes the connection, unless `autoReconnect === true`", done => {
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

        it("the connection is closed and _not_ re-established when the server closes the connection and `autoReconnect === false`", done => {
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
                    } catch (e) {
                        done(e);
                    }
                }, 1000);
            });
        });

        describe("ddp.js issue #22", () => {

            /*
            *   We need to test that no `uncaughtException`-s are raised. Since
            *   mocha adds a listener to the `uncaughtException` event which
            *   causes tests to fail in an unexpected manner, we first remove
            *   that listener, and then we restore it. Since it's not clear
            *   _what_ mocha does with that listener, we try to lower the
            *   meddling impact by doing all of our work inside the `it` block.
            */

            it("no issues when sending messages while disconnected / while disconnecting", done => {
                /*
                *   The test suceeds if, 100ms after the `disconnected` event
                *   has been fired, there haven't been any uncaught exceptions.
                */
                const catcher = sinon.spy();
                const listeners = process.listeners("uncaughtException");
                process.removeAllListeners("uncaughtException");
                process.on("uncaughtException", catcher);
                const ddp = new DDP({
                    ...options,
                    autoReconnect: false
                });
                ddp.on("connected", () => {
                    ddp.disconnect();
                });
                const interval = setInterval(() => {
                    ddp.method("echo", []);
                }, 1);
                ddp.on("disconnected", () => {
                    setTimeout(runAssertions, 100);
                });
                const runAssertions = () => {
                    clearInterval(interval);
                    process.removeAllListeners("uncaughtException");
                    listeners.forEach(listener => {
                        process.on("uncaughtException", listener);
                    });
                    try {
                        expect(catcher).to.have.callCount(0);
                        done();
                    } catch (e) {
                        done(e);
                    }
                };
            });

        });

    });

});
