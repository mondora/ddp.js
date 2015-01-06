"use strict";

var u = require("./utils.js");

module.exports = {

    method: function (name, params) {
        var id = u.uniqueId();
        this._send({
            msg: "method",
            id: id,
            method: name,
            params: params
        });
        return id;
    },

    sub: function (name, params) {
        var id = u.uniqueId();
        this._send({
            msg: "sub",
            id: id,
            name: name,
            params: params
        });
        return id;
    },

    unsub: function (id) {
        this._send({
            msg: "unsub",
            id: id
        });
        return id;
    }

};
