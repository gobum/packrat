I.js('../../src/grammar.js');

I.do('newGrammarReader(text):', function (I) {
  var read = newGrammarReader('A: $B: [+C] D[+a,?b,~c] `var` ~ id ?{ = \\d+ }>R[+In,?Y] ; | \n id: \\w+ 啊');
  var ms;

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.N]).equal('A');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.N]).equal('B');
  I.hope(ms[$.G]).equal('$');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.Q]).equal('+');
  I.hope(ms[$.C]).equal('C');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.S]).equal('D');
  I.hope(ms[$.A]).equal('+a,?b,~c');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.K]).equal('var');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.L]).equal('~');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.I]).equal('id');
  I.hope(ms[$.S]).equal('id');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.F]).equal('?');
  I.hope(ms[$.B]).equal('{');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.O]).equal('=');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.O]).equal('\\d+');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.E]).equal('}');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.R]).equal('R');
  I.hope(ms[$.V]).equal('+In,?Y');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.O]).equal(';');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.D]).equal('|');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.W]).equal('\n ');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.N]).equal('id');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.O]).equal('\\w+');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.O]).equal('啊');
  I.hope(read()).equal(ms);

  I.hope(read.$).is.not.ok;
  I.hope(read()).is.not.ok;

  I.sum();
});

I.do('newGrammarReader(regexp):', function (I) {
  var read = newGrammarReader(/A: [+C] `var` ~ id ?{ = \d+ }>R[+In,?Y] ; | id: \w+ 啊/);
  var ms;

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.N]).equal('A');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.Q]).equal('+');
  I.hope(ms[$.C]).equal('C');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.K]).equal('var');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.L]).equal('~');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.I]).equal('id');
  I.hope(ms[$.S]).equal('id');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.F]).equal('?');
  I.hope(ms[$.B]).equal('{');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.O]).equal('=');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.O]).equal('\\d+');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.E]).equal('}');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.R]).equal('R');
  I.hope(ms[$.V]).equal('+In,?Y');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.O]).equal(';');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.D]).equal('|');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.N]).equal('id');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.O]).equal('\\w+');
  I.hope(read()).equal(ms);

  I.hope(ms = read.$).is.ok;
  I.hope(ms[$.O]).equal('啊');
  I.hope(read()).equal(ms);

  I.hope(read.$).is.not.ok;
  I.hope(read()).is.not.ok;

  I.sum();
});

