import EventEmitter from "wolfy87-eventemitter";
import Queue from "./queue";
import Socket from "./socket";
import {contains, uniqueId} from "./utils";

const DDP_VERSION = "1";
const PUBLIC_EVENTS = [
    // Subscription messages
    "ready", "nosub", "added", "changed", "removed",
    // Method messages
    "result", "updated",
    // Error messages
    "error"
];
const RECONNECT_INTERVAL = 10000;

export default class DDP extends EventEmitter {

    emit () {
        var args = arguments;
        setTimeout(() => {
            super.emit.apply(this, args);
        }, 0);
    }

    constructor (options) {

        super();

        this.status = "disconnected";

        this.messageQueue = new Queue((message) => {
            if (this.status === "connected") {
                this.socket.send(message);
                return true;
            } else {
                return false;
            }
        });

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
            this.status = "disconnected";
            this.messageQueue.empty();
            this.emit("disconnected");
            // Schedule a reconnection
            setTimeout(this.socket.connect.bind(this.socket), RECONNECT_INTERVAL);
        });

        this.socket.on("message:in", (message) => {
            if (message.msg === "connected") {
                this.status = "connected";
                this.messageQueue.process();
                this.emit("connected");
            } else if (message.msg === "ping") {
                // Reply with a `pong` message to prevent the server from
                // closing the connection
                this.socket.send({msg: "pong", id: message.id});
            } else if (contains(PUBLIC_EVENTS, message.msg)) {
                this.emit(message.msg, message);
            }
        });

        this.socket.connect();

    }

    method (name, params) {
        var id = uniqueId();
        this.messageQueue.push({
            msg: "method",
            id: id,
            method: name,
            params: params
        });
        return id;
    }

    sub (name, params) {
        var id = uniqueId();
        this.messageQueue.push({
            msg: "sub",
            id: id,
            name: name,
            params: params
        });
        return id;
    }

    unsub (id) {
        this.messageQueue.push({
            msg: "unsub",
            id: id
        });
        return id;
    }

}
