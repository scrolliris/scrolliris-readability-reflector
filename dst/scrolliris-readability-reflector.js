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
          _buildProperties3 = _slicedToArray(_buildProperties2, 2),
          itm = _buildProperties3[0],
          btn = _buildProperties3[1];

      // css


      var style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(this._buildStyle(itm)));

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

      var widget = this._buildWidget(options.widget.extension, itm, btn, ctx, settings);

      iframe.contentWindow.ScrollirisReadabilityReflector = { Context: ctx };
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(widget);
      iframe.contentWindow.document.close();
    }
  }, {
    key: '_buildStyle',
    value: function _buildStyle(itm) {
      var width = itm.state === 'block' ? itm.width : 'auto',
          height = itm.state === 'block' ? itm.height : 'auto';
      return '\n#scrolliris_container {\n  margin: 0;\n  padding: 0;\n  padding-left: 6px !important;\n  padding-bottom: 6px !important;\n  width: auto;\n  height: auto;\n  position: fixed;\n  left: 0;\n  bottom: 0;\n  z-index: 2147483647;\n}\n\n#scrolliris_frame {\n  margin: 0;\n  padding: 0;\n  width: ' + width + ';\n  height: ' + height + ';\n  border: 0;\n  position: fixed;\n  left: 0;\n  bottom: 0;\n  z-index: 2147483647;\n}\n';
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
      var itm = void 0;
      if (extension === 'overlay') {
        itm = {
          class: 'overlay',
          state: initialState === 'inactive' ? 'hidden' : 'block',
          width: '100%',
          height: document.body.scrollHeight + (
          // remains scrollable length
          this._getDocHeight() - this._getWinHeight()) + 'px'
        };
      } else {
        // minimap (default)
        itm = {
          class: 'minimap',
          state: initialState === 'inactive' ? 'hidden' : 'block',
          width: this._minimapWidth + 'px',
          height: this._minimapHeight + 'px'
        };
      }
      var cdn = 'https://img.scrolliris.com/';
      var btn = {
        state: initialState === 'inactive' ? 'block' : extension === 'overlay' ? 'block' : 'hidden'
        // button image size (width, height)
        , width: this._iconWidth - this._iconMargin / 2 + 'px',
        height: this._iconWidth - this._iconMargin / 2 + 'px',
        src: {
          on: cdn + 'icon/scrolliris-logo-white-64x64.png',
          off: cdn + 'icon/scrolliris-logo-none-64x64.png'
        }
      };
      return [itm, btn];
    }
  }, {
    key: '_buildWidget',
    value: function _buildWidget(extension, itm, btn, ctx, settings) {
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
      return this['_make' + capitalize(extension)](itm, btn, src.js, src.css);
    }
  }, {
    key: '_buildStyleForWidget',
    value: function _buildStyleForWidget() {
      return '\nhtml,\nbody {\n  margin: 0;\n  padding: 0;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n*:focus {\n  outline: none;\n}\n\n*::-moz-focus-inner {\n  border: 0;\n}\n\n#scrolliris_item_container {\n  width: auto;\n  height: auto;\n  position: fixed;\n  top: 0;\n  left: 0;\n}\n\n#scrolliris_icon_container {\n  width: auto;\n  height: auto;\n  position: fixed;\n  left: 6px;\n  bottom: 6px !important;\n  z-index: 1;\n  display: block;\n}\n\n#scrolliris_icon_container .btn,\n#scrolliris_item_container .btn {\n  cursor: pointer;\n  margin: 0;\n  padding: 0;\n  outline: 0;\n  outline-style: none;\n  border: 0;\n  background: none;\n  box-shadow: none;\n  appearance: none;\n  -moz-appearance: none;\n  -webkit-appearance: none;\n}\n\n.hidden {\n  display: none;\n  opacity: 0;\n}\n\n#scrolliris_widget {\n  margin: 0;\n  padding: 0;\n  width: auto;\n  height: auto;\n}';
    }
  }, {
    key: '_buildScriptForWidget',
    value: function _buildScriptForWidget(itm, btn) {
      return '\nfunction _resetWidget(itm) {\n  var frm = window.parent.document.getElementById(\'scrolliris_frame\');\n  if (itm.classList.contains(\'hidden\')) {\n    frm.style.width = \'auto\';\n    frm.style.height = \'auto\';\n    itm.style.width = \'0px\';\n    itm.style.height = \'0px\';\n  } else {\n    frm.style.width = \'' + (itm.class === 'overlay' ? '100%' : itm.width) + '\';\n    frm.style.height = \'' + (itm.class === 'overlay' ? '100%' : itm.height) + '\';\n    itm.style.width = \'' + itm.width + '\';\n    itm.style.height = \'' + itm.height + '\';\n  }\n}\n\nfunction toggleItem(slf, e) {\n  e.preventDefault();\n  var itm = document.getElementById(\'scrolliris_item_container\');\n  itm.classList.toggle(\'hidden\');\n  _resetWidget(itm);\n  var icn = document.getElementById(\'scrolliris_icon_container\')\n    ;\n  if (itm.classList.contains(\'overlay\')) {\n    var img = icn.querySelector(\'img\');\n    if (itm.classList.contains(\'hidden\')) {\n      img.setAttribute(\'src\', \'' + btn.src.on + '\');\n    } else {\n      img.setAttribute(\'src\', \'' + btn.src.off + '\');\n    }\n  } else if (itm.classList.contains(\'minimap\')) {\n    var btn = icn.querySelector(\'button\');\n    btn.classList.toggle(\'hidden\');\n  }\n}';
    }
  }, {
    key: '_makeMinimap',
    value: function _makeMinimap(itm, btn, js, css) {
      var content = '\n<head>\n  <meta charset="utf-8">\n  <style>' + this._buildStyleForWidget() + '</style>\n  <link rel="stylesheet" href="' + css + '">\n</head>\n<body>\n  <div id="scrolliris_widget">\n    <div id="scrolliris_item_container"\n      class="minimap' + (itm.state === 'hidden' ? ' hidden' : '') + '">\n      <div id="scrolliris_header">\n        <div class="header">\n          <h1 style="font-family:monospace;">READABILITY HEATMAP</h1>\n          <button type="button"\n                 class="btn close"\n               onclick="return toggleItem(null, event)">\xD7</button>\n        </div>\n      </div>\n      <div id="scrolliris_minimap_container"></div>\n      <div id="scrolliris_footer">\n        <p class="txt">Powered by <a href="https://about.scrolliris.com/"\n                                   target="_blank">Scrolliris</a></p>\n      </div>\n    </div>\n    <div id="scrolliris_icon_container">\n      <button type="button"\n             class="btn' + (btn.state === 'hidden' ? ' hidden' : '') + '"\n           onclick="return toggleItem(this, event);">\n        <img class="icon"\n               src="' + btn.src.on + '"\n               alt="Scrolliris Icon"\n             width="' + btn.width + '"\n            height="' + btn.height + '"></button>\n    </div>\n  </div>\n  <script async src="' + js + '"></script>\n  <script>' + this._buildScriptForWidget(itm, btn) + '</script>\n</body>';
      return content.replace(/\n\s*|([\:;,"]|\)|}|if|else)\s+(\(|else|{)?/g, '$1$2');
    }
  }, {
    key: '_makeOverlay',
    value: function _makeOverlay(itm, btn, js, css) {
      var content = '\n<head>\n  <meta charset="utf-8">\n  <style>' + this._buildStyleForWidget() + '</style>\n  <link rel="stylesheet" href="' + css + '">\n</head>\n<body>\n  <div id="scrolliris_widget">\n    <div id="scrolliris_item_container"\n      class="overlay' + (itm.state === 'hidden' ? ' hidden' : '') + '"\n    onclick="return toggleItem(null, event);">\n      <div id="scrolliris_overlay_container"></div>\n    </div>\n    <div id="scrolliris_icon_container">\n      <button type="button"\n             class="btn' + (btn.state === 'hidden' ? ' hidden' : '') + '"\n           onclick="return toggleItem(this, event);">\n        <img class="icon"\n               src="' + (itm.state === 'hidden' ? btn.src.on : btn.src.off) + '"\n               alt="Scrolliris Icon"\n             width="' + btn.width + '"\n            height="' + btn.height + '"></button>\n    </div>\n  </div>\n  <script async src="' + js + '"></script>\n  <script>' + this._buildScriptForWidget(itm, btn) + '</script>\n</body>';
      return content.replace(/\n\s*|([\:;,"]|\)|}|if|else)\s+(\(|else|{)?/g, '$1$2');
    }
  }]);

  return Widget;
}();

exports.default = Widget;

},{}]},{},[1]);
