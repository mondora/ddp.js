/*
*   Maintain a DDP connection with the server
*/

"use strict";

module.exports = function () {
    // Register handlers for the `_socket` events that are responsible for
    // establishing and maintaining the DDP connection
    this._socket.on("open", (function () {
        // When the socket opens, send the `connect` message
        // to establish the DDP connection
        this.connect();
    }).bind(this));
    this._socket.on("close", (function () {
        // When the socket closes, emit the `disconnected` event to the DDP
        // connection, and try reconnecting after a timeout
        this.emit("disconnected");
        setTimeout(
            require("./socket-connection.js").bind(this),
            require("./lib/constants.js").RECONNECT_INTERVAL
        );
    }).bind(this));
    this._socket.on("message:in", (function (message) {
        // When the `connected` message is received, emit the `connected` event
        // to the DDP connection
        if (message.msg === "connected") {
            this.emit("connected");
        }
    }).bind(this));
};
