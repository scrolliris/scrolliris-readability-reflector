function render(ctx) {
  // iframe
  let iframe = document.createElement('iframe');
  iframe.setAttribute('class', 'scrolliris-frame');

  // iframe container
  let container = document.createElement('div');
  container.setAttribute('id', 'scrolliris_container');
  container.appendChild(iframe);
  document.body.appendChild(container);

  // widget
  let currentScript = document.currentScript || (() => {
    let scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  let canvasJS = (ctx.settings || {}).canvasJS || currentScript.getAttribute(
      'src').replace(/(\.min)?\.js(\?)?/, '-canvas$1.js$2')
    , canvasCSS = (ctx.settings || {}).canvasCSS || currentScript.getAttribute(
      'src').replace(/(\.min)?\.js(\?)?/, '-canvas$1.css$2')
    ;

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
  iframe.contentWindow.SihlContext = ctx;
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(content);
  iframe.contentWindow.document.close();
}

function insertStyle() {
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
  height: 360px;
  border: 1px solid rgba(51, 51, 51, 0.18);
  border-radius: 1px;
}
`;

  let style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(cssContent));

  let s = document.getElementsByTagName('style')[0];
  s.parentNode.insertBefore(style, s);
}

(() => {
  insertStyle();

  let sihl = window.Sihl;
  let e;
  if (Array.isArray(sihl.q)) {
    e = sihl.q.shift();
  }
  if (e === undefined) {
    console.err('FIXME');
  } else if (e.length === 2) {
    let evt = e[0]
      , ctx = e[1] // {config, options}
      ;
    if (evt === 'init') {
      render(ctx);
    } else if (evt === 'update') {
      // TODO
    }
  }
})();
