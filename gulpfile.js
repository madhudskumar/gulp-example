//gulpjs config

var
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    newer = require('gulp-newer'),
    del = require('del');
    

var
    source = 'source/',
    dest = 'build/';
    images = {
        in: source + 'images/*.*',
        out: dest + 'images/'
    }

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
})

//default task
gulp.task('default', function () {
    
});