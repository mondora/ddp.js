"use strict";

var c = require("./constants.js");
var u = require("./utils.js");

module.exports = {

    _registerSocketHandlers: function () {
        // Handlers are run in the context of the DDP instance
        [
            ["open", function () {
                // When the socket opens, send the connect message to establish
                // the DDP connection
                this._send({
                    msg: "connect",
                    version: c.DDP_VERSION,
                    support: [c.DDP_VERSION]
                });
            }],
            ["close", function () {
                // If the socket closes, try reconnecting after a timeout
                this.emit("disconnected");
                setTimeout(
                    this._establishRawSocketConnection.bind(this),
                    c.RECONNECT_INTERVAL
                );
            }],
            ["error", function () {
                this.emit("disconnected");
            }],
            ["message:in", function (message) {
                var msgs = [
                    // Connection messages
                    "connected",
                    // Ping messages
                    "ping",
                    "pong",
                    // Subscription messages
                    "ready",
                    "nosub",
                    "added",
                    "changed",
                    "removed",
                    // Method messages
                    "result",
                    "updated"
                ];
                if (u.contains(msgs, message.msg)) {
                    this.emit(message.msg, message);
                }
            }]
        ].forEach((function (tuple) {
            this._socket.on(tuple[0], tuple[1].bind(this));
        }).bind(this));
    },

    _establishRawSocketConnection: function () {
        this._rawSocket = new this._SocketConstructor(this._endpoint);
        this._registerRawSocketHandlers();
    },

    _registerRawSocketHandlers: function () {
        this._rawSocket.onopen    = this._socket.emit.bind(this._socket, "open");
        this._rawSocket.onerror   = this._socket.emit.bind(this._socket, "error");
        this._rawSocket.onclose   = this._socket.emit.bind(this._socket, "close");
        this._rawSocket.onmessage = (function (message) {
            var object;
            try {
                object = JSON.parse(message.data);
            } catch (ignore) {
                // Simply ignore the malformed message and return
                return;
            }
            // Outside the try-catch block as it must only catch JSON parsing
            // errors, not errors that may occur inside a "message:in" event
            // handler
            this._socket.emit("message:in", object);
        }).bind(this);
    },

    _send: function (object) {
        this._rawSocket.send(JSON.stringify(object));
        this._socket.emit("message:out", object);
    }

};
