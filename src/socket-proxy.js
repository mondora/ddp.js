/*
*   Set up the _socket proxy
*/

module.exports = function () {
    // _socket is a proxy for the _rawSocket, with the purpose of exposing a
    // more consistent event api
    var EventEmitter = require("wolfy87-eventemitter");
    this._socket = new EventEmitter();
    this._socket.send = (function (object) {
        var message = JSON.stringify(object);
        this._rawSocket.send(message);
        // Emit a copy of the object, as we don't know who might be listening
        this._socket.emit("message:out", JSON.parse(message));
    }).bind(this);
};
