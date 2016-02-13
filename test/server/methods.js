Meteor.methods({
    echo: function () {
        return _.toArray(arguments);
    },
    disconnectMe: function () {
        this.connection.close();
    }
});
