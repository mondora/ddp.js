[![Build Status](https://travis-ci.org/mondora/ddp.js.svg?branch=master)](https://travis-ci.org/mondora/ddp.js)
[![Coverage Status](https://coveralls.io/repos/mondora/ddp.js/badge.png)](https://coveralls.io/r/mondora/ddp.js)
[![Code Climate](https://codeclimate.com/github/mondora/ddp.js.png)](https://codeclimate.com/github/mondora/ddp.js)

#ddp.js

A javascript ddp client that runs both in the browser and in node.

##Why

This is the foundation of a project I'm working on to decouple meteor's client and server sides. It allows the to connect through ddp to a meteor server, and use all of the wonderful facilities meteor provides.

The project was inspired by [ddp-browser-client](https://github.com/bmcmahen/ddp-browser-client), but I decided to re-implement the library from scratch to get a better understanding of the ddp protocol and to adapt it to run on node as well.

##Install

You can install the package for server-side usage via npm:

	npm install ddp.js

For client-side usage, you can use bower:

	bower install ddp.js

or you can just clone the repository and add `ddp.js` to your project.


##Example usage

```javascript
var options = {
	endpoint: "http://localhost:3000/websocket",
	SocketConstructor: WebSocket
};
var ddp = new DDP(options);

ddp.on("connected", function () {
	console.log("Connected");

	ddp.sub("myCollection");
	ddp.on("added", function (data) {
		console.log(data.collection);
	});

	var myLoginParams = { ... };
	ddp.method("login", [myLoginParams], function (err, res) {
		if (err) throw err;
		console.log("Logged in!");
	});
});
```

##Tests

To run tests clone the repository

    git clone https://github.com/mondora/ddp.js
	cd ddp.js

install dependencies

	npm install

and run tests

	npm run test-node
	npm run test-browser


##API





###new DDP(options)

Returns a new DDP instance.

Available options are:

- `endpoint`: the location of the websocket server. Its
  format depends on the type of socket you are using.

- `SocketConstructor`: the constructor function that will be
  used to construct the socket. Meteor (currently the only
  DDP server available) supports websockets and SockJS
  sockets.  So, practically speaking, this means that on the
  browser you can use either the browser's native WebSocket
  constructor or the SockJS constructor provided by the
  SockJS library.  On the server you can use whichever
  library implements the websocket protocol (e.g.
  faye-websocket).

- `do_not_autoconnect`: pass true if you do not wish to have
  the DDP instance to automatically connect itself to the
  server upon instantiation.  In that case you'll need to
  explicitly call the connect method to do so.

- `do_not_autoreconnect`: pass true if you do not wish to
  have the DDP instance try reconnecting itself.





###DDP.connect()

Tries to connect to the DDP server.  To connect to a DDP
server a "connect" message needs to be sent.  This function
does not send the message itself.  Instead, it opens a
socket connection to the server and delegates sending the
message to the "onopen" event handler of the socket
instance.

`connect` also sets the readyState property of the DDP instance
to 0 (connecting).
If the user tries to send DDP messages before the connection
is open (readyState equals 1), those messages get queued up
and sent, in order, once the connection is established.





###DDP.method(name, params, onResult, onUpdated)

Calls a remote method and registers callbacks for the
"result" and "updated" responses.

- `name`: name of the method to call.

- `params`: parameters to pass to the remote method. Pass an
  empty array if you do not wish to pass any parameters.

- `onResult`: callback for the "result" message
  corresponding to the method invocation.

- `onUpdated`: callback for the "updated" message
  corresponding to the method invocation.





###DDP.sub(name, params, onReady)

Subscribes the current DDP instance to a server publication.

- `name`: name of the server publication.

- `params`: parameters to pass to the server publish
  function. Pass an empty array if you do not wish to pass
  any parameters.

- `onReady`: callback for the "ready" message corresponding
  to this subscription.





###DDP.unsub(id)

Unsubscribes the current DDP instance to a server
publication to which it was subscribed.

- `id`: id of the subscription.





###DDP.on(name, handler)

Registers a callback for the specified event. Built-in
events are: connected, failed, error, added, removed,
changed, socket_close, socket_error.

- `name`: name of the event.

- `handler`: handler for the event.





###DDP.off(name, handler)

Deregisters a previously registered callback for the
specified event.

- `name`: name of the event.

- `handler`: handler for the event.





##DDP events

###"error"

###"connected"

###"failed"

###"socket_close"

###"socket_error"

###"added"

###"changed"

###"removed"
