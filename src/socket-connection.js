/*
*   Create the socket instance and register event listeners
*/

"use strict";

module.exports = function () {
    // The `open`, `error` and `close` events are simply proxy-ed to `_socket`.
    // The `message` event is instead parsed into a js object (if possible) and
    // then passed as a parameter of the `message:in` event
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
        // errors, not errors that may occur inside a "message:in" event handler
        this._socket.emit("message:in", object);
    }).bind(this);
};
