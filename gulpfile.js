//gulpjs config

var
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    preprocess = require('gulp-preprocess'),
    newer = require('gulp-newer'),
    del = require('del'),
    pkg = require('./package.json'),
    sass = require('gulp-sass'),
    htmlClean = require('gulp-htmlclean'),
    size = require('gulp-size')

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
    css = {
        in: source + 'scss/main.sass',
        watch: [source + 'scss/**/*'],
        out: dest + 'css/',
        sassOpts:{
            outputStyle:'nested',
            imagePath: '../imaages',
            precision: 3,
            errLogToConsole: true
        }
    },
    images = {
        in: source + 'images/*.*',
        out: dest + 'images/'
    };

//show build type
console.log(pkg.name + " " + pkg.version + ',' + (devBuild ? 'development' : 'production').toString());


//build sass
gulp.task('sass', function(){
    return gulp.src(css.in)
        .pipe(sass(css.sassOpts))
        .pipe(gulp.dest(css.out))
})

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
        page = page
            .pipe(size({title: 'Html in'}))
            .pipe(htmlClean())
            .pipe(size({title: 'Html out'}));
    }

    return page.pipe(gulp.dest(html.out));
});

//default task
gulp.task('default', ['html', 'mani', 'sass'], function () {
    //html watch
    gulp.watch(html.watch, ['html']);

    //sass watch
    gulp.watch(css.watch, ['sass']);

    //images watch
    gulp.watch(images.in, ['mani']);
});