import EventEmitter from "wolfy87-eventemitter";

export default class Socket extends EventEmitter {

    emit () {
        var args = arguments;
        setTimeout(() => {
            super.emit.apply(this, args);
        }, 0);
    }

    constructor (SocketConstructor, endpoint) {
        super();
        this.SocketConstructor = SocketConstructor;
        this.endpoint = endpoint;
    }

    send (object) {
        var message = JSON.stringify(object);
        this.rawSocket.send(message);
        // Emit a copy of the object, as the listener might mutate it.
        this.emit("message:out", JSON.parse(message));
    }

    connect () {

        this.rawSocket = new this.SocketConstructor(this.endpoint);

        /*
        *   The `open`, `error` and `close` events are simply proxy-ed to `_socket`.
        *   The `message` event is instead parsed into a js object (if possible) and
        *   then passed as a parameter of the `message:in` event
        */

        this.rawSocket.onopen = () => this.emit("open");
        this.rawSocket.onerror = (error) => this.emit("error", error);
        this.rawSocket.onclose = () => this.emit("close");
        this.rawSocket.onmessage = (message) => {
            var object;
            try {
                object = JSON.parse(message.data);
            } catch (ignore) {
                // Simply ignore the malformed message and return
                return;
            }
            // Outside the try-catch block as it must only catch JSON parsing
            // errors, not errors that may occur inside a "message:in" event handler
            this.emit("message:in", object);
        };

    }

}
