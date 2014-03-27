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

gulp.task("reload_target", function () {
	gulp.src("test/ddp.js").pipe(plugins.livereload(lrServer));
});

gulp.task("reload_tests", function () {
	gulp.src("test/unit/*.unit.js")
		.pipe(plugins.concat("ddp.unit.js"))
		.pipe(gulp.dest("test/"))
		.pipe(plugins.livereload(lrServer));
});

gulp.task("default", function () {
	dvServer.listen(8080);
	lrServer.listen(35729);
	gulp.watch("ddp.js", ["reload_target"]);
	gulp.watch("test/unit/**/*.unit.js", ["reload_tests"]);
});
