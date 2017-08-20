import rasterizeHTML from 'rasterizehtml';

function shadeColor(color, percent) {
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

function buildHTML(data, elements, styles) {
  let html = '<html><head>';
  html += Array.from(styles).map((s) => { // apply original style(s)
    return s.outerHTML;
  }).join('');
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

  let colors2 = [  // monochromic 9
    '#fafafa'
  , '#f0f0f0'
  , '#d9d9d9'
  , '#bdbdbd'
  , '#969696'
  , '#737373'
  , '#525252'
  , '#252525'
  , '#000000'
  ]

  let colors = colors0 // heatmap (for now)
    , pIndex = 0
    ;
  html += Array.from(elements).map((e) => {
    let n = document.importNode(e, true);
    if (n.nodeName !== 'IMG') {
      if (n.nodeName === 'P' && Array.isArray(data['p'])) {
        // BETA only paragraph support
        let v = data['p'][String(pIndex)];
        if (v !== undefined) {
          let color = shadeColor(colors[parseInt(v, 10).toString()], 0.5);
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

function makeCanvas(width, height) {
  let container = document.getElementById('scrolliris_canvas_container')
    , canvas = document.createElement('canvas')
    ;
  canvas.setAttribute('id', 'scrolliris_canvas');
  canvas.setAttribute('width', width* 0.5);
  canvas.setAttribute('height', height * 0.5);
  container.appendChild(canvas);
  return canvas;
}

function drawCanvas(canvas, html, width, height, margin) {
  rasterizeHTML.drawHTML(html, canvas, {
    zoom: 0.5
  , width: width
  , height: height
  });

  let dragging = false
    , lastY
    , marginTop = 0
    , event = {}
    ;

  canvas.addEventListener('mousedown', (e) => {
    let evt = e || event;
    canvas.style.cursor = 'grabbing';
    dragging = true;
    lastY = evt.clientY;
    e.preventDefault();
  }, false);

  canvas.addEventListener('mouseup', (e) => {
    canvas.style.cursor = 'grab';
    dragging = false;
  }, false);

  window.addEventListener('mousemove', (e) => {
    let evt = e || event;
    if (dragging) {
      let delta = evt.clientY - lastY;
      lastY = evt.clientY;
      marginTop += delta;
      if (marginTop > 0) {
        marginTop = 0;
      } else if (marginTop < margin) {
        marginTop = margin;
      }
      canvas.style.marginTop = marginTop + 'px';
    }
    e.preventDefault();
  }, false);

  window.addEventListener('mouseout', (e) => {
    canvas.style.cursor = 'grab';
    dragging = false;
  }, false);

}

((doc, ctx) => {
  let config = {}
    , settings = {}
    , options = {}
    ;

  if (ctx.hasOwnProperty('config') && typeof ctx.config === 'object') {
    config = ctx['config'];
    // pass
  }
  if (ctx.hasOwnProperty('settings') && typeof ctx.options === 'object') {
    settings = ctx['settings'];
    if (!settings.endpointURL) {
      console.error('endpointURL is required');
      return false;
    }
  }
  if (ctx.hasOwnProperty('options') && typeof ctx.options === 'object') {
    options = ctx['options'];
  }

  let selectors = (options.selectors || {});
  let article = doc.querySelector(selectors.article || 'body article');

  // collect elements and styles
  let elements = collectElements(article, selectors)
    , styles = (doc.querySelectorAll('style') || [])
    ;

  // NOTE:
  // Use <article>'s clientHeight?
  let elm = doc.documentElement;
  let docWidth = Math.max(
    doc.body.clientWidth, elm.clientWidth, elm.scrollWidth);
  let docHeight = Math.max(
    doc.body.clientHeight, elm.clientHeight, elm.scrollHeight);

  let draw = (data) => {
    let html = buildHTML(data, elements, styles)
      , canvas = makeCanvas(docWidth, docHeight)
      ;
    // draw minimap
    let canvasHeight = 290 // container main area
      , headerHeight = 22
      , footerHeiht = 22
      , frameMargin = 9 // {left|bottom} 9px
      , scale = 0.5
      ;
    let margin = -1 * ((docHeight * scale) / canvasHeight * 100) +
        (headerHeight + footerHeiht + frameMargin)
      ;
    drawCanvas(canvas, html, docWidth, docHeight, margin);
  };

  fetchResultData(settings.endpointURL, settings.csrfToken, (data) => {
    // resolve
    draw(data);
  }, (data) => { // reject
    // FIXME
    draw(data);
  });
})(
  window.parent.document,
  (window.ScrollirisReadabilityReflector || {}).Context
);
