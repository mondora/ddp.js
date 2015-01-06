"use strict";

var c = require("./lib/constants.js");
var u = require("./lib/utils.js");

module.exports = [

    ["_init", function () {
        this._initSteps.forEach((function (step) {
            step.call(this);
        }).bind(this));
    }],

    ["_send", function (object) {
        this._rawSocket.send(JSON.stringify(object));
        this._socket.emit("message:out", object);
    }],

    ["connect", function () {
        this._send({
            msg: "connect",
            version: c.DDP_VERSION,
            support: [c.DDP_VERSION]
        });
    }],

    ["method", function (name, params) {
        var id = u.uniqueId();
        this._send({
            msg: "method",
            id: id,
            method: name,
            params: params
        });
        return id;
    }],

    ["ping", function () {
        var id = u.uniqueId();
        this._send({
            msg: "ping",
            id: id
        });
        return id;
    }],

    ["pong", function (id) {
        this._send({
            msg: "pong",
            id: id
        });
        return id;
    }],

    ["sub", function (name, params) {
        var id = u.uniqueId();
        this._send({
            msg: "sub",
            id: id,
            name: name,
            params: params
        });
        return id;
    }],

    ["unsub", function (id) {
        this._send({
            msg: "unsub",
            id: id
        });
        return id;
    }]

];
