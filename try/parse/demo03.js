var opt = 1;
var mul = 2;
var inline = 4;
var deny = 8;
var need = 16;

var grammar = {
  Statement: [
    ['CommaStatement'],
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
  var keys = Object.getOwnPropertyNames(grammar), key, symbol, i;
  for (i=0; i<keys.length; i++) {
    key = keys[i];
    symbol = grammar[key];
    if(typeof symbol === 'string') {
      grammar[key] = symbol = RegExp(symbol+"|", "g");
    }
    symbol.t = key;
  }
  for (i=0; i<keys.length; i++) {
    key = keys[i];
    symbol = grammar[key];
    if(symbol instanceof Array) {
      for(var ri=0, rule; rule=symbol[ri]; ri++) {
        for(var ii=0, item; item = rule[ii]; ii++) {
          rule[ii] = grammar[item];
        }
      }
    }
  }    
}

var blank = grammar[''], space = grammar[' '];

function parse(code, type) {
  var symbol = grammar[type];
  var file = { s: code, i: 0, p: [] };

  var token = parseSymbol(symbol, file);
  return token;
}

function parseSymbol(symbol, file) {
  var token, i=file.i, pack = file.p, parsed = pack[i], type=symbol.t;
  if (token = parsed && parsed[type]) {  // 若已解析过，则直接返回缓存结果
    file.i += token.l || token.length;
    return token;
  }
  if (symbol.exec) {
    token = parseRegexp(symbol, file);
  }
  else {
    for (var ri = 0, rule; rule = symbol[ri]; ri++) {
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
  for (var si = 0, symbol; symbol = rule[si]; si++) {
    var item;
    while (item = parseSymbol(symbol.i ? blank : space, file))  //先读空白符，symbol.i 是行内空白标志
      token[ti++] = item;

    if( item = parseSymbol(symbol, file) ) {
      if(symbol.f) {  // 前看否定
        file.i = i; // 回溯
        return;
      }
    }
    else {    // 未读到
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
    file.i = regexp.lastIndex;
  }
  else {
    file.e = file.i;
  }
  return token;
}

var ast = parse('  return ;', 'Statement');
console.log(ast);