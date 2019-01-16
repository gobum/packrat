I.js('../../src/grammar.js');
I.js('../../src/parse.js');
I.js('./g.js');

I.do('html parse:', function(I){
  var text = I.get('g.txt');
  I.hope(text).is.ok;
  var g = readGrammar(text);
  g = makeGrammar(g);
  g = linkGrammar(g);

  var code = '<a>hello<b>world</a>';
  var ast = parse(code, g, 'Element', {});

  console.log(ast2s(ast, g, code));
   
  I.sum();
});