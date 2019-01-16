I.js('../../src/grammar.js');

I.do('regstr(any, keys):', function (I) {
  var keys;
  I.hope(regstr(['a', 'b', 'c'])).equal('abc');
  I.hope(regstr($('a', 'b', 'c'))).equal('a|b|c');
  I.hope(regstr(['a', { b: 'b' }, 'c'], keys = {})).equal('a(b)c');
  I.hope(keys.b).equal(1);
  I.hope(regstr($('a', { B: 'b' }, 'c'), keys = {})).equal('a|(b)|c');
  I.hope(keys.B).equal(1);
  I.hope(regstr(['a', { B: $('b1', { b: 'b2' }, 'b3') }, 'c'], keys = {})).equal('a(b1|(b2)|b3)c');
  I.hope(keys.B).equal(1);
  I.hope(keys.b).equal(2);

  I.sum();
});

