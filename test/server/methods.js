import {conf} from "./conf";
Meteor.methods({
    echo: function () {
        return _.toArray(arguments);
    },
    disconnectMe: function () {
        this.connection.close();
    },
    serverID: function ()  {
        return conf.server_id;
    }
});
