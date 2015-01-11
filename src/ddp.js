"use strict";

var EventEmitter = require("wolfy87-eventemitter");

var DDP = function (options) {
    // Configuration
    this._endpoint          = options.endpoint;
    this._SocketConstructor = options.SocketConstructor;
    // _socket is a facade for the _rawSocket, exposing a more consistent
    // event api
    this._socket = new EventEmitter();
    // Init
    this._init();
};
DDP.prototype = Object.create(EventEmitter.prototype);
DDP.prototype.constructor = DDP;

// Register methods
require("./methods.js").forEach(function (tuple) {
    DDP.prototype[tuple[0]] = tuple[1];
});

// Default steps
DDP.prototype._initSteps = [
    require("./ddp-connection.js"),
    require("./public-events.js"),
    require("./ping-pong.js"),
    require("./socket-connection.js")
];

module.exports = DDP;
