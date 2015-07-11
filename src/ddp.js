import EventEmitter from "wolfy87-eventemitter";
import Socket from "./socket";
import {contains, uniqueId} from "./utils";

const DDP_VERSION = "1";
const PUBLIC_EVENTS = [
    // Connection messages
    "connected",
    // Subscription messages
    "ready", "nosub", "added", "changed", "removed",
    // Method messages
    "result", "updated",
    // Error messages
    "error"
];
const RECONNECT_INTERVAL = 10000;

export default class DDP extends EventEmitter {

    constructor (options) {

        super();

        this.socket = new Socket(options.SocketConstructor, options.endpoint);

        this.socket.on("open", () => {
            // When the socket opens, send the `connect` message
            // to establish the DDP connection
            this.socket.send({
                msg: "connect",
                version: DDP_VERSION,
                support: [DDP_VERSION]
            });
        });

        this.socket.on("close", () => {
            // When the socket closes, emit the `disconnected` event to the DDP
            // connection, and try reconnecting after a timeout
            this.emit("disconnected");
            setTimeout(
                this.socket.connect.bind(this.socket),
                RECONNECT_INTERVAL
            );
        });

        this.socket.on("message:in", (message) => {
            if (message.msg === "ping") {
                // When a `ping` message is received, reply with a `pong` message
                // (the server might close the connection if we don't)
                this.socket.send({msg: "pong", id: message.id});
            } else if (contains(PUBLIC_EVENTS, message.msg)) {
                this.emit(message.msg, message);
            }
        });

        this.socket.connect();

    }

    method (name, params) {
        var id = uniqueId();
        this.socket.send({
            msg: "method",
            id: id,
            method: name,
            params: params
        });
        return id;
    }

    sub (name, params) {
        var id = uniqueId();
        this.socket.send({
            msg: "sub",
            id: id,
            name: name,
            params: params
        });
        return id;
    }

    unsub (id) {
        this.socket.send({
            msg: "unsub",
            id: id
        });
        return id;
    }

}
