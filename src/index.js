class Widget {
  constructor(config, context={}) {
    this.config = config;
    this.context = context;
  }

  render() {
    let ctx = this.context;

    this._insertStyle();

    // iframe
    let iframe = document.createElement('iframe');
    iframe.setAttribute('class', 'scrolliris-frame');

    // iframe container
    let container = document.createElement('div');
    container.setAttribute('id', 'scrolliris_container');
    container.appendChild(iframe);
    document.body.appendChild(container);

    let currentScript = ctx.currentScript || document.currentScript
      , scriptSrc = currentScript.getAttribute('src') || ''
      ;
    // This part assumes -canvas.{js|css} are both hosted in same location
    // as -browser.js.
    //
    // reflector.js         --> reflector-canvas.js,.css
    // reflector-browser.js --> reflector-canvas.js,.css
    let reflectorJSRegex = /(-browser)?(\.min)?\.js(\?)?/;
    let canvasJS = (ctx.settings || {}).canvasJS || scriptSrc.replace(
          reflectorJSRegex, '-canvas$2.js$3').toString()
      , canvasCSS = (ctx.settings || {}).canvasCSS || scriptSrc.replace(
          reflectorJSRegex, '-canvas$2.css$3').toString()
      ;

    if (canvasJS === '') {
      console.error('canvasJS is missing');
    }
    if (canvasCSS === '') {
      console.error('canvasCSS is missing');
    }

    let content = `
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="${canvasCSS}">
</head>
<body>
  <div id="scrolliris_header">
    <h1>Text Readability Heatmap<span class="label">BETA</span></h1>
    <!-- <button class="btn close">close</button> -->
  </div>
  <div id="scrolliris_canvas_container"></div>
  <div id="scrolliris_footer">
    <p class="txt">Powered by
      <a href="https://scrolliris.com/" target="_blank">Scrolliris</a></p>
  </div>
  <script src="${canvasJS}"></script>
</body>
`;
    content = content.replace(/\n/g, '');
    iframe.contentWindow.ScrollirisReadabilityReflector = {
      Context: ctx
    };
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(content);
    iframe.contentWindow.document.close();
  }

  _insertStyle() {
    let cssContent = `
#scrolliris_container {
  position: fixed;
  width: 0px;
  height: 0px;
  bottom: 0px;
  left: 0px;
  z-index: 9999999 !important;
}

#scrolliris_container .scrolliris-frame {
  z-index: 9999999 !important;
  position: fixed !important;
  bottom: 9px;
  left: 9px;
  width: 260px;
  height: 400px;
  border: 1px solid rgba(51, 51, 51, 0.18);
  border-radius: 1px;
}
`;

    let style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(cssContent));

    let h = document.getElementsByTagName('head')[0];
    h.appendChild(style);
  }
}

export default Widget;
