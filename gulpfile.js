'use strict';

var fs = require('fs')
  , glob = require('glob')
  ;

var gulp = require('gulp')
  , babelify = require('babelify')
  , browserify = require('browserify')
  , buffer = require('vinyl-buffer')
  , through = require('through2')
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
    , './tmp/build/**/*'
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

gulp.task('build:browserify:index',
  runBrowserify('index.js', prefix + 'reflector.js'));

gulp.task('build:browserify:browser',
  runBrowserify('browser.js', prefix + 'reflector-browser.js'));

gulp.task('build:browserify:canvas',
  runBrowserify('canvas.js', prefix + 'reflector-canvas.js'));

gulp.task('build:compileCSS:canvas', function () {
  return gulp.src('./src/canvas.styl')
    .pipe(stylus())
    .pipe(rename(function(file) {
      file.basename = prefix + 'reflector-canvas';
    }))
    .pipe(gulp.dest('./dst/'));
});

gulp.task('build:uglify:index',
  runUglify(prefix + 'reflector.js'));

gulp.task('build:uglify:browser',
  runUglify(prefix + 'reflector-browser.js'));

gulp.task('build:uglify:canvas',
  runUglify(prefix + 'reflector-canvas.js'));

gulp.task('build:minify:canvas', function () {
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

gulp.task('build:index', ['env'], function() {
  return sequence(
    'build:browserify:index'
  , 'build:uglify:index'
  );
});

gulp.task('build:browser', ['env'], function() {
  return sequence(
    'build:browserify:browser'
  , 'build:uglify:browser'
  );
});

gulp.task('build:canvas', ['env'], function() {
  return sequence(
    'build:browserify:canvas'
  , 'build:uglify:canvas'
  , 'build:compileCSS:canvas'
  , 'build:minify:canvas'
  );
});

gulp.task('build', ['build:browser', 'build:index', 'build:canvas']);


// -- [test tasks]

// unit test
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
      presets: ['es2015']
    , sourceMapsAbsolute: true
    })
    .bundle()
    .pipe(source('unit-test.js'))
    .pipe(buffer())
    .on('error', util.log)
    .pipe(gulp.dest('./tmp/build/test/'));
});

gulp.task('test:unit:run', function() {
  return gulp.src(['tmp/build/test/unit-test.js'])
    .pipe(tape({
      reporter: tapColorize()
    }));
});

gulp.task('test:unit', function() {
  return sequence('test:unit:clean', 'test:unit:build', 'test:unit:run');
});

// functional test
gulp.task('test:func:clean', function() {
  return gulp.src(['./tmp/build/test/func-*.js'], {read: false})
    .pipe(clean());
});

gulp.task('test:func:build', function() {
  return browserify({
      entries: glob.sync('./test/func/**/*.js')
    , debug: true
    })
    .transform('babelify', {
      presets: ['es2015']
    , sourceMapsAbsolute: true
    })
    .bundle()
    .pipe(source('func-test.js'))
    .pipe(buffer())
    .on('error', util.log)
    .pipe(gulp.dest('./tmp/build/test/'));
});

// run tests on electron (default)
gulp.task('test:func:run', function() {
  // same as:
  //   `cat ./tmp/build/test/func-test.js | ./node_modules/.bin/tape-run`
  var stream = function() {
    return through.obj(function(file, encoding, callback) {
      this.push(file.contents);
      return callback();
    });
  };
  return gulp.src([
      './tmp/build/test/func-*.js'
    ])
    .pipe(stream())
    .pipe(tapeRun())
    .on('error', util.log)
    .pipe(process.stdout);
});

gulp.task('test:func', function() {
  return sequence('test:func:clean', 'test:func:build', 'test:func:run');
});

gulp.task('test:clean', ['test:unit:clean', 'test:func:clean']);
gulp.task('test', ['test:unit', 'test:func']);


// -- [main tasks]

gulp.task('default', function() {
  var nodeEnv = process.env.NODE_ENV || 'production';
  console.log('» gulp:', nodeEnv);

  return sequence('clean', 'build');
});
