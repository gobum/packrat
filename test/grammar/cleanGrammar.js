I.js('../../src/grammar.js');

I.do('cleanGrammar():', function(I){
  var text, g;
  text = `A: B B[a]: B[?a]`;
  
  I.hope(g = makeGrammar(text)).is.Object;
  console.log(g.$);
  I.hope(g = cleanGrammar(g)).is.Object;
  console.log(Object.keys(g));
});