//gulpjs config

var
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    newer = require('gulp-newer'),
    del = require('del');
    pkg = require('./package.json');

var
    devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production'),
    source = 'source/',
    dest = 'build/';
    images = {
        in: source + 'images/*.*',
        out: dest + 'images/'
    };

//show build type
console.log(pkg.name + " " + pkg.version + ',' + (devBuild ? 'development' : 'production').toString());


//clean task
gulp.task('clean', function () {
    del([
        dest + '*'
    ])
});

//manage images
gulp.task('mani', function () {
    return gulp.src(images.in)
        .pipe(newer(images.out))
        .pipe(imagemin())
        .pipe(gulp.dest(images.out));
});

//default task
gulp.task('default', ['mani'], function () {
    //gulp watch
    gulp.watch(images.in, ['mani']);
});