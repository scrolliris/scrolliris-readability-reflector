'use strict';

var path = require('path')
  ;

var fs = require('fs')
  , gulp = require('gulp')
  , glob = require('glob')
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


// -- utility tasks

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


// -- build tasks

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

// reflector.js
gulp.task('build:browserify:index',
  runBrowserify('index.js', prefix + 'reflector.js'));

gulp.task('build:uglify:index',
  runUglify(prefix + 'reflector.js'));

// reflector-browser.js
gulp.task('build:browserify:browser',
  runBrowserify('browser.js', prefix + 'reflector-browser.js'));

gulp.task('build:uglify:browser',
  runUglify(prefix + 'reflector-browser.js'));

// reflector-minimap.js (minimap extension)
gulp.task('build:browserify:minimap',
  runBrowserify('minimap.js', prefix + 'reflector-minimap.js'));

gulp.task('build:compileCSS:minimap', function () {
  return gulp.src('./src/minimap.styl')
    .pipe(stylus())
    .pipe(rename(function(file) {
      file.basename = prefix + 'reflector-minimap';
    }))
    .pipe(gulp.dest('./dst/'));
});

gulp.task('build:uglify:minimap',
  runUglify(prefix + 'reflector-minimap.js'));

gulp.task('build:minify:minimap', function () {
  return pump([
      gulp.src(['./dst/' + prefix + 'reflector-minimap.css'])
    , sourcemaps.init({
        loadMaps: true
      })
    , minify({compatibility: 'ie8'})
    , rename({suffix: '.min'})
    , sourcemaps.write('./')
    , gulp.dest('./dst')
    ]);
});

// build entry point
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

gulp.task('build:minimap', ['env'], function() {
  return sequence(
    'build:browserify:minimap'
  , 'build:uglify:minimap'
  , 'build:compileCSS:minimap'
  , 'build:minify:minimap'
  );
});

gulp.task('build', [
  'build:browser'
, 'build:index'
, 'build:minimap'
]);


// -- testing tasks

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


// -- development tasks

// watch targets
var paths = {
  browser: [
    path.join('src', 'bworser.js')
  ]
, index: [
    path.join('src', 'index.js')
  ]
, minimap: [
    path.join('src', 'minimap.*')
  ]
};

// watch tasks
gulp.task('watch', ['env'], function() {
  gulp.watch('gulpfile.js', ['build']);
  gulp.watch(paths.browser, ['build:browser', 'build:index']);
  gulp.watch(paths.index, ['build:index', 'build:browser']);
  gulp.watch(paths.minimap, ['build:minimap']);
});


// -- default tasks

gulp.task('default', function() {
  var nodeEnv = process.env.NODE_ENV || 'production';
  console.log('» gulp:', nodeEnv);

  return sequence('clean', 'build');
});
