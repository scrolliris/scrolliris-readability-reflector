class Widget {
  constructor(config, context={}) {
    this.config = config;
    this.context = context;

    this._iconMargin = 4;
    this._iconWidth = 48;
    this._minimapWidth = 260;
    this._minimapHeight = 400;
  }


  render() {
    let ctx = this.context;
    let settings = (ctx.settings || {})
      , options = (ctx.options || {widget: {
          extension: 'minimap'
        , initialState: 'inactive'
        }})
      ;

    if ((options.widget.extension in ['minimap', 'overlay']) ||
        (options.widget.initialState in ['active', 'inactive'])) {
      return;
    }

    var [itm, btn] = this._buildProperties(
      options.widget.initialState, options.widget.extension);

    // css
    let style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(this._buildStyle(itm)));

    let h = document.getElementsByTagName('head')[0];
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
    let iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'scrolliris_frame');

    let container = document.createElement('div');
    container.setAttribute('id', 'scrolliris_container');
    container.appendChild(iframe);
    document.body.appendChild(container);

    let widget = this._buildWidget(options.widget.extension,
      itm, btn, ctx, settings);

    iframe.contentWindow.ScrollirisReadabilityReflector = {Context: ctx};
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(widget);
    iframe.contentWindow.document.close();
  }

  _buildStyle(itm) {
    let _size = (itm.state === 'block' ? '100%' : 'auto');
    let width = _size
      , height = _size
      ;
    return `
#scrolliris_container {
  margin: 0;
  padding: 0;
  padding-left: 6px !important;
  padding-bottom: 6px !important;
  width: auto;
  height: auto;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 2147483647;
}

#scrolliris_frame {
  margin: 0;
  padding: 0;
  width: ${width};
  height: ${height};
  border: 0;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 2147483647;
}
`;
  }

  _getWinHeight() {
    return window.innerHeight ||
      (document.documentElement || document.body).clientHeight;
  }

  _getDocHeight() {
    return Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
  }

  _buildProperties(initialState, extension) {
    let itm;
    if (extension === 'overlay') {
      itm = {
          state: (initialState === 'inactive' ? 'hidden' : 'block')
        , width: '100%'
        , height: document.body.scrollHeight + (
          // remains scrollable length
          this._getDocHeight() - this._getWinHeight()) + 'px'
      };
    } else { // minimap (default)
      itm = {
          state: (initialState === 'inactive' ? 'hidden' : 'block')
        , width: this._minimapWidth + 'px'
        , height: this._minimapHeight + 'px'
      };
    }
    let cdn = 'https://img.scrolliris.com/';
    let btn = {
        state: (initialState === 'inactive' ? 'block' :
          (extension === 'overlay' ? 'block' : 'hidden'))
        // button image size (width, height)
      , width: this._iconWidth - (this._iconMargin / 2) + 'px'
      , height: this._iconWidth - (this._iconMargin / 2) + 'px'
      , src: {
          on: cdn + 'icon/scrolliris-logo-white-64x64.png'
        , off: cdn + 'icon/scrolliris-logo-none-64x64.png'
        }
      };
    return [itm, btn];
  }

  _buildWidget(extension, itm, btn, ctx, settings) {
    let currentScript = ctx.currentScript || document.currentScript
      , scriptSrc = currentScript.getAttribute('src') || ''
      ;

    // This part assumes -(minimap|overlay).(js|css) are both hosted in
    // same location as current js script.
    //
    // reflector.js         --> reflector-(minimap|overlay).js,.css
    // reflector-browser.js --> reflector-(minimap|overlay).js,.css
    let reflectorJSRegex = /(-browser)?(\.min)?\.js(\?)?/;

    function getRemote(name, ext) {
      return settings.hasOwnProperty(name) ? settings[name][ext] :
        scriptSrc.replace(
          reflectorJSRegex,
          '-' + name + '$2.' + ext + '$3').toString();
    }

    let src = {
          js: getRemote(extension, 'js')
        , css: getRemote(extension, 'css')
        };

    if (src.js === '' || src.css === '') {
      console.error('widget:' + extension +' No such extension');
    }

    function capitalize(str) {
      return str && str[0].toUpperCase() + str.slice(1);
    }

    // call _make(Minimap|Overlay) function
    return (this['_make' + capitalize(extension)])(
      itm, btn, src.js, src.css);
  }

  _buildStyleForWidget() {
    return `
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

*:focus {
  outline: none;
}

*::-moz-focus-inner {
  border: 0;
}

#scrolliris_item_container {
  width: auto;
  height: auto;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
}

#scrolliris_icon_container {
  width: auto;
  height: auto;
  position: fixed;
  left: 6px;
  bottom: 6px !important;
  z-index: 1;
  display: block;
}

#scrolliris_icon_container .btn,
#scrolliris_item_container .btn {
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
  opacity: 0;
}

#scrolliris_widget {
  margin: 0;
  padding: 0;
  width: auto;
  height: auto;
}`;
  }

  _buildScriptForWidget(itm, btn) {
    return `
function _resetWidget(itm) {
  var frm = window.parent.document.getElementById('scrolliris_frame');
  if (itm.classList.contains('hidden')) {
    frm.style.width = 'auto';
    frm.style.height = 'auto';
    itm.style.width = '0px';
    itm.style.height = '0px';
  } else {
    frm.style.width = '100%';
    frm.style.height = '100%';
    itm.style.width = '${itm.width}';
    itm.style.height = '${itm.height}';
  }
}

function toggleItem(slf, e) {
  e.preventDefault();
  var itm = document.getElementById('scrolliris_item_container');
  itm.classList.toggle('hidden');
  _resetWidget(itm);
  var icn = document.getElementById('scrolliris_icon_container')
    , img = icn.querySelector('img')
    ;
  if (itm.classList.contains('hidden')) {
    img.setAttribute('src', '${btn.src.on}');
  } else {
    img.setAttribute('src', '${btn.src.off}');
  }
}`;
  }

  _makeMinimap(itm, btn, js, css) {
    let content = `
<head>
  <meta charset="utf-8">
  <style>${this._buildStyleForWidget()}</style>
  <link rel="stylesheet" href="${css}">
</head>
<body>
  <div id="scrolliris_widget">
    <div id="scrolliris_item_container"
      class="ext${itm.state === 'hidden' ? ' hidden' : ''}">
      <div id="scrolliris_header">
        <div class="header">
          <h1 style="font-family:monospace;">READABILITY HEATMAP</h1>
          <button type="button"
                 class="btn close"
               onclick="return toggleItem(null, event)">×</button>
        </div>
      </div>
      <div id="scrolliris_minimap_container"></div>
      <div id="scrolliris_footer">
        <p class="txt">Powered by <a href="https://about.scrolliris.com/"
                                   target="_blank">Scrolliris</a></p>
      </div>
    </div>
    <div id="scrolliris_icon_container">
      <button type="button"
             class="btn${btn.state === 'hidden' ? ' hidden' : ''}"
           onclick="return toggleItem(this, event);">
        <img class="icon"
               src="${btn.src.on}"
               alt="Scrolliris Icon"
             width="${btn.width}"
            height="${btn.height}"></button>
    </div>
  </div>
  <script async src="${js}"></script>
  <script>${this._buildScriptForWidget(itm, btn)}</script>
</body>`;
    return content.replace(
      /\n\s*|([\:;,"]|\)|}|if|else)\s+(\(|else|{)?/g, '$1$2');
  }

  _makeOverlay(itm, btn, js, css) {
    let content = `
<head>
  <meta charset="utf-8">
  <style>${this._buildStyleForWidget()}</style>
  <link rel="stylesheet" href="${css}">
</head>
<body>
  <div id="scrolliris_widget">
    <div id="scrolliris_item_container"
      class="ext${itm.state === 'hidden' ? ' hidden' : ''}"
    onclick="return toggleItem(null, event);">
      <div id="scrolliris_overlay_container"></div>
    </div>
    <div id="scrolliris_icon_container">
      <button type="button"
             class="btn${btn.state === 'hidden' ? ' hidden' : ''}"
           onclick="return toggleItem(this, event);">
        <img class="icon"
               src="${itm.state === 'hidden' ? btn.src.on : btn.src.off}"
               alt="Scrolliris Icon"
             width="${btn.width}"
            height="${btn.height}"></button>
    </div>
  </div>
  <script async src="${js}"></script>
  <script>${this._buildScriptForWidget(itm, btn)}</script>
</body>`;
    return content.replace(
      /\n\s*|([\:;,"]|\)|}|if|else)\s+(\(|else|{)?/g, '$1$2');
  }
}

export default Widget;
