import {expect} from "chai";
import {Client} from "faye-websocket";

import DDP from "../../src/ddp";

describe("methods", () => {

    describe("calling a method", () => {

        const ddp = new DDP({
            endpoint: "ws://localhost:3000/websocket",
            SocketConstructor: Client
        });

        after(done => {
            ddp.on("disconnected", () => done());
            ddp.disconnect();
        });

        it("invokes the method on the server and gets a `result` message with the response", done => {
            /*
            *   The test suceeds when the `result` message for the echo method
            *   call is received, and assertions all succeed.
            *   If the `result` message is never received, the test times out
            *   and fails. Naturally, the test also fails if assertions fail.
            */
            const methodId = ddp.method("echo", [0, 1, 2, 3, 4]);
            ddp.on("result", message => {
                if (message.id !== methodId || message.error) {
                    return;
                }
                try {
                    expect(message.result).to.deep.equal([0, 1, 2, 3, 4]);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it("gets an `updated` message", done => {
            /*
            *   The test suceeds when the `updated` message for the echo method
            *   call is received.
            *   If the `updated` message is never received, the test times out
            *   and fails.
            */
            const methodId = ddp.method("echo", [0, 1, 2, 3, 4]);
            ddp.on("updated", message => {
                if (message.methods.indexOf(methodId) !== -1) {
                    done();
                }
            });
        });

    });

});
