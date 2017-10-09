(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
      var settings = ctx.settings || {},
          options = ctx.options || { 'widget': 'active' };

      var _buildComponents2 = this._buildComponents(options.widget),
          _buildComponents3 = _slicedToArray(_buildComponents2, 3),
          frm = _buildComponents3[0],
          map = _buildComponents3[1],
          btn = _buildComponents3[2];

      this._insertStyle(frm);

      /**
       * Note:
       *
       * ```
       * div#scrolliris_container
       *   iframe#scrolliris_frame
       *     html
       *       body
       *         div#scrolliris_widget
       *           div#scrolliris_icon_container
       *           div#scrolliris_minimap_container
       *             div#scrolliris_canvas_container
       * ```
      */

      // iframe
      var iframe = document.createElement('iframe');
      iframe.setAttribute('id', 'scrolliris_frame');

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
      var canvasJS = settings.canvasJS || scriptSrc.replace(reflectorJSRegex, '-canvas$2.js$3').toString(),
          canvasCSS = settings.canvasCSS || scriptSrc.replace(reflectorJSRegex, '-canvas$2.css$3').toString();

      if (canvasJS === '') {
        console.error('canvasJS is missing');
      }
      if (canvasCSS === '') {
        console.error('canvasCSS is missing');
      }

      iframe.contentWindow.ScrollirisReadabilityReflector = {
        Context: ctx
      };
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(this._makeContent(btn, map, canvasJS, canvasCSS));
      iframe.contentWindow.document.close();
    }
  }, {
    key: '_insertStyle',
    value: function _insertStyle(frm) {
      var cssContent = '\n#scrolliris_container {\n  position: fixed;\n  margin: 0;\n  padding: 0;\n  width: auto;\n  height: auto;\n  left: 0px;\n  bottom: 0px;\n  z-index: 9999999 !important;\n}\n\n#scrolliris_frame {\n  z-index: 9999999 !important;\n  position: fixed !important;\n  margin: 0;\n  padding: 0;\n  width: ' + frm.width + 'px;\n  height: ' + frm.height + 'px;\n  left: 9px;\n  bottom: 9px;\n  border: 0;\n}\n';

      var style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(cssContent));

      var h = document.getElementsByTagName('head')[0];
      h.appendChild(style);
    }
  }, {
    key: '_buildComponents',
    value: function _buildComponents(widgetState) {
      var map = {
        state: widgetState === 'active' ? 'block' : 'hidden',
        width: '260',
        height: '400'
      },
          btn = {
        state: widgetState === 'active' ? 'hidden' : 'block',
        width: '48',
        height: '48',
        src: 'https://img.scrolliris.io/icon/scrolliris-64x64.png'
      };

      var frm = {
        width: map.state === 'hidden' ? btn.width : map.width,
        height: map.state === 'hidden' ? btn.height : map.height
      };

      return [frm, map, btn];
    }
  }, {
    key: '_makeContent',
    value: function _makeContent(btn, map, canvasJS, canvasCSS) {
      var content = '\n<head>\n  <meta charset="utf-8">\n  <style>\nbody {\n  margin: 0;\n  padding: 0;\n}\n\n:focus {\n  outline: none;\n}\n\n::-moz-focus-inner {\n  border: 0;\n}\n\n#scrolliris_icon_container .btn,\n#scrolliris_minimap_container .btn {\n  cursor: pointer;\n  margin: 0;\n  padding: 0;\n  outline: 0;\n  outline-style: none;\n  border: 0;\n  background: none;\n  box-shadow: none;\n  appearance: none;\n  -moz-appearance: none;\n  -webkit-appearance: none;\n}\n\n.hidden {\n  display: none;\n  border: 0;\n  width: 0;\n  height: 0;\n}\n\n#crolliris_widget {\n  margin: 0;\n  padding: 0;\n  width: auto;\n  height: auto;\n}\n\n#crolliris_widget .icon {\n  margin: 0 0 0 2px;\n  padding: 0;\n}\n\n#scrolliris_minimap_container {\n  max-width: 260px;\n  max-height: 400px;\n  border: 1px solid rgba(51, 51, 51, 0.18);\n  border-radius: 1px;\n}\n  </style>\n  <link rel="stylesheet" href="' + canvasCSS + '">\n</head>\n<body>\n  <div id="scrolliris_widget">\n    <div id="scrolliris_icon_container">\n      <button type="button" class="btn ' + btn.state + '" onclick="return toggleMinimap(this, event);">\n        <img class="icon" src="' + btn.src + '" alt="" width="' + btn.width + '" height="' + btn.height + '"></button>\n    </div>\n    <div id="scrolliris_minimap_container" class="' + map.state + '">\n      <div id="scrolliris_header">\n        <div class="header">\n          <h1 style="font-family:monospace;">READABILITY HEATMAP</h1>\n          <button type="button" class="btn close" onclick="return toggleMinimap(null, event)">\xD7</button>\n        </div>\n      </div>\n      <div id="scrolliris_canvas_container"></div>\n      <div id="scrolliris_footer">\n        <p class="txt">Powered by <a href="https://about.scrolliris.com/" target="_blank">Scrolliris</a></p>\n      </div>\n    </div>\n  </div>\n  <script async src="' + canvasJS + '"></script>\n  <script>\nfunction _resetMinimap(minimap) {\n  var frame = window.parent.document.getElementById(\'scrolliris_frame\');\n  if (minimap.classList.contains(\'hidden\')) {\n    frame.setAttribute(\'style\', \'height:48px;width:48px;\');\n  } else {\n    frame.setAttribute(\'style\', \'height:400px;width:260px;\');\n  }\n}\n\nfunction toggleMinimap(self, e) {\n  e.preventDefault();\n  var minimap = document.getElementById(\'scrolliris_minimap_container\');\n  minimap.classList.toggle(\'hidden\');\n  _resetMinimap(minimap);\n  if (self !== null) {\n    self.classList.toggle(\'hidden\');\n  } else {\n    var icon = document.getElementById(\'scrolliris_icon_container\')\n      , btn = icon.querySelector(\'button\')\n    ;\n    btn.classList.toggle(\'hidden\');\n  }\n}\n  </script>\n</body>\n';
      return content.replace(/\n\s*/g, '');
    }
  }]);

  return Widget;
}();

exports.default = Widget;

},{}]},{},[1]);
