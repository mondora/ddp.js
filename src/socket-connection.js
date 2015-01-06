/*
*   Establish and maintain a socket connection with the server
*/

"use strict";

var c = require("./lib/constants.js");

var establishRawSocketConnection = function () {
    this._rawSocket = new this._SocketConstructor(this._endpoint);
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
    });
};

var handlers = [
    ["open", function () {
        // When the socket opens, send the `connect` message
        // to establish the DDP connection
        this.connect();
    }],
    ["close", function () {
        // If the socket closes, try reconnecting after a timeout
        this.emit("disconnected");
        setTimeout(
            establishRawSocketConnection.bind(this),
            c.RECONNECT_INTERVAL
        );
    }],
    ["error", function () {
        this.emit("disconnected");
    }],
    ["message:in", function (message) {
        if (message.msg === "connected") {
            this.emit("connected");
        }
    }]
];

module.exports = function () {
    handlers.forEach((function (tuple) {
        this._socket.on(tuple[0], tuple[1].bind(this));
    }).bind(this));
    establishRawSocketConnection.call(this);
};
