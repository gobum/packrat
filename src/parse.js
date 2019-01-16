// 标志位分量：
// var OPTION = 1, MULT = 2, IMPLY = 4, NEED = 8, DENY = 16, NOWRAP = 32;

var lineTerminator = /\n\r\u2028\u2029/;
function parse(code, grammar, name, option) {
  var names = grammar.$, type = grammar[name], index = 0, end = code.length, fail = 0;
  var pairs = [], pair;
  if (!type)
    throw Error('Unknown grammar symbol: ' + name);
  var pack = [];
  if (!option) option = {};
  var token = parseType(type, 1);
  if (token) {
    if (index < code.length) {
      console.error('unknown token: ' + code.slice(index) + ' at ' + index);
    }
    else {
      return token;
    }
  }
  else {
    console.error('unknown token: ' + code.slice(fail) + ' at ' + fail);
  }

  function parseType(type) {
    var parsed, token, cache, name;
    parsed = pack[index] || (pack[index] = []);
    if(parsed.hasOwnProperty(type)){
      if(token = parsed[type]) {
        console.log('use parsed '+(names[type]||type)+' at ' + index);
        index = token.e;
      }
      else {
        console.log('need not parsed '+(names[type]||type)+' at ' + index);
      }
    }
    else {
      var Begin = index;
      if (token = parseSymbol(grammar[type])) {
        token.$ = type;
        token.b = Begin;
        token.e = index;
        // if(!token.v)
        //   parsed[type] = token;
      }
      else {
        // parsed[type] = undefined;
      }
    }
    return token;
  }

  function parseSymbol(symbol) {
    var token, s;
    if (symbol.exec) {
      token = parseRegexp(symbol)
    }
    else {
      for (var i = 0, rule; rule = symbol[i]; i++)
        if (token = parseRule(rule)) {
          break;
        }
    }
    return token;
  }

  function parseRule(rule) {
    var nodes = [], ni = 0, token, Begin, begin, vary = 0;
    Begin = index;

    for (var ri = 0, item; item = rule[ri]; ri++) {
      var type = item[0], flag = item[1];
      var start = index;
      if (token = parseType(type)) {
        if (flag < 0) {
          token.$ = -flag;
          if (begin === undefined)
            begin = token.b;
          add(token);   // nodes[ni++] = token;
        }
        else {
          if (flag & DENY) {
            index = Begin;
            return;
          }
          if (flag & NEED) {
            index = start;
            continue;
          }

          if(flag & CLOSE) {
            vary -= 1;
            if(pairs.pop()!== code.slice(start, index)) {
              index = Begin;
              return;
            }
          }

          if (begin === undefined)
            begin = token.b;
          add(token);   // nodes[ni++] = token;
          if(token.v)
            vary += token.v;

          if (flag & OPEN) {
            pairs.push(code.slice(start, index));
            vary += 1;
          }
          else {
            while (flag & MULT && (token = parseType(type))) {
              add(token);   // nodes[ni++] = token;
            }
          }
        }
      }
      else if (!(flag & OPTION) || flag & NEED) {
        index = Begin;
        return;
      }
    }
    if (ni) {
      if(vary)
        nodes.v = vary;
      return nodes;
    }
    index = Begin;  // 完全回溯

    function add(token) {
      if(!names[token.$] && token.length) {
        for(var i=0; i<token.length; i++)
          nodes[ni++] = token[i];
      }
      else {
        nodes[ni++] = token;
      }
    }
  }

  function parseRegexp(regexp) {
    if (index < end) {
      regexp.lastIndex = index;
      var token = regexp.exec(code);
      if (token[1] === undefined && regexp.lastIndex <= end) {
        index = regexp.lastIndex;
        return [];
      }
      fail = index;
    }
  }

  function parseBlank(tokens) {
    var start = index, ti = tokens.length, token;
    while (token = parseType(0)) {
      tokens.push.apply(tokens, token);
    }
    return /\n\r\u2028\u2029/.test(code.slice(start, index));
  }
}

/** Tool functions: ------------------------------------------------------------------------- */
function ast2s(ast, grammar, code) {
  return n2s(ast, '');

  function n2s(ast, space) {
    var text = '', list;
    if (ast) {
      text = code.slice(ast.b, ast.e);
      text = space + (grammar.$[ast.$] || '...') + ': ' + text + '\n';
      for (var i = 0; i<ast.length; i++)
        text += n2s(ast[i], space + '  ');
    }
    return text;
  }
}