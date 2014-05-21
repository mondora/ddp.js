var gulp	= require("gulp");
var concat	= require("gulp-concat");

gulp.task("default", function () {
	gulp.src("test/unit/*.unit.js")
		.pipe(concat("ddp.unit.js"))
		.pipe(gulp.dest("test/"));
});
