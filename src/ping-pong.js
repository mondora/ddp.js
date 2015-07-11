/*
*   Responds to ping messages
*/

module.exports = function () {
    this._socket.on("message:in", (function (message) {
        if (message.msg === "ping") {
            this.pong(message.id);
        }
    }).bind(this));
};
