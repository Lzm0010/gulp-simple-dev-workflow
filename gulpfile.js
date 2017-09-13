//========= VARIABLES ==========//

"use strict";

 const gulp = require('gulp'),
     concat = require('gulp-concat'),
     uglify = require('gulp-uglify'),
     rename = require('gulp-rename'),
       sass = require('gulp-sass'),
       csso = require('gulp-csso'),
   imagemin = require('gulp-imagemin'),
      cache = require('gulp-cache'),
       maps = require('gulp-sourcemaps'),
        del = require('del'),
     useref = require('gulp-useref'),
    replace = require('gulp-replace'),
browserSync = require('browser-sync').create();

const options = {
   src: 'src',
  dist: 'dist'
};


//========= GULP SCRIPTS ==========//
//gulp scripts command to concatenate, minify, and copy all of JS files
//into an all.min.js file that is copied to the dist/scripts folder.
gulp.task('scripts', function() {
  return gulp.src(`${options.src}/js/**/*.js`)
    .pipe(maps.init())
    .pipe(concat('global.js'))
    .pipe(uglify())
    .pipe(rename('all.min.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest(`${options.dist}/scripts`))
    .pipe(browserSync.stream());
});


//========= GULP STYLES ==========//
// gulp styles command to compile the project’s SCSS files into CSS,
// then concatenate and minify into an all.min.css file that is then copied to the dist/styles folder.
gulp.task('styles', function() {
  return gulp.src(`${options.src}/sass/global.scss`)
    .pipe(maps.init())
    .pipe(sass())
    .pipe(csso())
    .pipe(rename('all.min.css'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest(`${options.dist}/styles`))
    .pipe(browserSync.stream());
});


//========== GULP IMAGES =========//
//gulp images command to optimize the size of the project’s JPEG and PNG files,
//and then copy those optimized images to the dist/content folder.
gulp.task('images', function() {
  return gulp.src(`${options.src}/images/*.{jpg,png}`)
    .pipe(cache(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5})
    ])))
    .pipe(gulp.dest(`${options.dist}/content`));
});


//========= GULP ICONS ==========//
//optimize svg icons and add to icons folder
gulp.task('icons', function(){
  return gulp.src(`${options.src}/icons/**/*`)
    .pipe(cache(imagemin([
      imagemin.svgo({plugins: [{removeViewBox: true}] })
    ])))
    .pipe(gulp.dest(`${options.dist}/icons`));
});


//========= GULP HTML ==========//
//changes html to call new min css and js files
//and replaces all references to images folder to content folder
gulp.task('html', function(){
  return gulp.src(`${options.src}/index.html`)
    .pipe(useref())
    .pipe(replace('images/', 'content/'))
    .pipe(gulp.dest(options.dist))
    .pipe(browserSync.stream());
});


//========= GULP CLEAN==========//
//gulp clean command to delete all of the files and folders in the dist folder.
gulp.task('clean', function() {
  del(options.dist);
});


//========= GULP BROWSERSYNC ==========//
//refresh browser upon changes to js and sass
gulp.task('browserSync', function(){
  return browserSync.init({
    server: {
      baseDir: options.dist
    }
  })
});


//========= GULP WATCH ==========//
//continuously watch for changes to any .scss file.
//on change, gulp styles command is run and the files are compiled, concatenated, and minified to the dist folder.
gulp.task('watch', ['browserSync'], function() {
  gulp.watch([`${options.src}/sass/**/**/*.sass`, `${options.src}/sass/*.scss`], ['styles']);
  gulp.watch(`${options.src}/js/**/*.js`, ['scripts']);
});


//========= GULP BUILD ==========//
//gulp build command to run the scripts, styles, and images tasks
gulp.task('build', ['clean'], function(){
  gulp.start(['scripts', 'styles', 'images', 'icons']);
  return gulp.src(`${options.src}/index.html`)
    .pipe(useref())
    .pipe(replace('images/', 'content/'))
    .pipe(gulp.dest(options.dist));
});


//========= GULP ==========//
//gulp command to run the build task and serve project using a local web server.
gulp.task('default', ['build'], function(){
  gulp.start(['watch', 'browserSync']);
});
