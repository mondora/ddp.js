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

DDP.prototype._initSteps = [
    require("./ddp-connection.js"),
    require("./public-events.js"),
    require("./ping-pong.js"),
    require("./socket-connection.js")
];

DDP.prototype._init = function () {
    this._initSteps.forEach((function (step) {
        step.call(this);
    }).bind(this));
};

DDP.prototype._send = function (object) {
    var message = JSON.stringify(object);
    this._rawSocket.send(message);
    // Emit a copy of the object, as we don't know who might be listening
    this._socket.emit("message:out", JSON.parse(message));
};

DDP.prototype.connect = function () {
    var c = require("./lib/constants.js");
    this._send({
        msg: "connect",
        version: c.DDP_VERSION,
        support: [c.DDP_VERSION]
    });
};

DDP.prototype.method = function (name, params) {
    var id = require("./lib/utils.js").uniqueId();
    this._send({
        msg: "method",
        id: id,
        method: name,
        params: params
    });
    return id;
};

DDP.prototype.ping = function () {
    var id = require("./lib/utils.js").uniqueId();
    this._send({
        msg: "ping",
        id: id
    });
    return id;
};

DDP.prototype.pong = function (id) {
    this._send({
        msg: "pong",
        id: id
    });
    return id;
};

DDP.prototype.sub = function (name, params) {
    var id = require("./lib/utils.js").uniqueId();
    this._send({
        msg: "sub",
        id: id,
        name: name,
        params: params
    });
    return id;
};

DDP.prototype.unsub = function (id) {
    this._send({
        msg: "unsub",
        id: id
    });
    return id;
};

module.exports = DDP;
