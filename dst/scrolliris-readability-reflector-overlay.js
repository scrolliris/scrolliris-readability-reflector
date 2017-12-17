(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function _shadeColor(color, percent) {
  var f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent;
  var R = f >> 16,
      G = f >> 8 & 0x00FF,
      B = f & 0x0000FF;
  return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

function collectElements(article, selectors) {
  var q = '';
  [// default
  ['heading', 'h1,h2,h3,h4,h5,h6'], ['paragraph', 'p']
  //, ['sentence', '']  FIXME: sentence must be nested in p
  , ['material', 'ul,ol,pre,table,blockquote']].forEach(function (d) {
    var key = d[0];
    q += ',' + (selectors[key] || d[1]);
  });
  return article.querySelectorAll(q.slice(1));
}

function getStyle(e, prop) {
  var s = void 0;
  if (e.currentStyle) {
    s = e.currentStyle[prop];
  } else if (window.getComputedStyle) {
    s = document.defaultView.getComputedStyle(e, null).getPropertyValue(prop);
  }
  return s;
}

function fetchResultData(endpointURL, csrfToken, resolveCallback, rejectCallback) {
  var credentials = { csrfToken: csrfToken };
  if (!credentials.csrfToken) {
    credentials.csrfToken = '';
  }
  var getJSON = function getJSON(url) {
    var emptyData = { 'p': [] };
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      if (credentials.csrfToken !== '') {
        xhr.setRequestHeader('X-CSRF-Token', credentials.csrfToken);
      }
      xhr.responseType = 'text';
      xhr.onerror = function () {
        var status = xhr.status;
        reject(emptyData);
      };
      xhr.onload = function () {
        var status = xhr.status,
            response = xhr.response;
        if (status === 200) {
          response = response.replace(/^\]\)\}while\(1\);<\/x>/, '');
          resolve(JSON.parse(response));
        } else {
          console.error('[ERROR] GET status: ', status);
          reject(emptyData);
        }
      };
      xhr.send();
    });
  };
  return getJSON(endpointURL).then(function (data) {
    return resolveCallback(data);
  }, function (data) {
    return rejectCallback(data);
  });
}

function buildHTML(data, elements) {
  var html = '<html><head>';
  html += '\n<style>\n</style>\n';
  // additional styles
  // html += Array.from([]).map((s) => {
  //   return s.outerHTML;
  // }).join('');
  html += '</head><body>';

  var colors0 = [// heatmap 11
  '#2d96db', '#4aa8a6', '#64b977', '#99c95d', '#c5d062', '#f6d866', '#fab252', '#fd8e3e', '#fe6f43', '#fd515b', '#fb1b2a'];

  var colors1 = [// pastel 12
  '#9e0142', '#d0384d', '#ee6445', '#fa9c58', '#fdcd7b', '#fef0a7', '#f3faad', '#d0ec9c', '#98d5a4', '#5cb7a9', '#3582ba', '#5e4fa2'];

  var colors = colors0 // heatmap (for now)
  ,
      pIndex = 0;
  html += Array.from(elements).map(function (e) {
    var n = document.importNode(e, true);
    if (n.nodeName !== 'IMG') {
      if (n.nodeName === 'P' && 'p' in data) {
        // BETA only paragraph support
        var v = data['p'][String(pIndex)];
        if (v !== undefined) {
          var color = '#ffffff';
          try {
            var i = Math.round(parseFloat(v) * 10);
            color = _shadeColor(colors[i], 0.55);
          } catch (err) {
            console.error(err);
          }
          n.style.background = color;
          n.style.backgroundColor = 'rgba(' + color + ', 0.9)';
        }
        pIndex += 1;
      }
    }
    return n.outerHTML;
  }).join('');
  html += '</body></html>';
  return html;
}

exports.collectElements = collectElements;
exports.getStyle = getStyle;
exports.fetchResultData = fetchResultData;
exports.buildHTML = buildHTML;

},{}],2:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _util = require('./_util');

