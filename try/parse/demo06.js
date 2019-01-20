var opt = 1;
var mul = 2;
var inline = 4;
var deny = 8;
var need = 16;


// var grammar = link(sGrammar);


function link(src) {
  var dst = {}, di=0, keys = Object.getOwnPropertyNames(src), key, symbol, i;
  for (i=0; i<keys.length; i++) {
    key = keys[i];
    symbol = src[key];
    if(typeof symbol === 'string') {
      symbol = RegExp(symbol+"|", "g");
    }
    dst[key] = di;
    dst[di] = symbol;
    di ++;
  }
  for (i=0, l=di; i<l; i++) {
    symbol = dst[i];
    if(symbol instanceof Array) {
      for(var ri=0, rule; rule=symbol[ri]; ri++) {
        for(var ii=0, item; item = rule[ii]; ii++) {
          rule[ii] = dst[item];
        }
      }
    }
  }    
  return dst;
}

var sGrammar = `
VariableStatement:
  /\bvar\b/ Identifier /;/
Identifier::
  /\[a-zA-Z_$][\w$]*/
`;

var grammar = {
  $: [                    // 索引到标识符映射表
    'VariableStatement',
    'Identifier'
  ],
  ' ': 4,                     // 空白符对应的索引
  '~': 5,                     // 行内空白符对应的索引
  VariableStatement: 0,       // 标识符对应的索引
  Identifier: 1,
  0: [                        // 一个非终结符，由若干条规则构成
    [                         // 一条规则，由若干规则项构成
      [2, 0],                 // 一个规则项，第一个元素是解析项索引值，第二个元素是标志集
      [1, 0],
      [3, 1]
    ]
  ],
  1: /[a-zA-Z_$][\w$]*|/g,   // 一个终结符，由正则式解析
  2: /\bvar\b|/g,
  3: /;|/g,
  4: /\s+|/g,
  5: /[\u0020\t\v\f\u00a0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff\ufffe]+|/g
}

var blank = grammar[' '], space = grammar['~'];

console.log(grammar);

function parse(code, name) {
  var t = grammar[name];
  var file = { s: code, i: 0, p: [] };

  var token = parseSymbol(t, file);
  return token;
}

function parseSymbol(t, file) {
  var token, i=file.i, pack = file.p, parsed = pack[i];
  if (token = parsed && parsed[t]) {  // 若已解析过，则直接返回缓存结果
    file.i += token.l || token.length;
    return token;
  }
  var symbol = grammar[t];
  if (symbol.exec) {
    token = parseRegexp(symbol, file);
  }
  else {
    for (var ri = 0, rule; rule = symbol[ri]; ri++) {
      if (token = parseRule(rule, file)) {
        token.t = t;   // 设置记号类型
        token.l = file.i - i;
        break;
      }
    }
  }
  if(token) {
    if (!parsed)
      parsed = pack[i] = [];
    return parsed[t] = token;
  }
}

function parseRule(rule, file) {
  var token = [], ti = 0, i = file.i;
  for (var si = 0, args; args = rule[si]; si++) {
    var t = args[0], item;
    while (item = parseSymbol(args[1]&inline ? space : blank, file))  //先读空白符，symbol.i 是行内空白标志
      token[ti++] = item;

    if( item = parseSymbol(t, file) ) {
      if(args[1]&deny) {  // 前看否定
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

var ast = parse(' \n var abc ;', 'VariableStatement');
console.log(ast);