import test from 'tape';

import Reflector, { WidgetProxy } from '../../src/browser';

test('Default member', (t) => {
  let reflector = window.ScrollirisReadabilityReflector;
  t.equal(Reflector === reflector, true, 'should be default member');
  t.end();
});

test('Widget', (t) => {
  let reflector = window.ScrollirisReadabilityReflector;
  t.equal('function' === typeof reflector.Widget, true, 'should be function');
  t.end();
});

test('WidgetProxy', (t) => {
  t.equal(undefined === WidgetProxy, true, 'should not be exported');
  t.end();
});
