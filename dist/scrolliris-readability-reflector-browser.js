(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function render(ctx) {
  // iframe
  var iframe = document.createElement('iframe');
  iframe.setAttribute('class', 'scrolliris-frame');

  // iframe container
  var container = document.createElement('div');
  container.setAttribute('id', 'scrolliris_container');
  container.appendChild(iframe);
  document.body.appendChild(container);

  // widget
  var currentScript = document.currentScript || function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  }();

  var canvasJS = (ctx.settings || {}).canvasJS || currentScript.getAttribute('src').replace(/(\.min)?\.js(\?)?/, '-canvas$1.js$2'),
      canvasCSS = (ctx.settings || {}).canvasCSS || currentScript.getAttribute('src').replace(/(\.min)?\.js(\?)?/, '-canvas$1.css$2');

  var content = '\n<head>\n  <meta charset="utf-8">\n  <link rel="stylesheet" href="' + canvasCSS + '">\n</head>\n<body>\n  <div id="scrolliris_header">\n    <h1>Text Readability Heatmap<span class="label">BETA</span></h1>\n    <!-- <button class="btn close">close</button> -->\n  </div>\n  <div id="scrolliris_canvas_container"></div>\n  <div id="scrolliris_footer">\n    <p class="txt">Powered by\n      <a href="https://scrolliris.com/" target="_blank">Scrolliris</a></p>\n  </div>\n  <script src="' + canvasJS + '"></script>\n</body>\n';
  content = content.replace(/\n/g, '');
  iframe.contentWindow.SihlContext = ctx;
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(content);
  iframe.contentWindow.document.close();
}

function insertStyle() {
  var cssContent = '\n#scrolliris_container {\n  position: fixed;\n  width: 0px;\n  height: 0px;\n  bottom: 0px;\n  left: 0px;\n  z-index: 9999999 !important;\n}\n\n#scrolliris_container .scrolliris-frame {\n  z-index: 9999999 !important;\n  position: fixed !important;\n  bottom: 9px;\n  left: 9px;\n  width: 260px;\n  height: 360px;\n  border: 1px solid rgba(51, 51, 51, 0.18);\n  border-radius: 1px;\n}\n';

  var style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(cssContent));

  var s = document.getElementsByTagName('style')[0];
  s.parentNode.insertBefore(style, s);
}

(function () {
  insertStyle();

  var sihl = window.Sihl;
  var e = void 0;
  if (Array.isArray(sihl.q)) {
    e = sihl.q.shift();
  }
  if (e === undefined) {
    console.err('FIXME');
  } else if (e.length === 2) {
    var evt = e[0],
        ctx = e[1] // {config, options}
    ;
    if (evt === 'init') {
      render(ctx);
    } else if (evt === 'update') {
      // TODO
    }
  }
})();

},{}]},{},[1]);

//# sourceMappingURL=scrolliris-readability-reflector-browser.js.map
