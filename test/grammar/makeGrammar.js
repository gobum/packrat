I.js('../../src/grammar.js');

I.do('makeGrammar(text):', function (I) {
  I.do('SingleLineComment:', function(I){
    var g = readGrammar('SingleLineComment: \\/\\/.*');
    I.hope(g = makeGrammar(g)).is.Object;
    I.hope(String(g.SingleLineComment)).equal('/\\/\\/.*|/g');

    I.sum();
  });

  I.do('EmptyStatement:', function (I) {
    var g = readGrammar('EmptyStatement: ;');
    I.hope(g = makeGrammar(g) ).is.Object;
    I.hope(String(g.EmptyStatement)).equal('/;|/g');

    I.sum();
  });

  I.do('MetaProperty:', function(I){
    var g, rules, rule, item;
    g = readGrammar('MetaProperty: NewTarget NewTarget: `new` \\. `target`');
    I.hope(g = makeGrammar(g)).is.Object;
    I.hope(rules = g.MetaProperty).is.Array;
    I.hope(rule = rules[0]).is.Array;
    I.hope(rule[0]).is.Array;
    I.hope(rule[0][0]).strict.equal('NewTarget');
    I.hope(rules = g.NewTarget).is.Array;
    I.hope(rule = rules[0]).is.Array;
    I.hope(rule[0]).is.Array;
    I.hope(String(rule[0][0])).equal('/\\bnew\\b|/g');
    I.hope(String(rule[1][0])).equal('/\\.|/g');
    I.hope(String(rule[2][0])).equal('/\\btarget\\b|/g');
    
    I.sum();
  });
  
  I.do('Script:', function(I){
    var text, g, rules, rule, item;
    text = `
      Script:
        ?ScriptBody
      ScriptBody:
        StatementList[~Yield,~Await,~Return]
      StatementList:
        +StatementListItem[?Yield,?Await,?Return]
      StatementListItem:
        Statement[?Yield,?Await,?Return]
      Statement:
        [+Return] ReturnStatement[?Yield,?Await]
        BreakableStatement[?Yield,?Await,?Return]
        VariableStatement[?Yield,?Await]
      ReturnStatement:
        \`return\` ;
      BreakableStatement:
        IterationStatement[?Yield,?Await,?Return]
      IterationStatement:
        \`for\` \\( \`var\` VariableDeclarationList[~In,?Yield,?Await] ; ?Expression[+In,?Yield,?Await] ; ?Expression[+In,?Yield,?Await] \\) Statement[?Yield,?Await,?Return]
      VariableStatement:
        \`var\` VariableDeclarationList[+In,?Yield,?Await] ;
      VariableDeclarationList:
        VariableDeclaration[?In,?Yield,?Await] *{ , VariableDeclaration[?In,?Yield,?Await] }
      VariableDeclaration:
        BindingIdentifier[?Yield,?Await] ?Initializer[?In,?Yield,?Await]
      BindingIdentifier:
        Identifier
        [~Yield] \`yield\`
        [~Await] \`await\`
      Initializer:
        = AssignmentExpression[?In,?Yield,?Await]
      Expression:
        AssignmentExpression[?In,?Yield,?Await]
      AssignmentExpression:
        ConditionalExpression[?In,?Yield,?Await]
      ConditionalExpression:
        LogicalORExpression[?In,?Yield,?Await]
      LogicalORExpression:
        LogicalANDExpression[?In,?Yield,?Await]
      LogicalANDExpression:
        BitwiseORExpression[?In,?Yield,?Await]
      BitwiseORExpression:
        BitwiseXORExpression[?In,?Yield,?Await]
      BitwiseXORExpression:
        BitwiseANDExpression[?In,?Yield,?Await]
      BitwiseANDExpression:
        EqualityExpression[?In,?Yield,?Await]
      EqualityExpression:
        RelationalExpression[?In,?Yield,?Await]
      RelationalExpression:
        ShiftExpression[?Yield,?Await] *{ [+In] \`in\` ShiftExpression[?Yield,?Await] }
      ShiftExpression:
        AdditiveExpression[?Yield,?Await]
      AdditiveExpression:
        MultiplicativeExpression[?Yield,?Await]
      MultiplicativeExpression:
        ExponentiationExpression[?Yield,?Await]
      ExponentiationExpression:
        UnaryExpression[?Yield,?Await]
      UnaryExpression:
        UpdateExpression[?Yield,?Await]
      UpdateExpression:
        LeftHandSideExpression[?Yield,?Await]                      
      LeftHandSideExpression:
        NewExpression[?Yield,?Await]
      NewExpression:
        MemberExpression[?Yield,?Await]
      MemberExpression:
        PrimaryExpression[?Yield,?Await]
      PrimaryExpression:
        \`this\`
        IdentifierReference[?Yield,?Await]
      IdentifierReference:
        Identifier
      Identifier:
        (?!(?:break|do|in|typeof|case|else|instanceof|var|catch|export|new|void|class|extends|return|while|const|finally|super|with|continue|for|switch|yield|debugger|function|this|default|if|throw|delete|import|try|await|enum)\b)[a-zA-Z_$][\w_$]*  
  `;
    
    g = readGrammar(text);
    I.hope(g = makeGrammar(g)).is.Object;
    I.hope(g.Script[0][0][0]).strict.equal('ScriptBody');
    I.hope(g.Script[0][0][1]).equal(1);
    I.hope(g.ScriptBody[0][0][0]).strict.equal('StatementList');
    I.hope(g.ScriptBody[0][0][1]).equal(0);
    I.hope(g.StatementList[0][0][0]).strict.equal('StatementListItem');
    I.hope(g.StatementList[0][0][1]).equal(2);
    I.hope(g.StatementListItem[0][0][0]).strict.equal('Statement');
    I.hope(g.StatementListItem[0][0][1]).equal(0);
    I.hope(g.Statement[0][0][0]).strict.equal('BreakableStatement');
    I.hope(g.Statement[0][0][1]).equal(0);
    I.hope(g.Statement[1][0][0]).strict.equal('VariableStatement');
    I.hope(g.Statement[1][0][1]).equal(0);
    
    // var keys = [], i=0;
    // for(keys[i++] in g);
    // console.log(keys.reverse());
    // console.log();
    // console.log(keys.sort());
    I.sum();
  });
  
});
