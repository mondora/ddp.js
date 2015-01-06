/*
*   Responds to ping messages
*/

"use strict";

module.exports = function () {
    this._socket.on("message:in", (function (message) {
        if (message.msg === "ping") {
            this.pong(message.id);
        }
    }).bind(this));
};
