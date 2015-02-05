var pkg 	= require('./package.json'),
	gulp 	= require('gulp'),
	jshint 	= require('gulp-jshint'),
	concat 	= require('gulp-concat'),
	uglify 	= require('gulp-uglify'),
	rename	= require('gulp-rename');
	
var paths = {
	scripts: ['./src/**/*.js'],
	dist: './dist/'
};

gulp.task('test', function () {
	gulp.src( paths.scripts ).pipe(jshint());
});

gulp.task('compile-scripts', function () {
	return gulp.src( paths.scripts )
		.pipe(jshint())
		.pipe(concat( pkg.name + '.js' ))
		.pipe(gulp.dest( paths.dist ));
});

gulp.task('dist', function () {
	return gulp.src( paths.scripts )
		.pipe(jshint())
		.pipe(concat( pkg.name + '.js' ))
		.pipe(gulp.dest(paths.dist))
		.pipe(rename( pkg.name + '.min.js' ))
		.pipe(uglify())
		.pipe(gulp.dest(paths.dist));
});

gulp.task('watch', function () {
	gulp.watch(paths.scripts, ['test', 'compile-scripts']);
});

gulp.task('default', ['test', 'compile-scripts']);