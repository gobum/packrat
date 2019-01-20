

var grammar = {
  ReturnStatement: [
     [ 'return', ";" ]
  ],
  debugger: /\breturn\b|/g,
  ';': /;|/g
};

link(grammar);

function link(grammar) {
  for(var key in grammar) {

  }
}

function parse(code, name) {
  var syntax = grammar[name];
  var file = { s: code, i: 0, p: [] };

  var token = parseSyntax(syntax, file);
  return token;
}

function parseSyntax(syntax, file) {
  var token, type = syntax.t, i = file.i, pack = file.p, parsed = pack[i];
  if (token = parsed && parsed[t])  // 若已解析过，则直接返回缓存结果
    return token;
  for (var ri = 0, rule; rule = syntax[ri]; ri++) {
    if (token = parseRule(rule, file)) {
      token.t = type;   // 设置记号类型
      if (!parsed)
        parsed = pack[i] = {};
      return parsed[type] = token;
    }
  }
}

function parseRule(rule, file) {
  var token = [], ti = 0;
  for (var si = 0, syntax; syntax = rule[si]; si++) {
    var item;
    if(item = parseBlank(file, syntax.i))  //先读空白符，syntax.i 是行内空白标志
      token[ti++] = item;
    if (syntax.exec) {   // 终结语法项
      item = parseRegexp(syntax, file);
    }
    else {              // 中间语法项
      item = parseSyntax(syntax, file);
    }
    if(!item) break;
    token[ti++] = item;
  }
  if(ti)
    return token;
}

function parseRegexp(regexp, file) {
  var token;
  regexp.lastIndex = file.i;
  if(token = regexp.exec(file.s)[0]) {
    file.i += token.length;
  }
  else {
    file.e = file.i;
  }
  return token;
}

function parseBlank(file, inline) {
  var regexp = inline ? /[\u0020\t\v\f\u00a0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff\ufffe]+|/g : /\s+|/g;
  return parseRegexp(regexp, file);
}

var ast = parse('  return ;', 'ReturnStatement');
console.log(ast);