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
    let width = (itm.state === 'block' ? itm.width : 'auto')
      , height = (itm.state === 'block' ? itm.height : 'auto')
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
          class: 'overlay'
        , state: (initialState === 'inactive' ? 'hidden' : 'block')
        , width: '100%'
        , height: document.body.scrollHeight + (
          // remains scrollable length
          this._getDocHeight() - this._getWinHeight()) + 'px'
      };
    } else { // minimap (default)
      itm = {
          class: 'minimap'
        , state: (initialState === 'inactive' ? 'hidden' : 'block')
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
          // https://img.scrolliris.com/icon/scrolliris-logo-white-64x64.png
          on: 'data:image/png;base64,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'
          // https://img.scrolliris.com/icon/scrolliris-logo-none-64x64.png
        , off: 'data:image/png;base64,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'
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

#scrolliris_widget .hidden {
  display: none;
  opacity: 0;
}

#scrolliris_widget #loader {
  width: 18px;
  height: 18px;
  margin: 3px auto;
  position: fixed;
  left: 16px !important;
  bottom: 16px !important;
  z-index: 1;
  border-radius: 100%;
  background: #802D92;
  animation-name: loading;
  animation-duration: .83s;
  animation-timing-function: cubic-bezier(.17, .37, .43, .67);
  animation-delay: 0;
  animation-direction: alternate;
  animation-iteration-count: infinite;
  animation-fill-mode: none;
  animation-play-state: running;
}

#scrolliris_widget {
  margin: 0;
  padding: 0;
  width: auto;
  height: auto;
}

@keyframes loading {
  0% {
    transform: scale(.3);
  }
  100% {
    transform: scale(1.25);
  }
}

`;
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
    frm.style.width = '${itm.class === 'overlay' ? '100%' : itm.width}';
    frm.style.height = '${itm.class === 'overlay' ? '100%' : itm.height}';
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
    ;
  if (itm.classList.contains('overlay')) {
    var img = icn.querySelector('img');
    if (itm.classList.contains('hidden')) {
      img.setAttribute('src', '${btn.src.on}');
    } else {
      img.setAttribute('src', '${btn.src.off}');
    }
  } else if (itm.classList.contains('minimap')) {
    var btn = icn.querySelector('button');
    btn.classList.toggle('hidden');
  }
}

`;
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
    <div id="loader"></div>
    <div id="scrolliris_item_container"
      class="minimap${itm.state === 'hidden' ? ' hidden' : ''}">
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
    <div id="scrolliris_icon_container" class="hidden">
      <button id="icon_button"
            type="button"
           class="btn${btn.state === 'hidden' ? ' hidden' : ''}"
         onclick="return toggleItem(this, event);">
        <img class="icon"
               src="${btn.src.on}"
               alt="Scrolliris Icon"
             width="${btn.width}"
            height="${btn.height}"></button>
    </div>
  </div>
  <script src="${js}"></script>
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
    <div id="loader"></div>
    <div id="scrolliris_item_container"
      class="overlay${itm.state === 'hidden' ? ' hidden' : ''}"
    onclick="return toggleItem(null, event);">
      <div id="scrolliris_overlay_container"></div>
    </div>
    <div id="scrolliris_icon_container" class="hidden">
      <button id="icon_button"
            type="button"
           class="btn${btn.state === 'hidden' ? ' hidden' : ''}"
         onclick="return toggleItem(this, event);">
        <img class="icon"
               src="${itm.state === 'hidden' ? btn.src.on : btn.src.off}"
               alt="Scrolliris Icon"
             width="${btn.width}"
            height="${btn.height}"></button>
    </div>
  </div>
  <script src="${js}"></script>
  <script>${this._buildScriptForWidget(itm, btn)}</script>
</body>`;
    return content.replace(
      /\n\s*|([\:;,"]|\)|}|if|else)\s+(\(|else|{)?/g, '$1$2');
  }
}

export default Widget;
