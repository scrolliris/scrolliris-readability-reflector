(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var currentScript = document.currentScript;

var WidgetProxy = function () {
  function WidgetProxy(config) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, WidgetProxy);

    context.currentScript = currentScript;
    this._widget = new _index2.default(config, context);
  }

  _createClass(WidgetProxy, [{
    key: 'render',
    value: function render() {
      return this._widget.render();
    }
  }]);

  return WidgetProxy;
}();

var ScrollirisReadabilityReflector = {
  Widget: WidgetProxy
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollirisReadabilityReflector;
}

window.ScrollirisReadabilityReflector = ScrollirisReadabilityReflector;

},{"./index":2}],2:[function(require,module,exports){
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

    this._iconMargin = 4;
    this._iconWidth = 48;
    this._minimapWidth = 260;
    this._minimapHeight = 400;
  }

  _createClass(Widget, [{
    key: 'render',
    value: function render() {
      var ctx = this.context;
      var settings = ctx.settings || {},
          options = ctx.options || { widget: {
          extension: 'minimap',
          initialState: 'inactive'
        } };

      if (options.widget.extension in ['minimap', 'overlay'] || options.widget.initialState in ['active', 'inactive']) {
        return;
      }

      var _buildProperties2 = this._buildProperties(options.widget.initialState, options.widget.extension),
          _buildProperties3 = _slicedToArray(_buildProperties2, 3),
          frm = _buildProperties3[0],
          obj = _buildProperties3[1],
          btn = _buildProperties3[2];

      // css


      var style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(this._buildStyle(frm)));

      var h = document.getElementsByTagName('head')[0];
      h.appendChild(style);

      /**
       * NOTE:
       *
       * div#scrolliris_container
       *   iframe#scrolliris_frame
       *     html
       *       body
       *         div#scrolliris_widget
       *           div#scrolliris_icon_container
       *           div#scrolliris_item_container
       *             div#scrolliris_(minimap|overlay)_container
      */

      // iframe
      var iframe = document.createElement('iframe');
      iframe.setAttribute('id', 'scrolliris_frame');

      var container = document.createElement('div');
      container.setAttribute('id', 'scrolliris_container');
      container.appendChild(iframe);
      document.body.appendChild(container);

      var widget = this._buildWidget(options.widget.extension, obj, btn, ctx, settings);

      iframe.contentWindow.ScrollirisReadabilityReflector = { Context: ctx };
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(widget);
      iframe.contentWindow.document.close();
    }
  }, {
    key: '_buildStyle',
    value: function _buildStyle(frm) {
      return '\n#scrolliris_container {\n  position: fixed;\n  margin: 0;\n  padding: 0;\n  padding-left: 6px !important;\n  padding-bottom: 6px !important;\n  width: auto;\n  height: auto;\n  left: 0px;\n  bottom: 0px;\n  z-index: 9999999 !important;\n}\n\n#scrolliris_frame {\n  z-index: 9999999 !important;\n  position: fixed !important;\n  margin: 0;\n  padding: 0;\n  width: ' + (parseInt(frm.width, 10) + this._iconMargin) + 'px;\n  height: ' + (parseInt(frm.height, 10) + this._iconMargin) + 'px;\n  left: 0;\n  bottom: 0;\n  border: 0;\n}\n';
    }
  }, {
    key: '_getWinHeight',
    value: function _getWinHeight() {
      return window.innerHeight || (document.documentElement || document.body).clientHeight;
    }
  }, {
    key: '_getDocHeight',
    value: function _getDocHeight() {
      return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight);
    }
  }, {
    key: '_buildProperties',
    value: function _buildProperties(initialState, extension) {
      var obj = void 0;
      if (extension === 'overlay') {
        obj = {
          state: initialState === 'inactive' ? 'hidden' : 'block',
          width: '100%',
          height: document.body.scrollHeight + (
          // remains scrollable length
          this._getDocHeight() - this._getWinHeight()) + 'px'
        };
      } else {
        // minimap (default)
        obj = {
          state: initialState === 'inactive' ? 'hidden' : 'block',
          width: this._minimapWidth + 'px',
          height: this._minimapHeight + 'px'
        };
      }
      var btn = {
        state: initialState === 'inactive' ? 'block' : 'hidden'
        // button image size (width, height)
        , width: this._iconWidth - this._iconMargin / 2,
        height: this._iconWidth - this._iconMargin / 2,
        src: 'https://img.scrolliris.com/icon/scrolliris-logo-white-64x64.png'
      };
      var frm = {
        width: obj.state === 'hidden' ? btn.width : obj.width,
        height: obj.state === 'hidden' ? btn.height : obj.height
      };
      return [frm, obj, btn];
    }
  }, {
    key: '_buildWidget',
    value: function _buildWidget(extension, obj, btn, ctx, settings) {
      var currentScript = ctx.currentScript || document.currentScript,
          scriptSrc = currentScript.getAttribute('src') || '';

      // This part assumes -(minimap|overlay).(js|css) are both hosted in
      // same location as current js script.
      //
      // reflector.js         --> reflector-(minimap|overlay).js,.css
      // reflector-browser.js --> reflector-(minimap|overlay).js,.css
      var reflectorJSRegex = /(-browser)?(\.min)?\.js(\?)?/;

      function getRemote(name, ext) {
        return settings.hasOwnProperty(name) ? settings[name][ext] : scriptSrc.replace(reflectorJSRegex, '-' + name + '$2.' + ext + '$3').toString();
      }

      var src = {
        js: getRemote(extension, 'js'),
        css: getRemote(extension, 'css')
      };

      if (src.js === '' || src.css === '') {
        console.error('widget:' + extension + ' No such extension');
      }

      function capitalize(str) {
        return str && str[0].toUpperCase() + str.slice(1);
      }

      // call _make(Minimap|Overlay) function
      return this['_make' + capitalize(extension)](obj, btn, src.js, src.css);
    }
  }, {
    key: '_buildStyleForWidget',
    value: function _buildStyleForWidget() {
      return '\nhtml,\nbody {\n  margin: 0;\n  padding: 0;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n*:focus {\n  outline: none;\n}\n\n*::-moz-focus-inner {\n  border: 0;\n}\n\n#scrolliris_item_container {\n  width: 100%;\n  height: 100%;\n}\n\n#scrolliris_icon_container .btn,\n#scrolliris_item_container .btn {\n  cursor: pointer;\n  margin: 0;\n  padding: 0;\n  outline: 0;\n  outline-style: none;\n  border: 0;\n  background: none;\n  box-shadow: none;\n  appearance: none;\n  -moz-appearance: none;\n  -webkit-appearance: none;\n}\n\n#scrolliris_icon_container .btn {\n  float: right;\n}\n\n.hidden {\n  display: none;\n  opacity: 0;\n}\n\n#scrolliris_widget {\n  margin: 0;\n  padding: 0;\n  width: auto;\n  height: auto;\n}\n\n#scrolliris_widget .icon {\n  margin: 0;\n  padding: 0;\n}';
    }
  }, {
    key: '_buildScriptForWidget',
    value: function _buildScriptForWidget(obj, btn) {
      return '\nfunction _reset(itm) {\n  var frm = window.parent.document.getElementById(\'scrolliris_frame\');\n  if (itm.classList.contains(\'hidden\')) {\n    frm.style.width = \'' + (btn.width + this._iconMargin) + 'px\';\n    frm.style.height = \'' + (btn.height + this._iconMargin) + 'px\';\n  } else {\n    frm.style.width = \'' + obj.width + '\';\n    frm.style.height = \'' + obj.height + '\';\n  }\n}\n\nfunction toggleItem(slf, e) {\n  e.preventDefault();\n  var itm = document.getElementById(\'scrolliris_item_container\');\n  itm.classList.toggle(\'hidden\');\n  _reset(itm);\n  if (slf !== null) {\n    slf.classList.toggle(\'hidden\');\n  } else {\n    var icn = document.getElementById(\'scrolliris_icon_container\')\n      , btn = icn.querySelector(\'button\')\n    ;\n    btn.classList.toggle(\'hidden\');\n  }\n}';
    }
  }, {
    key: '_makeMinimap',
    value: function _makeMinimap(obj, btn, js, css) {
      var content = '\n<head>\n  <meta charset="utf-8">\n  <style>' + this._buildStyleForWidget() + '</style>\n  <link rel="stylesheet" href="' + css + '">\n</head>\n<body>\n  <div id="scrolliris_widget">\n    <div id="scrolliris_icon_container">\n      <button type="button" class="btn ' + btn.state + '" onclick="return toggleItem(this, event);">\n        <img class="icon" src="' + btn.src + '" alt="Scrolliris Icon" width="' + btn.width + '" height="' + btn.height + '"></button>\n    </div>\n    <div id="scrolliris_item_container" class="' + obj.state + '">\n      <div id="scrolliris_header">\n        <div class="header">\n          <h1 style="font-family:monospace;">READABILITY HEATMAP</h1>\n          <button type="button" class="btn close" onclick="return toggleItem(null, event)">\xD7</button>\n        </div>\n      </div>\n      <div id="scrolliris_minimap_container"></div>\n      <div id="scrolliris_footer">\n        <p class="txt">Powered by <a href="https://about.scrolliris.com/" target="_blank">Scrolliris</a></p>\n      </div>\n    </div>\n  </div>\n  <script async src="' + js + '"></script>\n  <script>' + this._buildScriptForWidget(obj, btn) + '</script>\n</body>\n';
      return content.replace(/\n\s*|([\:;,"]|\)|}|if|else)\s+(\(|else|{)?/g, '$1$2');
    }
  }, {
    key: '_makeOverlay',
    value: function _makeOverlay(obj, btn, js, css) {
      var content = '\n<head>\n  <meta charset="utf-8">\n  <style>' + this._buildStyleForWidget() + '</style>\n  <link rel="stylesheet" href="' + css + '">\n</head>\n<body>\n  <div id="scrolliris_widget">\n    <div id="scrolliris_icon_container">\n      <button type="button" class="btn ' + btn.state + '" onclick="return toggleItem(this, event);">\n        <img class="icon" src="' + btn.src + '" alt="Scrolliris Icon" width="' + btn.width + '" height="' + btn.height + '"></button>\n    </div>\n    <div id="scrolliris_item_container" class="' + obj.state + '" onclick="return toggleItem(null, event);">\n      <div id="scrolliris_overlay_container"></div>\n    </div>\n  </div>\n  <script async src="' + js + '"></script>\n  <script>' + this._buildScriptForWidget(obj, btn) + '</script>\n</body>\n';
      return content.replace(/\n\s*|([\:;,"]|\)|}|if|else)\s+(\(|else|{)?/g, '$1$2');
    }
  }]);

  return Widget;
}();

exports.default = Widget;

},{}]},{},[1]);
