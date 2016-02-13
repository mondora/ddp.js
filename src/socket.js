import EventEmitter from "wolfy87-eventemitter";

export default class Socket extends EventEmitter {

    emit () {
        setTimeout(super.emit.bind(this, ...arguments), 0);
    }

    constructor (SocketConstructor, endpoint) {
        super();
        this.SocketConstructor = SocketConstructor;
        this.endpoint = endpoint;
    }

    send (object) {
        const message = JSON.stringify(object);
        this.rawSocket.send(message);
        // Emit a copy of the object, as the listener might mutate it.
        this.emit("message:out", JSON.parse(message));
    }

    open () {

        this.rawSocket = new this.SocketConstructor(this.endpoint);

        /*
        *   Calls to `onopen`, `onerror` and `onclose` directly trigger the
        *   `open`, `error` and `close` events on the `Socket` instance.
        *   Calls to `onmessage` instead trigger a `message:in` event on the
        *   `Socket` instance only once the message (first parameter to
        *   `onmessage`) has been successfully parsed into a javascript object.
        */

        this.rawSocket.onopen = () => this.emit("open");
        this.rawSocket.onerror = error => this.emit("error", error);
        this.rawSocket.onclose = () => this.emit("close");
        this.rawSocket.onmessage = message => {
            var object;
            try {
                object = JSON.parse(message.data);
            } catch (ignore) {
                // Simply ignore the malformed message and return
                return;
            }
            // Outside the try-catch block as it must only catch JSON parsing
            // errors, not errors that may occur inside a "message:in" event
            // handler
            this.emit("message:in", object);
        };

    }

    close () {
        this.rawSocket.close();
    }

}
