//gulpjs config
var
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    preprocess = require('gulp-preprocess'),
    deporder = require('gulp-deporder'),
    concat = require('gulp-concat'),
    newer = require('gulp-newer'),
    del = require('del'),
    pkg = require('./package.json'),
    imacss = require('gulp-imacss'),
    pleeease = require('gulp-preprocess'),
    sass = require('gulp-sass'),
    jshint = require('gulp-jshint'),
    htmlClean = require('gulp-htmlclean'),
    size = require('gulp-size'),
    strip = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),
    browsersync = require('browser-sync');

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

    syncOpts = {
        server:{
            baseDir:dest,
            index:'index.html',
        },
        open:false,
        notify:true
    },

    imguri = {
        in: source + 'images/inline/*',
        out: source + 'scss/images/',
        fileName: '_datauri.scss',
        namespace: 'img'
    },

    css = {
        in: source + 'scss/main.scss',
        watch: [source + 'scss/**/*', '!' + imguri.out + imguri.fileName],
        out: dest + 'css/',
        sassOpts:{
            outputStyle:'nested',
            imagePath: '../images',
            precision: 3,
            errLogToConsole: true
        },
        pleeeaseOpts:{
            autoprefixer:{ browsers: ['last 2 versions', '> 2%']},
            rem: ['16px'],
            pseudoElements: true,
            mqpacker: true,
            minifier: !devBuild
        }
    },

    js = {
        in: source + 'js/**/*',
        out:dest + 'js/',
        fileName:'main.js'
    },

    fonts = {
        in: source + 'fonts/*.*',
        out: css.out + 'fonts/'
    }

    images = {
        in: source + 'images/*.*',
        out: dest + 'images/'
    };

//show build type
console.log(pkg.name + " " + pkg.version + ',' + (devBuild ? 'development' : 'production').toString());


//imaguri tast
gulp.task('imguri', function(){
    return gulp.src(imguri.in)
        .pipe(imagemin())
        .pipe(imacss(imguri.fileName, imguri.namespace))
        .pipe(gulp.dest(imguri.out))
})

//js task
gulp.task('jsmin', function () {
    if(devBuild){
        return gulp.src(js.in)
            .pipe(newer(js.out))
            .pipe(jshint())
            .pipe(jshint.reporter('default'))
            .pipe(jshint.reporter('fail'))
            .pipe(gulp.dest(js.out));
    }else{
        del([
            dest + 'js/*'
        ]);
        return gulp.src(js.in)
            .pipe(deporder())
            .pipe(concat(js.fileName))
            .pipe(size({title: 'js in'}))
            .pipe(strip())
            .pipe(uglify())
            .pipe(size({title: 'js out'}))
            .pipe(gulp.dest(js.out))
    }
})

//fonts
gulp.task('fonts', function(){
    return gulp.src(fonts.in)
        .pipe(newer(fonts.out))
        .pipe(gulp.dest(fonts.out))
})

//browser-sync
gulp.task('browsersync', function () {
    browsersync(syncOpts);
})

//build sass
gulp.task('sass', ['imguri'], function(){
    return gulp.src(css.in)
        .pipe(sass(css.sassOpts))
        .pipe(size({title: 'CSS in'}))
        .pipe(pleeease(css.pleeeaseOpts))
        .pipe(size({title: 'CSS out'}))
        .pipe(gulp.dest(css.out))
        .pipe(browsersync.reload({stream:true}))
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
gulp.task('default', ['html', 'mani', 'sass', 'fonts', 'jsmin' , 'browsersync'], function () {
    //html watch
    gulp.watch(html.watch, ['html', browsersync.reload]);

    //js watch
    gulp.watch(js.in, ['jsmin', browsersync.reload]);

    //sass watch
    gulp.watch([css.watch, imguri.in], ['sass']);

    //fonts watch
    gulp.watch(fonts.in, ['fonts']);

    //images watch
    gulp.watch(images.in, ['mani']);
});