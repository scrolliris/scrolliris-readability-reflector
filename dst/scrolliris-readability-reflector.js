(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Widget = function () {
  function Widget(config) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Widget);

    this.config = config;
    this.context = context;
  }

  _createClass(Widget, [{
    key: 'render',
    value: function render() {
      var ctx = this.context;

      this._insertStyle();

      // iframe
      var iframe = document.createElement('iframe');
      iframe.setAttribute('class', 'scrolliris-frame');

      // iframe container
      var container = document.createElement('div');
      container.setAttribute('id', 'scrolliris_container');
      container.appendChild(iframe);
      document.body.appendChild(container);

      var currentScript = ctx.currentScript || document.currentScript,
          scriptSrc = currentScript.getAttribute('src') || '';
      // This part assumes -canvas.{js|css} are both hosted in same location
      // as -browser.js.
      //
      // reflector.js         --> reflector-canvas.js,.css
      // reflector-browser.js --> reflector-canvas.js,.css
      var reflectorJSRegex = /(-browser)?(\.min)?\.js(\?)?/;
      var canvasJS = (ctx.settings || {}).canvasJS || scriptSrc.replace(reflectorJSRegex, '-canvas$2.js$3').toString(),
          canvasCSS = (ctx.settings || {}).canvasCSS || scriptSrc.replace(reflectorJSRegex, '-canvas$2.css$3').toString();

      if (canvasJS === '') {
        console.error('canvasJS is missing');
      }
      if (canvasCSS === '') {
        console.error('canvasCSS is missing');
      }

      var content = '\n<head>\n  <meta charset="utf-8">\n  <link rel="stylesheet" href="' + canvasCSS + '">\n</head>\n<body>\n  <div id="scrolliris_header">\n    <h1>Text Readability Heatmap<span class="label">BETA</span></h1>\n    <!-- <button class="btn close">close</button> -->\n  </div>\n  <div id="scrolliris_canvas_container"></div>\n  <div id="scrolliris_footer">\n    <p class="txt">Powered by\n      <a href="https://scrolliris.com/" target="_blank">Scrolliris</a></p>\n  </div>\n  <script async src="' + canvasJS + '"></script>\n</body>\n';
      content = content.replace(/\n/g, '');
      iframe.contentWindow.ScrollirisReadabilityReflector = {
        Context: ctx
      };
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(content);
      iframe.contentWindow.document.close();
    }
  }, {
    key: '_insertStyle',
    value: function _insertStyle() {
      var cssContent = '\n#scrolliris_container {\n  position: fixed;\n  width: 0px;\n  height: 0px;\n  bottom: 0px;\n  left: 0px;\n  z-index: 9999999 !important;\n}\n\n#scrolliris_container .scrolliris-frame {\n  z-index: 9999999 !important;\n  position: fixed !important;\n  bottom: 9px;\n  left: 9px;\n  width: 260px;\n  height: 400px;\n  border: 1px solid rgba(51, 51, 51, 0.18);\n  border-radius: 1px;\n}\n';

      var style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(cssContent));

      var h = document.getElementsByTagName('head')[0];
      h.appendChild(style);
    }
  }]);

  return Widget;
}();

exports.default = Widget;

},{}]},{},[1]);
