function _shadeColor(color, percent) {
  let f = parseInt(color.slice(1),16)
    , t = percent < 0 ? 0 : 255
    , p = percent < 0 ? percent * -1 : percent
    ;
  let R = f >> 16
    , G = f >> 8 & 0x00FF
    , B = f & 0x0000FF
    ;
  return '#' + (
    0x1000000 + (Math.round((t-R) * p) + R) * 0x10000 +
    (Math.round((t - G) * p) + G) * 0x100 +
    (Math.round((t - B) * p) + B)
  ).toString(16).slice(1);
}

function collectElements(article, selectors) {
  let q = '';
  [ // default
    ['heading', 'h1,h2,h3,h4,h5,h6']
  , ['paragraph', 'p']
  //, ['sentence', '']  FIXME: sentence must be nested in p
  , ['material', 'ul,ol,pre,table,blockquote']
  ].forEach(function(d) {
    let key = d[0];
    q += ',' + (selectors[key] || d[1]);
  });
  return article.querySelectorAll(q.slice(1));
}

function getStyle(e, prop) {
  let s;
  if (e.currentStyle) {
    s = e.currentStyle[prop];
  } else if (window.getComputedStyle) {
    s = document.defaultView.getComputedStyle(e, null).getPropertyValue(prop);
  }
  return s;
}

function fetchResultData(
  endpointURL, csrfToken, resolveCallback, rejectCallback) {
  let credentials = {csrfToken};
  if (!credentials.csrfToken) {
    credentials.csrfToken = '';
  }
  let getJSON = (url) => {
    let emptyData = {'p': []};
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      if (credentials.csrfToken !== '') {
        xhr.setRequestHeader('X-CSRF-Token', credentials.csrfToken);
      }
      xhr.responseType = 'text';
      xhr.onerror = () => {
        let status = xhr.status;
        reject(emptyData);
      };
      xhr.onload = () => {
        let status = xhr.status
          , response = xhr.response
          ;
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
  return getJSON(endpointURL).then((data) => {
    return resolveCallback(data);
  }, (data) => {
    return rejectCallback(data);
  });
}

function buildHTML(data, elements) {
  let html = '<html><head>';
  html += `
<style>
</style>
`;
  // additional styles
  // html += Array.from([]).map((s) => {
  //   return s.outerHTML;
  // }).join('');
  html += '</head><body>';

  let colors0 = [ // heatmap 11
    '#2d96db'
  , '#4aa8a6'
  , '#64b977'
  , '#99c95d'
  , '#c5d062'
  , '#f6d866'
  , '#fab252'
  , '#fd8e3e'
  , '#fe6f43'
  , '#fd515b'
  , '#fb1b2a'
  ];

  let colors1 = [ // pastel 12
    '#9e0142'
  , '#d0384d'
  , '#ee6445'
  , '#fa9c58'
  , '#fdcd7b'
  , '#fef0a7'
  , '#f3faad'
  , '#d0ec9c'
  , '#98d5a4'
  , '#5cb7a9'
  , '#3582ba'
  , '#5e4fa2'
  ]

  let colors = colors0 // heatmap (for now)
    , pIndex = 0
    ;
  html += Array.from(elements).map((e) => {
    let n = document.importNode(e, true);
    if (n.nodeName !== 'IMG') {
      if (n.nodeName === 'P' && 'p' in data) {
        // BETA only paragraph support
        let v = data['p'][String(pIndex)];
        if (v !== undefined) {
          let color = '#ffffff';
          try {
            let i = Math.round(parseFloat(v) * 10);
            color = _shadeColor(colors[i], 0.55);
          } catch(err) {
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

function hideLoader(d, w, delay) {
  let c
    , r = (function(_d) {
        return function() {
          setTimeout(function() {
            let loader = _d.getElementById('loader')
              , icon = _d.getElementById('scrolliris_icon_container')
              ;
            loader.classList.add('hidden');
            icon.classList.remove('hidden');
          }, delay);
        };
      })(d)
      ;
  if (d.addEventListener) {
    c = (function(_c, _d, _r) {
      return function() {
        _d.removeEventListener('DOMContentLoaded', _c, false);
        _r();
      };
    })(c, d, r);
    d.addEventListener('DOMContentLoaded', c, false);
  } else if (d.attachEvent) {
    c = (function(_c, _d, _r) {
      return function() {
        if (_d.readyState === 'complete') {
          _d.detachEvent('onreadystatechange', _c);
          _r();
        }
      };
    })(c, d, r);
    d.attachEvent('onreadystatechange', c);
  } else {
    w.onload = r;
  }
}

export {
  collectElements
, getStyle
, fetchResultData
, buildHTML
, hideLoader
}
