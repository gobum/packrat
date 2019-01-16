I.js('../../src/grammar.js');

I.do('regGrammar.exec(string):', function (I) {
  var re = RegExp(reGrammar), ms;
  var code = 'A: $B: [+C] D+a?b `var` ~ id ?{ = \\d+ }>R+In?Y ; | \n id: \\w+ 啊';

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.N]).equal('A');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.N]).equal('B');
  I.hope(ms[$.G]).equal('$');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.Q]).equal('+');
  I.hope(ms[$.C]).equal('C');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.S]).equal('D+a?b');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.K]).equal('var');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.L]).equal('~');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.I]).equal('id');
  I.hope(ms[$.S]).equal('id');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.F]).equal('?');
  I.hope(ms[$.B]).equal('{');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.O]).equal('=');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.O]).equal('\\d+');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.E]).equal('}');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.R]).equal('R+In?Y');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.O]).equal(';');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.D]).equal('|');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.W]).equal('\n ');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.N]).equal('id');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.O]).equal('\\w+');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.O]).equal('啊');

  I.hope(ms = re.exec(code)).is.not.ok;

  I.sum();
});

I.do('regGrammar.exec(regexp.source):', function (I) {
  var re = RegExp(reGrammar), ms;
  var code = /A: [+C] `var` ~ id ?{ = \d+ }>R+In?Y ; | id: \w+ 啊/.source;

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.N]).equal('A');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.Q]).equal('+');
  I.hope(ms[$.C]).equal('C');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.K]).equal('var');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.L]).equal('~');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.I]).equal('id');
  I.hope(ms[$.S]).equal('id');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.F]).equal('?');
  I.hope(ms[$.B]).equal('{');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.O]).equal('=');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.O]).equal('\\d+');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.E]).equal('}');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.R]).equal('R+In?Y');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.O]).equal(';');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.D]).equal('|');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.N]).equal('id');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.O]).equal('\\w+');

  I.hope(ms = re.exec(code)).is.ok;
  I.hope(ms[$.O]).equal('啊');

  I.hope(ms = re.exec(code)).is.not.ok;

  I.sum();
});

