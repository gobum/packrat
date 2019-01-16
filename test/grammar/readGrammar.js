I.js('../../src/grammar.js');

I.do('readGrammar(text):', function (I) {
  I.do('SingleLineComment:', function(I){
    var g, s;
    I.hope(g = readGrammar('SingleLineComment: \\/\\/.*')).is.Object;
    I.hope(s = g.SingleLineComment).is.Object;
    I.hope(s.t).equal(0);
    I.hope(s.s).equal('\\/\\/.*');

    I.sum();
  });

  I.do('EmptyStatement:', function (I) {
    var g;
    I.hope(g = readGrammar('EmptyStatement: ;')).is.Object;
    I.hope(String(g.EmptyStatement)).equal('/;|/g');

    I.sum();
  });

  I.do('MetaProperty:', function(I){
    var g, rules, rule, item;
    I.hope(g = readGrammar('MetaProperty: NewTarget')).is.Object;
    I.hope(rules = g.MetaProperty).is.Array;
    I.hope(rule = rules[0]).is.Array;
    I.hope(rule[0]).is.Array;
    I.hope(rule[0][0][0]).strict.equal('NewTarget');
    I.hope(rule[0][0][1]).deep.equal([]);

    I.sum();
  });

  I.do('VariableStatement:', function (I) {
    var text, g, rules, rule, item;
    text = 'VariableStatement: `var` VariableDeclarationList+In?Yield?Await ;';
    I.hope(g = readGrammar(text)).is.Object;

    I.hope(rules = g.VariableStatement).is.Array;
    I.hope(rules.length).equal(1);
    I.hope(rule = rules[0]).is.Array;
    I.hope(rule.length).equal(3);

    I.hope(rule[0]).is.Array;
    I.hope(rule[0].length).equal(2);
    I.hope(rule[0][0]).is.RegExp;
    I.hope(String(rule[0][0])).equal('/\\bvar\\b|/g');
    I.hope(rule[0][1]).equal(0);

    I.hope(rule[1]).is.Array;
    I.hope(rule[1].length).equal(2);
    I.hope(rule[1][0][0]).strict.equal('VariableDeclarationList');
    I.hope(rule[1][0][1]).deep.equal([['+', 'In'],['?', 'Yield'],['?', 'Await']]);
    I.hope(rule[1][1]).equal(0);

    I.hope(rule[2]).is.Array;
    I.hope(rule[2].length).equal(2);
    I.hope(rule[2][0]).is.RegExp;
    I.hope(String(rule[2][0])).equal('/;|/g');
    I.hope(rule[2][1]).equal(0);

    I.sum();
  });

  I.do('Statement:', function (I) {
    var text, g, rules, rule, subs, sub, usage;
    text = 'Statement: EmptyStatement | [+Return] ReturnStatement[?Yield,?Await]\n\
    ReturnStatement: `return` ?{ ~ Expression[+In,?Yield,?Await] } ;';
    I.hope(g = readGrammar(text)).is.Object;

    I.hope(rules = g.Statement).is.Array;
    I.hope(rules.length).equal(2);
    I.hope(rule = rules[0]).is.Array;
    I.hope(rule[0][0][0]).strict.equal('EmptyStatement');
    I.hope(rule[0][0][1]).deep.equal([]);
    I.hope(rule = rules[1]).is.Array;
    I.hope(rule.q).is.ok;
    I.hope(rule.c).equal('Return');
    I.hope(rule[0][0][0]).strict.equal('ReturnStatement');
    I.hope(rule[0][0][1]).deep.equal([['?', 'Yield'],['?', 'Await']]);
    
    I.hope(rules = g.ReturnStatement).is.Array;
    I.hope(rules.length).equal(1);
    I.hope(rule = rules[0]).is.Array;
    I.hope(rule.length).equal(3);
    I.hope(String(rule[0][0])).equal('/\\breturn\\b|/g');
    I.hope(rule[1][1]).equal(OPTION);
    I.hope(subs = rule[1][0]).is.Array;
    I.hope(subs.length).equal(1);
    I.hope(sub = subs[0]).is.Array;
    I.hope(sub.length).equal(2);
    I.hope(sub[0][0]).is.RegExp;
    I.hope(String(sub[0][0])).equal('/[\\n\\r\\u2028\\u2029]|/g');
    I.hope(sub[0][1]).equal(DENY|NOWRAP);
    I.hope(sub[1][0][0]).strict.equal('Expression');
    I.hope(sub[1][0][1]).deep.equal([['+', 'In'],['?', 'Yield'],['?', 'Await']]);
    I.hope(String(rule[2][0])).equal('/;|/g');


    I.sum();
  });

  I.do('CallExpression:', function(I){
    var text, g;
    text = 'CallExpression:\
      CoverAsyncExpression[?Yield,?Await] >CallMemberExpression[?Yield,?Await]';
    I.hope(g = readGrammar(text)).is.Object;
    I.hope(g.CallExpression[0][0][0][0]).strict.equal('CoverAsyncExpression');
    I.hope(g.CallExpression[0][0][0][1]).deep.equal([['?','Yield'],['?','Await']]);
    I.hope(g.CallExpression[0][0][2][0]).strict.equal('CallMemberExpression');
    I.hope(g.CallExpression[0][0][2][1]).deep.equal([['?','Yield'],['?','Await']]);
    
    I.sum();
  });

  I.do('RelationalExpression:', function(I){
    var text, g, rules, subs;
    text = 'RelationalExpression:\
      ShiftExpression[?Yield,?Await] *{ { <=?|>=? | `instanceof` | [+In] `in` } ShiftExpression[?Yield,?Await] }';
    I.hope(g = readGrammar(text)).is.Object;
    I.hope(g.RelationalExpression[0][0][0][0]).strict.equal('ShiftExpression');
    I.hope(rules = g.RelationalExpression[0][1][0]).is.Array;
    I.hope(g.RelationalExpression[0][1][1]).equal(3);
    I.hope(subs = rules[0][0][0]).is.Array;
    I.hope(String(subs[0][0][0])).equal('/<=?|>=?|/g');
    I.hope(String(subs[1][0][0])).equal('/\\binstanceof\\b|/g');
    I.hope(String(subs[2][0][0])).equal('/\\bin\\b|/g');
    I.hope(rules[0][1][0][0]).strict.equal('ShiftExpression');
    
    I.sum();
  });
  

  I.do('Must not match an empty string:', function(I){
    I.hope(readGrammar, 'x: \\S*').throw('\\S* must not match an empty string at 1:4');
    I.sum();
  });
});
