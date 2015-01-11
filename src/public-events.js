/*
*   Emits subscription and method related events
*/

"use strict";

module.exports = function () {
    this._socket.on("message:in", (function (message) {
        var msgs = [
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
        if (require("./lib/utils.js").contains(msgs, message.msg)) {
            this.emit(message.msg, message);
        }
    }).bind(this));
};
