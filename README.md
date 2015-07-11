[![Build Status](https://travis-ci.org/mondora/ddp.js.svg?branch=master)](https://travis-ci.org/mondora/ddp.js)
[![Coverage Status](https://img.shields.io/coveralls/mondora/ddp.js.svg)](https://coveralls.io/r/mondora/ddp.js?branch=master)
[![Dependency Status](https://david-dm.org/mondora/ddp.js.svg)](https://david-dm.org/mondora/ddp.js)
[![devDependency Status](https://david-dm.org/mondora/ddp.js/dev-status.svg)](https://david-dm.org/mondora/ddp.js#info=devDependencies)

#WARNING
Breaking changes from ~0.6.0 to >=1.0.0, [read the
CHANGELOG](https://github.com/mondora/ddp.js/blob/master/CHANGELOG.md) for more
info.

#ddp.js

A javascript isomorphic ddp client.

##What is it for?

The purpose of this library is:

- to set up and maintain a ddp connection with a ddp server, freeing the
  developer from having to do it on their own
- to give the developer a clear, consistent API to communicate with the ddp
  server

##Install

Via npm

    npm install ddp.js

Or via bower

    bower install ddp.js

##Example usage

```javascript
var DDP = require("ddp.js");
var options = {
    endpoint: "http://localhost:3000/websocket",
    SocketConstructor: WebSocket
};
var ddp = new DDP(options);

ddp.on("connected", function () {
    console.log("Connected");
});

var subId = ddp.sub("mySubscription");
ddp.on("ready", function (message) {
    if (message.id === subId) {
        console.log("mySubscription ready");
    }
});
ddp.on("added", function (message) {
    console.log(message.collection);
});

var myLoginParams = {
    user: {
        email: "user@example.com"
    },
    password: "hunter2"
};
var methodId = ddp.method("login", [myLoginParams]);
ddp.on("result", function (message) {
    if (message.id === methodId && !message.error) {
        console.log("Logged in!");
    }
});
```

##Tests

`npm test` to run tests. Coverage reports are generated in the `coverage/`
directory.

##Public API

###new DDP(options)

Creates a new DDP instance. After being constructed, the instance will
establish a connection with the DDP server and will try to maintain it open.

####Arguments

- `options` **object** *required*

Available options are:

- `endpoint` **string** *required*: the location of the websocket server. Its
  format depends on the type of socket you are using.

- `SocketConstructor` **function** *required*: the constructor function that
  will be used to construct the socket. Meteor (currently the only DDP server
  available) supports websockets and SockJS sockets.  So, practically speaking,
  this means that on the browser you can use either the browser's native
  WebSocket constructor or the SockJS constructor provided by the SockJS
  library.  On the server you can use whichever library implements the
  websocket protocol (e.g.  faye-websocket).

####Returns

A new DDP instance, which is also an `EventEmitter` instance.

---

###DDP.method(name, params)

Calls a remote method.

####Arguments

- `name` **string** *required*: name of the method to call.

- `params` **array** *required*: parameters to pass to the remote method. Pass
  an empty array if you do not wish to pass any parameters.

####Returns

The unique `id` (string) corresponding to the method call.

---

###DDP.sub(name, params)

Subscribes to a server publication.

####Arguments

- `name` **string** *required*: name of the server publication.

- `params` **array** *required*: parameters to pass to the server publish
  function. Pass an empty array if you do not wish to pass any parameters.

####Returns

The unique `id` (string) corresponding to the subscription call.

---

###DDP.unsub(id)

Unsubscribes to a previously-subscribed server publication.

####Arguments

- `id` **string** *required*: id of the subscription.

####Returns

The `id` corresponding to the subscription call (not of much use, but I return
it for consistency).

##Public events

###Connection events

- `connected`: emitted with no arguments when the DDP connection is
  established.

- `disconnected`: emitted with no arguments when the DDP connection drops.

###Subscription events

All the following events are emitted with one argument, the parsed DDP message.
Further details can be found [on the DDP spec
page](https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md).

- `ready`
- `nosub`
- `added`
- `changed`
- `removed`

###Method events

All the following events are emitted with one argument, the parsed DDP message.
Further details can be found [on the DDP spec
page](https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md).

- `result`
- `updated`
