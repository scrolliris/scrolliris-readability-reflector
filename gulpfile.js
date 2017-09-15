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
      './dst/*'
    , './tmp/**/*'
    , './coverage/*'
    ], {read: false})
    .pipe(clean());
});


// -- [build tasks]

var runBrowserify = function(inputFile, outputFile) {
  return function() {
    return browserify({
        entries: './src/' + inputFile
      , debug: false
      })
      .transform('babelify', {
        presets: ['es2015']
      , sourceMapsAbsolute: true
      })
      .bundle()
      .pipe(source(outputFile))
      .pipe(buffer())
      .on('error', util.log)
      .pipe(gulp.dest('./dst/'));
  };
};

var runUglify = function(filename) {
  return function() {
    return pump([
        gulp.src(['./dst/' + filename])
      , sourcemaps.init({
          loadMaps: true
        })
      , uglify()
      , rename({suffix: '.min'})
      , sourcemaps.write('./')
      , gulp.dest('./dst/')
      ]);
  };
};

var prefix = 'scrolliris-readability-'

gulp.task('build:browserify:index', ['env'],
  runBrowserify('index.js', prefix + 'reflector.js'));

gulp.task('build:browserify:browser', ['env'],
  runBrowserify('browser.js', prefix + 'reflector-browser.js'));

gulp.task('build:browserify:canvas', ['env'],
  runBrowserify('canvas.js', prefix + 'reflector-canvas.js'));

gulp.task('build:compileCSS:canvas', function () {
  return gulp.src('./src/canvas.styl')
    .pipe(stylus())
    .pipe(rename(function(file) {
      file.basename = prefix + 'reflector-canvas';
    }))
    .pipe(gulp.dest('./dst/'));
});

gulp.task('build:uglify:index', ['env'],
  runUglify(prefix + 'reflector.js'));

gulp.task('build:uglify:browser', ['env'],
  runUglify(prefix + 'reflector-browser.js'));

gulp.task('build:uglify:canvas', ['env'],
  runUglify(prefix + 'reflector-canvas.js'));

gulp.task('build:minify:canvas', ['env'], function () {
  return pump([
      gulp.src(['./dst/' + prefix + 'reflector-canvas.css'])
    , sourcemaps.init({
        loadMaps: true
      })
    , minify({compatibility: 'ie8'})
    , rename({suffix: '.min'})
    , sourcemaps.write('./')
    , gulp.dest('./dst')
    ]);
});

gulp.task('build:index', function() {
  return sequence(
    'build:browserify:index'
  , 'build:uglify:index'
  );
});

gulp.task('build:browser', function() {
  return sequence(
    'build:browserify:browser'
  , 'build:uglify:browser'
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

gulp.task('build', ['build:browser', 'build:index', 'build:canvas']);


// -- [test tasks]

// unit tests
gulp.task('test:unit:clean', function() {
  return gulp.src(['./tmp/build/test/unit-*.js'], {read: false})
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
    .pipe(gulp.dest('./tmp/build/test/'));
});

gulp.task('test:unit:run', function() {
  return gulp.src(['tmp/build/test/unit-tests.js'])
    .pipe(tape({
      reporter: tapColorize()
    }));
});

gulp.task('test:unit', function() {
  return sequence('test:unit:clean', 'test:unit:build', 'test:unit:run');
});

// functional tests
gulp.task('test:func:clean', function() {
  return gulp.src(['./tmp/build/test/func-*.js'], {read: false})
    .pipe(clean());
});

// cat ./test/build/func-tests.js | ./node_modules/.bin/tape-run
gulp.task('test:func:build', function() {
  return browserify({
      entries: './test/func/index.js'
    , debug:   true
    })
    .transform('babelify', {
      presets:            ['es2015']
    , sourceMapsAbsolute: true
    })
    .bundle()
    .pipe(source('func-tests.js'))
    .pipe(buffer())
    .on('error', util.log)
    .pipe(gulp.dest('./tmp/build/test/'));
});

// run tests on electron
gulp.task('test:func:run', function() {
  return browserify({
      entries: './test/func/index.js'
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

gulp.task('test:func', function() {
  return sequence('test:func:clean', 'test:func:build', 'test:func:run');
});

gulp.task('test:clean', ['test:unit:clean', 'test:func:clean']);
gulp.task('test',  ['test:unit', 'test:func']);


// -- [main tasks]

gulp.task('default', function() {
  var nodeEnv = process.env.NODE_ENV || 'production';
  console.log('» gulp:', nodeEnv);

  return sequence('clean', 'build');
});
