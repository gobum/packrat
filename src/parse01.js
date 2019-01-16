// 标志位分量：
var OPTION = 1, MULT = 2, IMPLY = 4, NEED = 8, DENY = 16, NOWRAP = 32;

var grammar = {
  Polynome: 0,
  Monomial: 1,
  Number: 2,
  0: {
    n: 'Polynome',
    s: [
      [
        [1 /*Monomial*/, 0 ],
        [ 3, 1 + 2 ]
      ]
    ]
  },
  1: {
    n: 'Monomial',
    s: [
      [
        [ 2 /*Number*/, 0 ],
        [ 5, 1 + 2 ]
      ],
      [
        [ 7 /*\\(*/, 0 ],
        [ 0 /*Polynome*/, 0 ],
        [ 8 /*\\)*/, 0 ]
      ],
      [
        [ 4 /*[+-]*/, 0 ],
        [ 1 /*Monomial*/, 0 ]
      ]
    ]
  },
  2: { n: 'Number', s: /\d+|/g },
  3: {
    s: [
      [
        [ 4 /*[+-]*/, 0 ],
        [ 1 /*Monomial*/, 0 ]
      ]
    ]
  },
  4: { s: /[+-]|/g },
  5: {
    s: [
      [
        [ 6 /*[/*]*/, 0 ],
        [ 2 /*Number*/, 0 ]
      ]
    ]
  },
  6: { s: /[*/]|/g },
  7: { s: /\(|/g },
  8: { s: /\)|/g }
};

function parse(code, grammar, name) {
  var type = grammar[name];
  var file = { s: code, i: 0 };
  return parseType(type);

  function parseType(type) {
    var symbol = grammar[type];
    return parseSymbol(symbol);
  }

  function parseSymbol(symbol) {
    var token, name;
    name = symbol.n;
    symbol = symbol.s;
    if (symbol.exec) {
      token = parseRegexp(symbol);
    }
    else {
      for (var i = 0, rule; rule = symbol[i]; i++)
        if (token = parseRule(rule)) {
          break;
        }
    }
    if (name) {
      token = { n: name, s: token };
    }
    return token;
  }

  function parseRule(rule) {
    var tokens = [], ti = 0, token;
    nextItem:
    for (var ri = 0, item; item = rule[ri]; ri++) {
      var type = item[0], flag = item[1], refine = item[2];
      do {
        var fileIndex = file.i;
        if (token = parseType(type)) { // 若解析成功
          if (token instanceof Array) {
            for (var i = 0; item = token[i]; i++)
              tokens[ti++] = item;
          }
          else {
            tokens[ti++] = token;
          }
        }
        else {  // 未解析成功
          if (flag & OPTION)  // 若是可选项，则继续解析下一项
            continue nextItem;
          file.i = fileIndex; // 否则回溯并解析失败
          return;
        }
      } while (flag & MULT && token);
    }
    if (ti)
      return tokens;
  }

  function parseRegexp(regexp) {
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
}


var token;
token = parse('123', grammar, 'Number');

token = parse('123*4/5', grammar, 'Monomial');

token = parse('1+2*3-4/5', grammar, 'Polynome');

console.log(JSON.stringify(token, null, 2));