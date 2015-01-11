"use strict";

var EventEmitter = require("wolfy87-eventemitter");

var DDP = function (options) {
    // Configuration
    this._endpoint          = options.endpoint;
    this._SocketConstructor = options.SocketConstructor;
    // Init
    this._init();
};
DDP.prototype = Object.create(EventEmitter.prototype);
DDP.prototype.constructor = DDP;

DDP.prototype._init = function () {
    require("./socket-proxy.js").call(this);
    require("./ddp-connection.js").call(this);
    require("./public-events.js").call(this);
    require("./ping-pong.js").call(this);
    require("./socket-connection.js").call(this);
};

DDP.prototype.connect = function () {
    var c = require("./lib/constants.js");
    this._socket.send({
        msg: "connect",
        version: c.DDP_VERSION,
        support: [c.DDP_VERSION]
    });
};

DDP.prototype.method = function (name, params) {
    var id = require("./lib/utils.js").uniqueId();
    this._socket.send({
        msg: "method",
        id: id,
        method: name,
        params: params
    });
    return id;
};

DDP.prototype.ping = function () {
    var id = require("./lib/utils.js").uniqueId();
    this._socket.send({
        msg: "ping",
        id: id
    });
    return id;
};

DDP.prototype.pong = function (id) {
    this._socket.send({
        msg: "pong",
        id: id
    });
    return id;
};

DDP.prototype.sub = function (name, params) {
    var id = require("./lib/utils.js").uniqueId();
    this._socket.send({
        msg: "sub",
        id: id,
        name: name,
        params: params
    });
    return id;
};

DDP.prototype.unsub = function (id) {
    this._socket.send({
        msg: "unsub",
        id: id
    });
    return id;
};

module.exports = DDP;