(function (win, doc) {
  var frame = win.parent.document.getElementById('scrolliris_frame');
  var layer = doc.getElementById('scrolliris_item_container');

  var position = { // initial position
    y: 0,
    x: 0
  };

  var setPosition = function setPosition(y, x) {
    if (!layer.classList.contains('hidden')) {
      frame.style.top = position.y - y + 'px';
      frame.style.left = position.x - x + 'px';
    } else {
      frame.style.top = '';
      frame.style.left = '';
      frame.style.bottom = '0';
    }
  };

  // an observer for the change class `.hidden` toggling
  var callback = function callback(ml) {
    if (ml.length > 1) {
      return;
    }
    var m = ml[0];
    if (m.type === 'attributes' && m.attributeName === 'class') {
      // parent page offset values
      setPosition(win.parent.pageYOffset, win.parent.pageXOffset);
    }
  };
  var observer = new MutationObserver(callback);
  observer.observe(layer, { attributes: true });

  // synchronize with the scroll event on parent document
  win.parent.document.addEventListener('scroll', function (e) {
    // TODO: check more browsers
    if ('path' in e) {
      // chromium
      if (e.path.length !== 2) {
        return;
      }
      var w = e.path[1];
      setPosition(w.pageYOffset, e.pageXOffset);
    } else {
      // firefox
      setPosition(e.pageY, e.pageX);
    }
  });
})(window, document);

(function (win, doc, ctx) {
  var config = {},
      settings = {},
      options = {};

  if (ctx.hasOwnProperty('config') && _typeof(ctx.config) === 'object') {
    config = ctx['config'];
    // pass
  }
  if (ctx.hasOwnProperty('settings') && _typeof(ctx.options) === 'object') {
    settings = ctx['settings'];
    if (!settings.endpointURL) {
      console.error('endpointURL is required');
      return false;
    }
  }
  if (ctx.hasOwnProperty('options') && _typeof(ctx.options) === 'object') {
    options = ctx['options'];
  }

  var selectors = options.selectors || {};
  var article = win.parent.document.querySelector(selectors.article || 'body article');

  // collect elements
  var elements = (0, _util.collectElements)(article, selectors);

  var draw = function draw(data) {
    var offset = {
      x: window.parent.pageXOffset,
      y: window.parent.pageYOffset
    };

    var html = (0, _util.buildHTML)(data, Array.from(elements).map(function (e) {
      var rect = e.getBoundingClientRect();
      var newNode = doc.importNode(e, true);
      if (!newNode) {
        return e;
      } else {
        // set position
        newNode.style.padding = '0';
        newNode.style.margin = '0';

        newNode.style.fontFamily = (0, _util.getStyle)(e, 'font-family');
        newNode.style.fontSize = (0, _util.getStyle)(e, 'font-size');
        newNode.style.lineHeight = (0, _util.getStyle)(e, 'line-height');
        newNode.style.letterSpacing = (0, _util.getStyle)(e, 'letter-spacing');

        newNode.style.position = 'absolute';
        newNode.style.top = rect.top + offset.y + 'px';
        newNode.style.left = rect.left + offset.x + 'px';
        newNode.style.right = rect.right + 'px';
        newNode.style.width = rect.width + 'px';
        newNode.style.height = rect.height + 'px';

        // additional
        newNode.style.color = 'transparent';
        return newNode;
      }
    }));

    var container = doc.getElementById('scrolliris_overlay_container');
    container.innerHTML = html;
  };

  (0, _util.fetchResultData)(settings.endpointURL, settings.csrfToken, function (data) {
    // resolve
    draw(data);
  }, function (data) {
    // reject
    // FIXME
    draw(data);
  });
})(window, document, (window.ScrollirisReadabilityReflector || {}).Context);

},{"./_util":1}]},{},[2]);
