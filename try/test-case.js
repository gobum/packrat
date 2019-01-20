I.js('../src/grammar.js');

I.do('Grammar():', function(I){
  I.do("Grammar('a:?/a/')", function(I){
    var g = Grammar('a:?/a/>b');
    I.hope(g).has.property('a');
    I.hope(g.a).is.Array;
    I.hope(g).deep.equal({a:[[[/a|/g, 1, 'b']]]});
    I.hope(g.a[0][0][0]).is.RegExp;
    I.hope(g.a[0][0][0].toString()).equal('/a|/g');
  });

  I.do("Grammar('a::/a/')", function(I){
    var g = Grammar('a::/a/');
    I.hope(g).has.property('a');
    I.hope(g.a).is.RegExp;
    I.hope(g.a.toString()).equal('/a|/g');
  });
  
});