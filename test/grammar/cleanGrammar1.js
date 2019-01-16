I.js('../../src/grammar.js');

I.do('cleanGrammar():', function(I){
  var text, g;
  text = `
    Script:
      ?ScriptBody
    ScriptBody:
      StatementList[~Yield,~Await,~Return]
    StatementList[Yield,Await,Return]:
      +StatementListItem[?Yield,?Await,?Return]
    StatementListItem[Yield,Await,Return]:
      Statement[?Yield,?Await,?Return]
    Statement[Yield,Await,Return]:
      [+Return] ReturnStatement[?Yield,?Await]
      BreakableStatement[?Yield,?Await,?Return]
      VariableStatement[?Yield,?Await]
    ReturnStatement[Yield,Await]:
      \`return\` ;
    BreakableStatement[Yield,Await,Return]:
      IterationStatement[?Yield,?Await,?Return]
    IterationStatement[Yield,Await,Return]:
      \`for\` \\( \`var\` VariableDeclarationList[~In,?Yield,?Await] ; ?Expression[+In,?Yield,?Await] ; ?Expression[+In,?Yield,?Await] \\) Statement[?Yield,?Await,?Return]
    VariableStatement[Yield,Await]:
      \`var\` VariableDeclarationList[+In,?Yield,?Await] ;
    VariableDeclarationList[In,Yield,Await]:
      VariableDeclaration[?In,?Yield,?Await] *{ , VariableDeclaration[?In,?Yield,?Await] }
    VariableDeclaration[In,Yield,Await]:
      BindingIdentifier[?Yield,?Await] ?Initializer[?In,?Yield,?Await]
    BindingIdentifier[Yield,Await]:
      Identifier
      [~Yield] \`yield\`
      [~Await] \`await\`
    Initializer[In,Yield,Await]:
      = AssignmentExpression[?In,?Yield,?Await]
    Expression[In,Yield,Await]:
      AssignmentExpression[?In,?Yield,?Await]
    AssignmentExpression[In,Yield,Await]:
      ConditionalExpression[?In,?Yield,?Await]
    ConditionalExpression[In,Yield,Await]:
      LogicalORExpression[?In,?Yield,?Await]
    LogicalORExpression[In,Yield,Await]:
      LogicalANDExpression[?In,?Yield,?Await]
    LogicalANDExpression[In,Yield,Await]:
      BitwiseORExpression[?In,?Yield,?Await]
    BitwiseORExpression[In,Yield,Await]:
      BitwiseXORExpression[?In,?Yield,?Await]
    BitwiseXORExpression[In,Yield,Await]:
      BitwiseANDExpression[?In,?Yield,?Await]
    BitwiseANDExpression[In,Yield,Await]:
      EqualityExpression[?In,?Yield,?Await]
    EqualityExpression[In,Yield,Await]:
      RelationalExpression[?In,?Yield,?Await]
    RelationalExpression[In,Yield,Await]:
      ShiftExpression[?Yield,?Await]
      [+In] RelationalExpression[+In,?Yield,?Await] \`in\` ShiftExpression[?Yield,?Await]
    ShiftExpression[Yield,Await]:
      AdditiveExpression[?Yield,?Await]
    AdditiveExpression[Yield,Await]:
      MultiplicativeExpression[?Yield,?Await]
    MultiplicativeExpression[Yield,Await]:
      ExponentiationExpression[?Yield,?Await]
    ExponentiationExpression[Yield,Await]:
      UnaryExpression[?Yield,?Await]
    UnaryExpression[Yield,Await]:
      UpdateExpression[?Yield,?Await]
    UpdateExpression[Yield,Await]:
      LeftHandSideExpression[?Yield,?Await]                      
    LeftHandSideExpression[Yield,Await]:
      NewExpression[?Yield,?Await]
    NewExpression[Yield,Await]:
      MemberExpression[?Yield,?Await]
    MemberExpression[Yield,Await]:
      PrimaryExpression[?Yield,?Await]
    PrimaryExpression[Yield,Await]:
      \`this\`
      IdentifierReference[?Yield,?Await]
    IdentifierReference[Yield,Await]:
      Identifier
    Identifier:
      (?!(?:break|do|in|typeof|case|else|instanceof|var|catch|export|new|void|class|extends|return|while|const|finally|super|with|continue|for|switch|yield|debugger|function|this|default|if|throw|delete|import|try|await|enum)\b)[a-zA-Z_$][\w_$]*  
  `;
  
  I.hope(g = makeGrammar(text)).is.Object;
  console.log(Object.keys(g));
  I.hope(g = cleanGrammar(g)).is.Object;
  console.log(Object.keys(g));
});