/*
*   Emits subscription and method related events
*/

"use strict";

module.exports = function () {
    var u = require("./lib/utils.js");
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
        if (u.contains(msgs, message.msg)) {
            this.emit(message.msg, message);
        }
    }).bind(this));
};
