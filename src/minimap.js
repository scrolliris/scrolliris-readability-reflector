import rasterizeHTML from 'rasterizehtml';

import {
  collectElements
, fetchResultData
, buildHTML
, hideLoader
} from './_util';

function makeCanvas(width, height) {
  let container = document.getElementById(
        'scrolliris_minimap_container')
    , canvas = document.createElement('canvas')
    ;
  canvas.setAttribute('id', 'scrolliris_minimap_canvas');
  canvas.setAttribute('width', width* 0.5);
  canvas.setAttribute('height', height * 0.5);
  container.appendChild(canvas);
  return canvas;
}

function drawCanvas(canvas, html, width, height, margin) {
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

  rasterizeHTML.drawHTML(html, canvas, {
    zoom: 0.5
  , width: width
  , height: height
  });

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

  // collect elements
  let elements = collectElements(article, selectors)
    ;

  // TODO:
  // Remove magic number(s)
  let elm = doc.documentElement;
  let docWidth = Math.max(
    doc.body.scrollWidth, article.scrollWidth, elm.scrollWidth) / 0.5;
  let docHeight = Math.max(
    doc.body.scrollHeight, article.scrollHeight, elm.scrollHeight) / 0.5;

  let draw = (data) => {
    let html = buildHTML(data, elements)
      , canvas = makeCanvas(docWidth, docHeight)
      ;
    // draw minimap
    let canvasHeight = 325 // container main area
      , headerHeight = 22
      , footerHeiht = 22
      , frameMargin = 6 // {left|bottom}
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

((doc, win) => {
  return hideLoader(doc, win, 1800);
})(document, window);
