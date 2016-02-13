// import {expect} from "chai";
import {Client} from "faye-websocket";

import DDP from "../../src/ddp";

describe("connection", () => {

    describe("connecting", () => {

        it("a connection is established on instantiation", done => {
            /*
            *   The test suceeds when the `connected` event is fired, signaling
            *   the establishment of the connection.
            *   If the event is never fired, the test times out and fails.
            */
            const ddp = new DDP({
                endpoint: "ws://localhost:3000/websocket",
                SocketConstructor: Client
            });
            ddp.on("connected", () => {
                done();
            });
        });

    });

    describe("disconnecting", () => {

        it("the connection is closed when calling `ddp.disconnect", done => {
            /*
            *   The test suceeds when the `disconnected` event is fired,
            *   signaling the termination of the connection.
            *   If the event is never fired, the test times out and fails.
            */
            const ddp = new DDP({
                endpoint: "ws://localhost:3000/websocket",
                SocketConstructor: Client
            });
            ddp.on("connected", () => {
                ddp.disconnect();
            });
            ddp.on("disconnected", () => {
                done();
            });
        });

        it("the connection is closed when the server closes the connection", done => {
            /*
            *   The test suceeds when the `disconnected` event is fired,
            *   signaling the termination of the connection, this time,
            *   initiated by the server.
            *   If the event is never fired, the test times out and fails.
            */
            const ddp = new DDP({
                endpoint: "ws://localhost:3000/websocket",
                SocketConstructor: Client
            });
            ddp.on("connected", () => {
                ddp.method("disconnectMe", []);
            });
            ddp.on("disconnected", () => {
                done();
            });
        });

    });

});
