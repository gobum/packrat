I.js('../../src/grammar.js');
I.js('../../src/parse.js');

I.do('easy grammar:', function(I){
  var text = I.get('es7.txt');
  I.hope(text).is.ok;
  var g0 = readGrammar(text);
  I.hope(g0).is.Object;
  var g1 = makeGrammar(g0);
  I.hope(g1).is.Object;
  var g2 = linkGrammar(g1);
  I.hope(g2).is.Object;

  var code = '1+2';
  var ast = parse(code, g2, 'Expression', {blanked:1});
  text = ast2s(ast, g2, code);
  console.log(text);
  I.sum();
});