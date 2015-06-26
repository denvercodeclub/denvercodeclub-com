/**
 * Define extensions
 */
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	compass = require('gulp-compass'),
	filesCached = require('gulp-cache'),
	filesChanged = require('gulp-changed'),
	jsHint = require('gulp-jshint'),
	livereload = require('gulp-livereload'),
	notify = require('gulp-notify'),
	map = require('map-stream'),
	bower = require('gulp-bower'),
	jsMinify = require('gulp-uglify'),
    cssMinify = require('gulp-minify-css'),
    joinFiles = require('gulp-concat'),
	watching = false,
	rename = require('gulp-rename'),
	files = {
		all: {
			scss: 'public/assets/scss/**/*.scss',
			css: 'public/assets/css/*.css',
			js: {
				custom: 'public/assets/js/**/*.js',
				vendor: 'public/assets/vendor/**/*.min.js'
			},
			img: 'public/assets/img/**/*'
		},
		dist: {
			css: 'public/assets/dist/styles.min.css',
			js: 'public/assets/dist/scripts.min.css'
		}
	},
	paths = {
		scss: 'public/assets/scss/',
		css: 'public/assets/css/',
		js: 'public/assets/js/',
		img: 'public/assets/img/',
		bower: 'public/assets/vendor/',
		dist: 'public/assets/dist/'
	};


/**
 * Development tasks
 */

// Compile Sass via Compass and refresh styles in browser
gulp.task('compileSass', function() {
	return gulp.src(files.all.scss)
		.pipe(
			compass({
				css: paths.css,
				sass: paths.scss,
				image: paths.img,
				comments: false,
				require: ['susy', 'normalize-scss']
			})
			.on('error', notify.onError({
				message: 'Sass failed. Check console for errors'
			}))
		)
		.pipe(gulp.dest(paths.css))
		.pipe(livereload())
		.pipe(notify('Compass successfully compiled'));
});

// Error checking scripts
gulp.task('lintScripts', function() {
	return gulp.src(files.all.js.custom)
		.pipe(jsHint())
		.pipe(jsHint.reporter('default'))
		.on('error', notify.onError(function(file) {
			if (!file.jshint.success) {
				return 'JSHint failed. Check console for errors';
			}
		}));
});

// Install Bower components
gulp.task('runBower', function() {
	return bower(paths.bower)
		.pipe(gulp.dest(paths.bower));
});

// Set watch mode
gulp.task('setWatchStatus', function() {
	watching = true;
});


/**
 * Build tasks
 */

// Process style files
gulp.task('readyStyles', function() {
	gulp.src(files.all.css)
		.pipe(cssMinify())
		.pipe(rename('styles.min.css'))
		.pipe(gulp.dest(paths.dist));
});

// Process script files
gulp.task('readyScripts', function() {
	gulp.src(paths.js + 'scripts.js')
		.pipe(joinFiles('scripts.min.js'))
		.pipe(jsMinify())
		// .pipe(rename('scripts.min.js'))
		.pipe(gulp.dest(paths.dist));
});


/**
 * Run tasks
 */
gulp.task('watch', ['setWatchStatus'], function() {
	gulp.watch(files.all.scss, ['compileSass']);
	gulp.watch(files.all.js.custom, ['lintScripts']);
	livereload.listen();
});

gulp.task('build', ['readyStyles', 'readyScripts']);

gulp.task('install', ['runBower']);

// Default task
gulp.task('default', ['compileSass', 'lintScripts']);
