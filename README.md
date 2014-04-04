#ddp.js

A javascript ddp client that runs both in the browser and in node.

##WHY

This is the foundation of a project I'm working on to decouple meteor's client and server sides. It allows the to connect through ddp to a meteor server, and use all of the wonderful facilities meteor provides.

The project was inspired by [ddp-browser-client](https://github.com/bmcmahen/ddp-browser-client), but I decided to re-implement the library from scratch to get a better understanding of the ddp protocol and to adapt it to run on node as well.

##TESTS

Clone the repository

    git clone https://github.com/mondora/ddp.js
	cd ddp.js

Install dependencies

	npm install

Run tests

	npm run test-node
	npm run test-browser


##API





###new DDP(url, Socket, dontConnect, dontReconnect)

Returns a new DDP instance.

- `url`: the location of the websocket server. Its
  format depends on the type of socket you are using.

- `Socket`: the constructor function that will be
  used to construct the socket. Meteor (currently the only
  DDP server available) supports websockets and SockJS
  sockets.  So, practically speaking, this means that on the
  browser you can use either the browser's native WebSocket
  constructor or the SockJS constructor provided by the
  SockJS library.  On the server you can use whichever
  library implements the websocket protocol (e.g.
  faye-websocket).

- `dontConnect`: pass true if you do not wish to have
  the DDP instance to automatically connect itself to the
  server upon instantiation.  In that case you'll need to
  explicitly call the connect method to do so.

- `dontReconnect`: pass true if you do not wish to
  have the DDP instance try reconnecting itself.





###DDP.connect()

Tries to connect to the DDP server.  To connect to a DDP
server a "connect" message needs to be sent.  This function
does not send the message itself.  Instead, it opens a
socket connection to the server and delegates sending the
message to the "onopen" event handler of the socket
instance.





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
