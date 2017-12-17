import {
  collectElements
, getStyle
, fetchResultData
, buildHTML
} from './_util';

((win, doc) => {
  let frame = win.parent.document.getElementById('scrolliris_frame');
  let layer = doc.getElementById('scrolliris_item_container');

  let position = { // initial position
        y: 0
      , x: 0
      };

  let setPosition = (y, x) => {
    if (!layer.classList.contains('hidden')) {
      frame.style.top = (position.y - y) + 'px';
      frame.style.left = (position.x - x) + 'px';
    } else {
      frame.style.top = '';
      frame.style.left = '';
      frame.style.bottom = '0';
    }
  };

  // an observer for the change class `.hidden` toggling
  let callback = (ml) => {
    if (ml.length > 1) { return; }
    let m = ml[0];
    if (m.type === 'attributes' && m.attributeName === 'class') {
      // parent page offset values
      setPosition(win.parent.pageYOffset, win.parent.pageXOffset);
    }
  };
  let observer = new MutationObserver(callback);
  observer.observe(layer, {attributes: true});

  // synchronize with the scroll event on parent document
  win.parent.document.addEventListener('scroll', (e) => {
    // TODO: check more browsers
    if ('path' in e) {
      // chromium
      if (e.path.length !== 2) { return; }
      let w = e.path[1];
      setPosition(w.pageYOffset, e.pageXOffset);
    } else {
      // firefox
      setPosition(e.pageY, e.pageX);
    }
  });
})(window, document);


((win, doc, ctx) => {
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
  let article = win.parent.document.querySelector(
    selectors.article || 'body article');

  // collect elements
  let elements = collectElements(article, selectors)
    ;

  let draw = (data) => {
    let offset = {
          x: window.parent.pageXOffset
        , y: window.parent.pageYOffset
        };

    let html = buildHTML(
          data
        , Array.from(elements).map(function(e) {
            let rect = e.getBoundingClientRect();
            let newNode = doc.importNode(e, true);
            if (!newNode) {
              return e;
            } else {
              // set position
              newNode.style.padding = '0';
              newNode.style.margin = '0';

              newNode.style.fontFamily = getStyle(e, 'font-family');
              newNode.style.fontSize = getStyle(e, 'font-size');
              newNode.style.lineHeight = getStyle(e, 'line-height');
              newNode.style.letterSpacing = getStyle(e, 'letter-spacing');

              newNode.style.position = 'absolute';
              newNode.style.top = (rect.top + offset.y) + 'px';
              newNode.style.left = (rect.left + offset.x) + 'px';
              newNode.style.right = rect.right + 'px';
              newNode.style.width = rect.width + 'px';
              newNode.style.height = rect.height + 'px';

              // additional
              newNode.style.color = 'transparent';
              return newNode;
            }
          })
        );

    let container = doc.getElementById('scrolliris_overlay_container');
    container.innerHTML = html;
  };

  fetchResultData(settings.endpointURL, settings.csrfToken, (data) => {
    // resolve
    draw(data);
  }, (data) => { // reject
    // FIXME
    draw(data);
  });
})(
  window
, document
, (window.ScrollirisReadabilityReflector || {}).Context
);
