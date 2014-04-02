var gulp	= require("gulp");
var tinyLr	= require("tiny-lr");
var static	= require("node-static");
var http	= require("http");
var plugins	= require("gulp-load-plugins")();

var lrServer = tinyLr();
var dvServer = http.createServer(function (req, res) {
	var stServer = new static.Server("./test/", {cache: false});
	req.on("end", function () {
		stServer.serve(req, res);
	});
	req.resume();
});

gulp.task("_reload_target", function () {
	gulp.src("test/ddp.js")
		.pipe(plugins.livereload(lrServer));
});

gulp.task("_reload_tests", function () {
	gulp.src("test/unit/*.unit.js")
		.pipe(plugins.concat("ddp.unit.js"))
		.pipe(gulp.dest("test/"))
		.pipe(plugins.livereload(lrServer));
});

gulp.task("dev", function () {
	dvServer.listen(8080);
	lrServer.listen(35729);
	gulp.watch("ddp.js", ["_reload_target"]);
	gulp.watch("test/unit/**/*.unit.js", ["_reload_tests"]);
});

gulp.task("test-node", function () {
	gulp.src("test/ddp.unit.js")
		.pipe(plugins.mocha({reporter: "nyan"}));
});

gulp.task("test-browser", function () {
	dvServer.listen(8080);
	var options = {
		url: "http://localhost:8080"
	};
	gulp.src("./test/index.html")
		.pipe(plugins.open("", options));
});

gulp.task("default", function () {
	console.log("");
	console.log("Usage: gulp [TASK]");
	console.log("");
	console.log("Available tasks:");
	console.log("  test-node        run tests with mocha");
	console.log("  test-browser     run tests in the browser");
	console.log("  dev              set up dev environment with auto-recompiling and testing");
	console.log("");
});
