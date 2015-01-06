var gulp  = require("gulp");
var cover = require("gulp-coverage");
var mocha = require("gulp-mocha");
var gutil = require("gulp-util");

gulp.task("coverage", function () {
    return gulp.src("test/**/*.js")
        .pipe(cover.instrument({
            pattern: ["app/**/*.js"]
        }))
        .pipe(mocha())
        .on("error", gutil.log)
        .pipe(cover.gather())
        .pipe(cover.format())
        .pipe(gulp.dest("test/coverage"));
});

gulp.task("default", ["coverage"], function () {
    gulp.watch(["app/**/*.js", "test/**/*.js"], ["coverage"]);
});
