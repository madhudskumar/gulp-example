//gulpjs config

var
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    preprocess = require('gulp-preprocess'),
    newer = require('gulp-newer'),
    del = require('del'),
    pkg = require('./package.json'),
    htmlClean = require('gulp-htmlclean')

var
    devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production'),
    source = 'source/',
    dest = 'build/',
    html = {
        in: source + '*.html',
        watch: [source + '*.html', source + 'template/**/*.html'],
        out: dest,
        context:{
            devBuild : devBuild,
            author : pkg.author,
            version : pkg.version 
        }
    },
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

//html task
gulp.task('html', function(){
    var page =  gulp.src(html.in).pipe(preprocess({context : html.context}))
    
    if(!devBuild){
        page = page.pipe(htmlClean());
    }

    return page.pipe(gulp.dest(html.out));
});

//default task
gulp.task('default', ['html', 'mani'], function () {
    //html watch
    gulp.watch(html.watch, ['html']);

    //images watch
    gulp.watch(images.in, ['mani']);
});