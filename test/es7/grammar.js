I.js('../../src/grammar.js');
I.do('ES7 grammar compile:', function(I){
  var text = I.get('es7.txt');
  I.hope(text).is.ok;
  var es7 = readGrammar(text);
  es7 = makeGrammar(es7);
  var keys = Object.keys(es7).sort();
  console.log(keys.join('\n'));
});