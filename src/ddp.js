"use strict";

var EventEmitter = require("wolfy87-eventemitter");

var DDP = function (options) {
    // Configuration
    this._endpoint          = options.endpoint;
    this._SocketConstructor = options.SocketConstructor;
    // _socket is a facade for the _rawSocket, exposing a more consistent
    // event api
    this._socket = new EventEmitter();
    this._registerSocketHandlers();
    // Init
    this._establishRawSocketConnection();
};
DDP.prototype = Object.create(EventEmitter.prototype);
DDP.prototype.constructor = DDP;

module.exports = DDP;
