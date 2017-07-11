module.exports = function(config) {
  config.set({
    basePath: '.'
  , frameworks: ['browserify', 'tape']
  , files: [
      'test/**/*.js'
    ]
  , exclude: [
      'test/build/*.js'
    ]
  , preprocessors: {
      'test/**/*.js': ['browserify']
    }
  , browserify: {
      debug: true
    , transform: [
      ['babelify', {
        presets: ['es2015']
      , plugins: ['istanbul']
      }]
    ]}
  , reporters: ['coverage']
  , coverageReporter: {
      dir: 'coverage'
    , reporters: [
        {type: 'html', subdir: 'html'}
      , {type: 'text', subdir: '.', file: 'text.txt'}
      , {type: 'text-summary', subdir: '.', file: 'text-summary.txt'}
      ]
    }
  , superDotsReporter: {
      icon: {
        success: '.'
      , failure: 'F'
      , ignore: '-'
      }
    }
  , port: 9876
  , colors: true
  , logLevel: config.LOG_INFO
  , autoWatch: true
  , browsers: ['PhantomJS']
  , singleRun: true
  , concurrency: Infinity
  });
};
