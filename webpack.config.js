module.exports = {
    entry: "./src/ddp.js",
    output: {
        libraryTarget: "var",
        library: "DDP",
        path: __dirname + "/dist",
        filename: "ddp.js"
    },
    externals: {
        "wolfy87-eventemitter": "EventEmitter"
    }
};
