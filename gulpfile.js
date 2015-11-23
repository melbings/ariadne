var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var del = require('del');
var gulp = require('gulp');
var replace = require('gulp-replace');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var yargs = require('yargs');
var zip = require('gulp-zip');

var VERSION = require('./package.json').version + (yargs.argv['dev'] ? '-dev' : '');

var path = {
    DEST: 'dist/',

    SRC_JS: 'src/app/js/App.js',
    DEST_JS: 'js/bundle.js',

    SRC_SASS: 'src/app/style.scss',

    STATIC: [
        {from: 'src/.htaccess', to: ''},
        {from: 'src/ariadne.jpg', to: ''},
        {from: 'src/index.html', to: ''},
        {from: 'src/app/index.html', to: 'app/'},
        {from: 'src/app/res/**/*', to: 'app/res/'},
        {from: 'node_modules/blockly-src/blockly_compressed.js', to: 'app/blockly/'},
        {from: 'node_modules/blockly-src/blocks_compressed.js', to: 'app/blockly/'},
        {from: 'node_modules/blockly-src/javascript_compressed.js', to: 'app/blockly/'},
        {from: 'node_modules/blockly-src/msg/js/en.js', to: 'app/blockly/'},
        {from: 'node_modules/blockly-src/media/*', to: 'app/blockly/blockly-media/'},
        {from: 'node_modules/font-awesome/css/font-awesome.min.css', to: 'app/res/css/'},
        {from: 'node_modules/jsinterpreter/acorn.js', to: 'app/jsinterpreter/'},
        {from: 'node_modules/jsinterpreter/interpreter.js', to: 'app/jsinterpreter/'},
        {from: 'node_modules/normalize.css/normalize.css', to: 'app/res/css/'}
    ]
};

gulp.task('default', ['clean'], function() {
    gulp.start('js', 'sass', 'static');
});

gulp.task('js', function () {
    if (yargs.argv['dev']) {
        browserify({
            entries: [path.SRC_JS],
            debug: true
        })
            .transform(babelify)
            .bundle()
            .pipe(source(path.DEST_JS))
            .pipe(replace('##VERSION##', VERSION))
            .pipe(buffer())
            .pipe(gulp.dest(path.DEST + 'app/'));
    } else {
        browserify({
            entries: [path.SRC_JS],
            debug: false
        })
            .transform(babelify)
            .bundle()
            .pipe(source(path.DEST_JS))
            .pipe(replace('##VERSION##', VERSION))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest(path.DEST + 'app/'));
    }
});

gulp.task('sass', function () {
    gulp.src(path.SRC_SASS)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(path.DEST + 'app/res/css/'));
});

gulp.task('static', function () {
    for (var i = 0; i < path.STATIC.length; i++) {
        var static_path = path.STATIC[i];
        var to = path.DEST + static_path.to;
        gulp.src(static_path.from).pipe(replace('##VERSION##', VERSION, {skipBinary: true})).pipe(gulp.dest(to));
    }
});

gulp.task('zip', function () {
    return gulp.src(path.DEST + 'app/**/*')
        .pipe(zip('ariadne_' + VERSION + '.zip'))
        .pipe(gulp.dest(path.DEST));
});

gulp.task('clean', function () {
    return del([
        path.DEST + '**/*'
    ]);
});
