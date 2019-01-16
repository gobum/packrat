I.js('../../src/grammar.js');
I.js('./g.js');

I.do('html grammar:', function(I){
  var text = I.get('g.txt');
  I.hope(text).is.ok;
  var g = readGrammar(text);
  I.hope(g).deep.equal(g0);
  g = makeGrammar(g);
  I.hope(g).deep.equal(g1);
  g = linkGrammar(g);
  I.hope(g).deep.equal(g2);
  
  I.sum();
});