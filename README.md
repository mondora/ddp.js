[![npm version](https://badge.fury.io/js/ddp.js.svg)](https://badge.fury.io/js/ddp.js)
[![Build Status](https://travis-ci.org/mondora/ddp.js.svg?branch=master)](https://travis-ci.org/mondora/ddp.js)
[![Coverage Status](https://img.shields.io/coveralls/mondora/ddp.js.svg)](https://coveralls.io/r/mondora/ddp.js?branch=master)
[![Dependency Status](https://david-dm.org/mondora/ddp.js.svg)](https://david-dm.org/mondora/ddp.js)
[![devDependency Status](https://david-dm.org/mondora/ddp.js/dev-status.svg)](https://david-dm.org/mondora/ddp.js#info=devDependencies)

# ddp.js

A javascript isomorphic/universal ddp client.

> ## Warning
> `ddp.js@^2.0.0` is only distributed as an `npm` module instead of an UMD
> bundle. Also, `bower` has been removed as a method of distribution. If you
> need an UMD bundle or `bower` support, I'm open for suggestions to add back
> those methods of distribution without polluting this repo.

## What is it for?

The purpose of this library is:

- to set up and maintain a ddp connection with a ddp server, freeing the
  developer from having to do it on their own
- to give the developer a clear, consistent API to communicate with the ddp
  server

## Install

    npm install ddp.js

## Example usage

```js
const DDP = require("ddp.js");
const options = {
    endpoint: "ws://localhost:3000/websocket",
    SocketConstructor: WebSocket
};
const ddp = new DDP(options);

ddp.on("connected", () => {
    console.log("Connected");
});

const subId = ddp.sub("mySubscription");
ddp.on("ready", message => {
    if (message.subs.includes(subId)) {
        console.log("mySubscription ready");
    }
});
ddp.on("added", message => {
    console.log(message.collection);
});

const myLoginParams = {
    user: {
        email: "user@example.com"
    },
    password: "hunter2"
};
const methodId = ddp.method("login", [myLoginParams]);
ddp.on("result", message => {
    if (message.id === methodId && !message.error) {
        console.log("Logged in!");
    }
});
```

## Developing

After cloning the repository, install `npm` dependencies with `npm install`.
Run `npm test` to run unit tests, or `npm run dev` to have `mocha` re-run your
tests when source or test files change.

To run e2e tests, first [install meteor](https://www.meteor.com/install). Then,
start the meteor server with `npm run start-meteor`. Finally, run
`npm run e2e-test` to run the e2e test suite, or `npm run e2e-dev` to have
`mocha` re-run the suite when source or test files change.

## Public API

### new DDP(options)

Creates a new DDP instance. After being constructed, the instance will
establish a connection with the DDP server and will try to maintain it open.

#### Arguments

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

- `autoConnect` **boolean** *optional* [default: `true`]: whether to establish
  the connection to the server upon instantiation. When `false`, one can
  manually establish the connection with the `connect` method.

- `autoReconnect` **boolean** *optional* [default: `true`]: whether to try to
  reconnect to the server when the socket connection closes, unless the closing
  was initiated by a call to the `disconnect` method.

- `reconnectInterval` **number** *optional* [default: 10000]: the interval in ms
  between reconnection attempts.

#### Returns

A new DDP instance, which is also an `EventEmitter` instance.

---

### DDP.method(name, params)

Calls a remote method.

#### Arguments

- `name` **string** *required*: name of the method to call.

- `params` **array** *required*: array of parameters to pass to the remote
  method. Pass an empty array if you do not wish to pass any parameters.

#### Returns

The unique `id` (string) corresponding to the method call.

#### Example usage

Server code:
```js
Meteor.methods({
    myMethod (param_0, param_1, param_2) {
        /* ... */
    }
});
```
Client code:
```js
const methodCallId = ddp.method("myMethod", [param_0, param_1, param_2]);
```

---

### DDP.sub(name, params)

Subscribes to a server publication.

#### Arguments

- `name` **string** *required*: name of the server publication.

- `params` **array** *required*: array of parameters to pass to the server
  publish function. Pass an empty array if you do not wish to pass any
  parameters.

#### Returns

The unique `id` (string) corresponding to the subscription call.

#### Example usage

Server code:
```js
Meteor.publish("myPublication", (param_0, param_1, param_2) {
    /* ... */
});
```
Client code:
```js
const subscriptionId = ddp.sub("myPublication", [param_0, param_1, param_2]);
```

---

### DDP.unsub(id)

Unsubscribes to a previously-subscribed server publication.

#### Arguments

- `id` **string** *required*: id of the subscription.

#### Returns

The `id` corresponding to the subscription call (not of much use, but I return
it for consistency).

---

### DDP.connect()

Connects to the ddp server. The method is called automatically by the class
constructor if the `autoConnect` option is set to `true` (default behaviour).
So there generally should be no need for the developer to call the method
themselves.

#### Arguments

None

#### Returns

None

---

### DDP.disconnect()

Disconnects from the ddp server by closing the `WebSocket` connection. You can
listen on the `disconnected` event to be notified of the disconnection.

#### Arguments

None

#### Returns

None

## Public events

### Connection events

- `connected`: emitted with no arguments when the DDP connection is
  established.

- `disconnected`: emitted with no arguments when the DDP connection drops.

### Subscription events

All the following events are emitted with one argument, the parsed DDP message.
Further details can be found [on the DDP spec
page](https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md).

- `ready`
- `nosub`
- `added`
- `changed`
- `removed`

### Method events

All the following events are emitted with one argument, the parsed DDP message.
Further details can be found [on the DDP spec
page](https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md).

- `result`
- `updated`
