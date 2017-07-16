import Widget from './index';

var currentScript = document.currentScript;

class WidgetProxy {
  constructor(config, context={}) {
    context.currentScript = currentScript;
    this._widget = new Widget(config, context);
  }

  render() {
    return this._widget.render();
  }
}

var ScrollirisReadabilityReflector = {
  Widget: WidgetProxy
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollirisReadabilityReflector;
}

window.ScrollirisReadabilityReflector = ScrollirisReadabilityReflector;
