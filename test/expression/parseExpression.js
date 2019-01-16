I.js('../../src/grammar.js');
I.do('Parse expression:', function(I){
  var text = I.get('expression.txt');
  I.hope(text).is.ok;
  var expression = readGrammar(text);
  expression = makeGrammar(expression);

});