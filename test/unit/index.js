import test from 'tape';

import Widget from '../../src/index';

test('Constructor', (t) => {
  t.equal('function' === typeof Widget, true, 'should be function');
  t.end();
});

test('Widget instantiation', (t) => {
  let w = new Widget({}, {});
  t.equal(w instanceof Widget, true, 'should be instance of Widget');
  t.end();
});

test('Properties', (t) => {
  let w = new Widget('config', 'context');
  t.equal('config' === w.config, true, 'should have config property');
  t.equal('context' === w.context, true, 'should have context property');
  t.end();
});
