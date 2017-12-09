class Widget {
  constructor(config, context={}) {
    this.config = config;
    this.context = context;
  }

  render() {
    let ctx = this.context;
    let settings = (ctx.settings || {})
      , options = (ctx.options || {'widget': 'active'})
      ;

    var [frm, map, btn] = this._buildComponents(options.widget);

    this._insertStyle(frm);

    /**
     * NOTE:
     *
     * DOM Structure
     *
     * div#scrolliris_container
     *   iframe#scrolliris_frame
     *     html
     *       body
     *         div#scrolliris_widget
     *           div#scrolliris_icon_container
     *           (minimap)
     *           div#scrolliris_minimap_container
     *             div#scrolliris_minimap_canvas_container
     *           (overlay)
     *           none
    */

    // iframe
    let iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'scrolliris_frame');

    // iframe container
    let container = document.createElement('div');
    container.setAttribute('id', 'scrolliris_container');
    container.appendChild(iframe);
    document.body.appendChild(container);

    let currentScript = ctx.currentScript || document.currentScript
      , scriptSrc = currentScript.getAttribute('src') || ''
      ;
    // This part assumes -(minimap|overlay).(js|css) are both hosted in
    // same location as current script.
    //
    // reflector.js         --> reflector-(minimap|overlay).js,.css
    // reflector-browser.js --> reflector-(minimap|overlay).js,.css
    let reflectorJSRegex = /(-browser)?(\.min)?\.js(\?)?/;
    let src = {};

    // -- minimap
    src.js = settings.minimap.js || scriptSrc.replace(
      reflectorJSRegex, '-minimap$2.js$3').toString();
    src.css = settings.minimap.css || scriptSrc.replace(
      reflectorJSRegex, '-minimap$2.css$3').toString();

    if (src.js === '' || src.css === '') {
      console.error('widget source (js|css) is missing');
    }

    // -- overlay
    // TODO

    let widget = this._makeMinimap(btn, map, src.js, src.css);

    iframe.contentWindow.ScrollirisReadabilityReflector = {
      Context: ctx
    };
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(widget);
    iframe.contentWindow.document.close();
  }

  _insertStyle(frm) {
    let cssContent = `
#scrolliris_container {
  position: fixed;
  margin: 0;
  padding: 0;
  width: auto;
  height: auto;
  left: 0px;
  bottom: 0px;
  z-index: 9999999 !important;
}

#scrolliris_frame {
  z-index: 9999999 !important;
  position: fixed !important;
  margin: 0;
  padding: 0;
  width: ${frm.width}px;
  height: ${frm.height}px;
  left: 9px;
  bottom: 9px;
  border: 0;
}
`;

    let style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(cssContent));

    let h = document.getElementsByTagName('head')[0];
    h.appendChild(style);
  }

  _buildComponents(widgetState) {
    let map = {
        state: (widgetState === 'inactive' ? 'hidden' : 'block')
      , width: '260'
      , height: '400'
      }, btn = {
        state: (widgetState === 'inactive' ? 'block' : 'hidden')
      , width: '48'
      , height: '48'
      , src: 'https://img.scrolliris.io/icon/scrolliris-logo-white-64x64.png'
      };

    let frm = {
      width: (map.state === 'hidden' ? btn.width : map.width)
    , height: (map.state === 'hidden' ? btn.height : map.height)
    };

    return [frm, map, btn];
  }

  _makeMinimap(btn, map, js, css) {
    let content = `
<head>
  <meta charset="utf-8">
  <style>
body {
  margin: 0;
  padding: 0;
}

:focus {
  outline: none;
}

::-moz-focus-inner {
  border: 0;
}

#scrolliris_icon_container .btn,
#scrolliris_minimap_container .btn {
  cursor: pointer;
  margin: 0;
  padding: 0;
  outline: 0;
  outline-style: none;
  border: 0;
  background: none;
  box-shadow: none;
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
}

.hidden {
  display: none;
  border: 0;
  width: 0;
  height: 0;
}

#scrolliris_widget {
  margin: 0;
  padding: 0;
  width: auto;
  height: auto;
}

#scrolliris_widget .icon {
  margin: 0;
  padding: 0;
}

#scrolliris_minimap_container {
  background-color: #ffffff;
  max-width: 260px;
  max-height: 400px;
  border: 1px solid rgba(51, 51, 51, 0.18);
  border-radius: 1px;
}
  </style>
  <link rel="stylesheet" href="${css}">
</head>
<body>
  <div id="scrolliris_widget">
    <div id="scrolliris_icon_container">
      <button type="button" class="btn ${btn.state}" onclick="return toggleMinimap(this, event);">
        <img class="icon" src="${btn.src}" alt="Scrolliris Icon" width="${btn.width}" height="${btn.height}"></button>
    </div>
    <div id="scrolliris_minimap_container" class="${map.state}">
      <div id="scrolliris_header">
        <div class="header">
          <h1 style="font-family:monospace;">READABILITY HEATMAP</h1>
          <button type="button" class="btn close" onclick="return toggleMinimap(null, event)">×</button>
        </div>
      </div>
      <div id="scrolliris_minimap_canvas_container"></div>
      <div id="scrolliris_footer">
        <p class="txt">Powered by <a href="https://about.scrolliris.com/" target="_blank">Scrolliris</a></p>
      </div>
    </div>
  </div>
  <script async src="${js}"></script>
  <script>
function _resetMinimap(minimap) {
  var frame = window.parent.document.getElementById('scrolliris_frame');
  if (minimap.classList.contains('hidden')) {
    frame.setAttribute('style', 'height:48px;width:48px;');
  } else {
    frame.setAttribute('style', 'height:400px;width:260px;');
  }
}

function toggleMinimap(self, e) {
  e.preventDefault();
  var minimap = document.getElementById('scrolliris_minimap_container');
  minimap.classList.toggle('hidden');
  _resetMinimap(minimap);
  if (self !== null) {
    self.classList.toggle('hidden');
  } else {
    var icon = document.getElementById('scrolliris_icon_container')
      , btn = icon.querySelector('button')
    ;
    btn.classList.toggle('hidden');
  }
}
  </script>
</body>
`;
    return content.replace(/\n\s*/g, '');
  }
}

export default Widget;
