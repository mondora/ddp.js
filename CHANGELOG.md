## 2.1.0 (February 23, 2016)

Internal API change: made `Socket.emit` synchronous.

## 2.0.1 (February 14, 2016)

Fixed npm distribution (`lib/` was not published being in `.gitignore`).

## 2.0.0 (February 14, 2016)

### Breaking changes

* Distribute as individual modules in `lib` instead of bundle in `dist`. Should
  not break node consumers. Could break browserify and webpack consumers.
  Certainly breaks bower consumers (bower support has been removed)

### New features

* Added method to disconnect
* Added options to control auto-connect and auto-reconnect behaviour. As it
  turns out they could indeed be useful, for instance when one wants to simulate
  a connection scenario (e.g. in stress tests) and needs to have fine-grained
  control on the lifecycle of the connection.

## 1.1.0 (July 11, 2015)

Moved the code to use ES6. In the process, I also refactored it a bit to use
less "exotic" patterns, but there _should be_ no breaking changes to the public
API.

Two enhancements:

1.  a `status` property (`connected` / `disconnected`) is now available on the
    instance
1.  it's now possible to call methods `sub`, `unsub`, and `method` right after
    creating the instance. Calls are queued and performed after the `connected`
    event

## 1.0.0 (January 11, 2015)

The library has been rewritten from scratch and its scope somewhat reduced. The
purpose of the rewrite, other than simplification, was to implement better
under-the-hood APIs to allow more flexibility.

The biggest change is that the library no longer handles method and
subscription calls. I.e., it doesn't take anymore callbacks to the `method` and
`sub` methods.  Rather it returns the `id` of those calls, and lets the
consumer handle the `result`, `updated`, `ready`, `nosub` events related to
those calls. My plan is to bake this functionality directly into Asteroid,
which sometimes need to have lower level access to those events.

Some options have been removed, namely `do_not_autoconnect`,
`do_not_autoreconnect` and `socket_intercept_function`. The functionalities
provided by the first two options can be recreated, but it requires meddling
with the library internals (one has to re-define the `_init` method). I figured
this wouldn't be a problem since I've never found a use case for them. The
third functionality - i.e. intercepting the socket `send` method and doing
something with the message that has been sent - is easily recreated by
listening to the `message:in`, `message:out` private events of the `_socket`
property of a DDP instance. Other private events are available on the property,
making it easier to monitor and gather metrics about the WebSocket.
