//gulpjs config

var
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    preprocess = require('gulp-preprocess'),
    newer = require('gulp-newer'),
    del = require('del'),
    pkg = require('./package.json'),
    imacss = require('gulp-imacss'),
    pleeease = require('gulp-pleeease'),
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
            outputStyle:'compressed',
            imagePath: '../images',
            precision: 3,
            errLogToConsole: true
        },
        pleeeaseOpts:{
            autoprefixer:{ browsers: ['last 2 versions', '>2']},
            rem:['16px'],
            pseudoElements: true,
            mqpacker: true,
            minifier: !devBuild
        }
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



//fonts
gulp.task('fonts', function(){
    return gulp.src(fonts.in)
        .pipe(newer(fonts.out))
        .pipe(gulp.dest(fonts.out))
})

//build sass
gulp.task('sass', ['imguri'], function(){
    return gulp.src(css.in)
        .pipe(sass(css.sassOpts))
        .pipe(size({title: 'CSS in'}))
        .pipe(pleeease(css.pleeeaseOpts))
        .pipe(size({title: 'CSS out'}))
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
gulp.task('default', ['html', 'mani', 'sass', 'fonts'], function () {
    //html watch
    gulp.watch(html.watch, ['html']);

    //sass watch
    gulp.watch([css.watch, imguri.in], ['sass']);

    //fonts watch
    gulp.watch(fonts.in, ['fonts']);

    //images watch
    gulp.watch(images.in, ['mani']);
});