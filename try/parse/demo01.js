

var grammar = {
  Statement: [
    [ 'CommaStatement'],
    ['ReturnStatement']
  ],
  CommaStatement: [
    ['return', ',']
  ],
  ReturnStatement: [
    ['return', ";"]
  ],
  return: "\\breturn\\b",
  ',': ",",
  ';': ";",
  '': "\\s+",
  ' ': "[\\u0020\\t\\v\\f\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000\\ufeff\\ufffe]",
};

link(grammar);

function link(grammar) {
  var keys = Object.getOwnPropertyNames(grammar), key, syntax, i;
  for (i=0; i<keys.length; i++) {
    key = keys[i];
    syntax = grammar[key];
    if(typeof syntax === 'string') {
      grammar[key] = syntax = RegExp(syntax+"|", "g");
      syntax.t = key;
    }
  }
  for (i=0; i<keys.length; i++) {
    key = keys[i];
    syntax = grammar[key];
    if(syntax instanceof Array) {
      for(var ri=0, rule; rule=syntax[ri]; ri++) {
        for(var ii=0, item; item = rule[ii]; ii++) {
          rule[ii] = grammar[item];
        }
      }
    }
  }    
}

function parse(code, type) {
  //var syntax = grammar[name];
  var file = { s: code, i: 0, p: [] };

  var token = parseSyntax(type, file);
  return token;
}

function parseSyntax(type, file) {
  var token, i=file.i, pack = file.p, parsed = pack[i];
  if (token = parsed && parsed[type]) {  // 若已解析过，则直接返回缓存结果
    file.i += token.l || token.length;
    return token;
  }
  var syntax = grammar[type];
  if(! syntax) throw Error('Unknow syntax of '+type);
  if (syntax.exec) {
    token = parseRegexp(syntax, file);
  }
  else {
    for (var ri = 0, rule; rule = syntax[ri]; ri++) {
      if (token = parseRule(rule, file)) {
        token.t = type;   // 设置记号类型
        token.l = file.i - i;
        break;
      }
    }
  }
  if(token) {
    if (!parsed)
      parsed = pack[i] = {};
    return parsed[type] = token;
  }
}

function parseRule(rule, file) {
  var token = [], ti = 0, i = file.i;
  for (var si = 0, type; type = rule[si]; si++) {
    var item;
    while (item = parseSyntax('', file))  //先读空白符，syntax.i 是行内空白标志
      token[ti++] = item;
    item = parseSyntax(type, file);
    if (!item) {    // 未读到
      file.i = i;  // 回溯
      return;
    }
    token[ti++] = item;
  }
  if (ti)
    return token;
}

function parseRegexp(regexp, file) {
  var token;
  regexp.lastIndex = file.i;
  if (token = regexp.exec(file.s)[0]) {
    file.i += token.length;
  }
  else {
    file.e = file.i;
  }
  return token;
}

var ast = parse('  return ;', 'Statement');
console.log(ast);