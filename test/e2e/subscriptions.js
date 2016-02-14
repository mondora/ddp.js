import {expect} from "chai";
import {Client} from "faye-websocket";

import DDP from "../../src/ddp";

describe("subscriptions", () => {

    describe("subscribing to a publication", () => {

        const ddp = new DDP({
            endpoint: "ws://localhost:3000/websocket",
            SocketConstructor: Client
        });

        after(done => {
            ddp.on("disconnected", () => done());
            ddp.disconnect();
        });

        it("sends a sub call to the server and receives server-sent scubscription events", done => {
            /*
            *   The test suceeds when the `ready` message for the echo
            *   subscription is received, and assertions all succeed.
            *   If the `ready` message is never received, the test times out
            *   and fails. Naturally, the test also fails if assertions fail.
            */
            const subId = ddp.sub("echo", [0, 1, 2, 3, 4]);
            const collections = {};
            ddp.on("added", message => {
                collections[message.collection] = {
                    ...collections[message.collection],
                    [message.id]: {
                        _id: message.id,
                        ...message.fields
                    }
                };
            });
            ddp.on("ready", message => {
                if (message.subs.indexOf(subId) === -1) {
                    return;
                }
                try {
                    expect(collections).to.deep.equal({
                        echoParameters: {
                            "id_0": {_id: "id_0", param: 0},
                            "id_1": {_id: "id_1", param: 1},
                            "id_2": {_id: "id_2", param: 2},
                            "id_3": {_id: "id_3", param: 3},
                            "id_4": {_id: "id_4", param: 4}
                        }
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

    });

    describe("unsubscribing from a publication", () => {

        const ddp = new DDP({
            endpoint: "ws://localhost:3000/websocket",
            SocketConstructor: Client
        });

        after(done => {
            ddp.on("disconnected", () => done());
            ddp.disconnect();
        });

        it("sends an unsub call to the server and receives a nosub unsubscriptions confirmation event", done => {
            /*
            *   The test suceeds when the `nosub` message for the echo
            *   subscription is received. If the `nosub` message is never
            *   received, the test times out and fails.
            */
            const subId = ddp.sub("echo", [0, 1, 2, 3, 4]);
            ddp.on("ready", message => {
                if (message.subs.indexOf(subId) === -1) {
                    return;
                }
                ddp.unsub(subId);
            });
            ddp.on("nosub", message => {
                if (message.id !== subId) {
                    return;
                }
                done();
            });
        });

    });

    describe("getting unsubscribed from a publication", () => {

        const ddp = new DDP({
            endpoint: "ws://localhost:3000/websocket",
            SocketConstructor: Client
        });

        after(done => {
            ddp.on("disconnected", () => done());
            ddp.disconnect();
        });

        it("receives a nosub unsubscriptions event", function (done) {
            /*
            *   The test suceeds when the `nosub` message for the echo
            *   subscription is received. If the `nosub` message is never
            *   received, the test times out and fails.
            *   The server will stop the subscription after about 1s, so there
            *   is no need to terminate it with an `unsub`. We will however
            *   increase the test timeout to 3s to account for the delay.
            */
            this.timeout(3000);
            const subId = ddp.sub("autoTerminating");
            var subReady = false;
            ddp.on("ready", message => {
                if (message.subs.indexOf(subId) !== -1) {
                    subReady = true;
                }
            });
            ddp.on("nosub", message => {
                if (message.id !== subId) {
                    return;
                }
                try {
                    // Ensure the subscription got marked as ready.
                    expect(subReady).to.equal(true);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

    });

});
