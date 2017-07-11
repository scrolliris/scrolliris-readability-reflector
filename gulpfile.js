'use strict';

var fs = require('fs')
  , pkg = require('./package.json')
  ;

var gulp = require('gulp')
  , babelify = require('babelify')
  , browserify = require('browserify')
  , buffer = require('vinyl-buffer')
  , clean = require('gulp-clean')
  , minify = require('gulp-clean-css')
  , env = require('gulp-env')
  , pump = require('pump')
  , rename = require('gulp-rename')
  , source = require('vinyl-source-stream')
  , uglify = require('gulp-uglify')
  , util = require('gulp-util')
  , sequence = require('run-sequence')
  , sourcemaps = require('gulp-sourcemaps')
  , stylus = require('gulp-stylus')
  , tapColorize = require('tap-colorize')
  , tape = require('gulp-tape')
  , tapeRun = require('tape-run')
  ;


// -- [shared tasks]

gulp.task('env', function(done) {
  var dotenv_file = '.env';
  if (fs.existsSync(dotenv_file)) {
    return gulp.src(dotenv_file)
      .pipe(env({
        file: dotenv_file
      , type: '.ini'
      }));
  } else {
    return done();
  }
})

gulp.task('clean', function() {
  return gulp.src([
      './dist/*'
    , './test/build/*.js'
    , './coverage/*'
    ], {read: false})
    .pipe(clean());
});


// -- [build tasks]

var runBrowserify = function(inputFile, outputFile) {
  return function() {
    return browserify({
        entries: './lib/' + inputFile
      , debug: false
      })
      .transform('babelify', {
        presets: ['es2015']
      , sourceMapsAbsolute: true
      })
      .bundle()
      .pipe(source(outputFile))
      .pipe(buffer())
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .on('error', util.log)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/'));
  };
};

var runUglify = function(filename) {
  return function() {
    return pump([
        gulp.src(['./dist/' + filename])
      , uglify()
      , rename({suffix: '.min'})
      , gulp.dest('./dist/')
      ]);
  };
};

var prefix = 'scrolliris-readability-'

gulp.task('build:browserify:widget', ['env'],
  runBrowserify('widget.js', prefix + 'reflector-browser.js'));

gulp.task('build:browserify:canvas', ['env'],
  runBrowserify('canvas.js', prefix + 'reflector-browser-canvas.js'));

gulp.task('build:compileCSS:canvas', function () {
  return gulp.src('./lib/canvas.styl')
    .pipe(stylus())
    .pipe(rename(function(file) {
      file.basename = prefix + 'reflector-browser-canvas';
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build:uglify:widget', ['env'],
  runUglify(prefix + 'reflector-browser.js'));

gulp.task('build:uglify:canvas', ['env'],
  runUglify(prefix + 'reflector-browser-canvas.js'));

gulp.task('build:minify:canvas', ['env'], function () {
  return pump([
      gulp.src(['./dist/' + prefix + 'reflector-browser-canvas.css'])
    , sourcemaps.init({
        loadMaps: true
      })
    , minify({compatibility: 'ie8'})
    , rename({suffix: '.min'})
    , sourcemaps.write('./')
    , gulp.dest('./dist')
    ]);
});

gulp.task('build:widget', function() {
  return sequence(
    'build:browserify:widget'
  , 'build:uglify:widget'
  );
});

gulp.task('build:canvas', function() {
  return sequence(
    'build:browserify:canvas'
  , 'build:uglify:canvas'
  , 'build:compileCSS:canvas'
  , 'build:minify:canvas'
  );
});

gulp.task('build', ['build:widget', 'build:canvas']);


// -- [test tasks]

// unit tests
gulp.task('test:unit:clean', function() {
  return gulp.src(['./test/build/unit-*.js'], {read: false})
    .pipe(clean());
});

gulp.task('test:unit:build', function() {
  return browserify({
      entries: './test/unit/index.js'
    , debug: true
    })
    .transform('babelify', {
      presets:            ['es2015']
    , sourceMapsAbsolute: true
    })
    .bundle()
    .pipe(source('unit-tests.js'))
    .pipe(buffer())
    .on('error', util.log)
    .pipe(gulp.dest('./test/build/'));
});

gulp.task('test:unit:run', function() {
  return gulp.src(['test/build/unit-tests.js'])
    .pipe(tape({
      reporter: tapColorize()
    }));
});

gulp.task('test:unit', function() {
  return sequence('test:unit:clean', 'test:unit:build', 'test:unit:run');
});

// functional tests
gulp.task('test:functional:clean', function() {
  return gulp.src(['./test/build/functional-*.js'], {read: false})
    .pipe(clean());
});

// cat ./test/build/functional-tests.js | ./node_modules/.bin/tape-run
gulp.task('test:functional:build', function() {
  return browserify({
      entries: './test/functional/index.js'
    , debug:   true
    })
    .transform('babelify', {
      presets:            ['es2015']
    , sourceMapsAbsolute: true
    })
    .bundle()
    .pipe(source('functional-tests.js'))
    .pipe(buffer())
    .on('error', util.log)
    .pipe(gulp.dest('./test/build/'));
});

// run tests on electron
gulp.task('test:functional:run', function() {
  return browserify({
      entries: './test/functional/index.js'
    , debug:   true
    })
    .transform('babelify', {
      presets:            ['es2015']
    , sourceMapsAbsolute: true
    })
    .bundle()
    .pipe(tapeRun())
    .on('error', util.log)
    .pipe(process.stdout);
});

gulp.task('test:functional', function() {
  return sequence('test:functional:run');
});

gulp.task('test:clean', ['test:unit:clean', 'test:functional:clean']);
gulp.task('test',  ['test:unit', 'test:functional']);


// -- [main tasks]

gulp.task('default', function() {
  var nodeEnv = process.env.NODE_ENV || 'production';
  console.log('» gulp:', nodeEnv);

  return sequence('clean', 'build');
});
