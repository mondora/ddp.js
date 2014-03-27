var gulp	= require("gulp");
var tinyLr	= require("tiny-lr");
var static	= require("node-static");
var http	= require("http");
var plugins	= require("gulp-load-plugins")();

var lrServer = tinyLr();
var dvServer = http.createServer(function (req, res) {
	var stServer = new static.Server("./spec/", {cache: false});
	req.on("end", function () {
		stServer.serve(req, res);
	});
	req.resume();
});

gulp.task("reload_target", function () {
	gulp.src("spec/ddp.js").pipe(plugins.livereload(lrServer));
});

gulp.task("reload_tests", function () {
	gulp.src("spec/ddp.spec.js").pipe(plugins.livereload(lrServer));
});

gulp.task("default", function () {
	dvServer.listen(8080);
	lrServer.listen(35729);
	gulp.watch("ddp.js", ["reload_target"]);
	gulp.watch("spec/**/*.js", ["reload_tests"]);
});
