// 标志位分量：
// var OPTION = 1, MULT = 2, IMPLY = 4, NEED = 8, DENY = 16, NOWRAP = 32;

var lineTerminator = /\n\r\u2028\u2029/;
function parse(code, grammar, name, option) {
  var names = grammar.$, type = grammar[name], index = 0, end = code.length, fail = 0;
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

  function parseType(type, syntactic) {
    var parsed, token, cache, name;
    parsed = pack[index] || (pack[index] = []);
    if (cache = parsed[type]) {
      token = cache[0];
      console.log('use cache at ' + index + ' type:' + type + ' token: ' + token);
      index = cache[1];
    }
    else {
      var Begin = index;
      var any = parseSymbol(grammar[type], type && syntactic);
      if (any) {
        token = { $: type, B: Begin, b: any.b, e: index };
        if (any.c)
          token.c = any.c;
        if (any.C)
          token.C = any.C;
      }
      parsed[type] = [token, index];
    }
    return token;
  }

  function parseSymbol(symbol, syntactic) {
    var token, s;
    if (symbol.exec) {
      token = parseRegexp(symbol)
    }
    else {
      for (var i = 0, rule; rule = symbol[i]; i++)
        if (token = parseRule(rule, syntactic)) {
          break;
        }
    }
    return token;
  }

  function parseRule(rule, syntactic) {
    var Nodes = [], nodes = [], Ni = 0, ni = 0, token, Begin, begin;
    Begin = index;

    for (var ri = 0, item; item = rule[ri]; ri++) {
      while (token = parseType(0))
        if (option.blank)
          Nodes[Ni++] = token;

      var type = item[0];

      if (type < 0) {  // 若是前向无换行断言项
        if (lineTerminator.test(code.slice(start, index))) {  // 若空白含有换行，则失败
          index = Begin;  // 完全回溯
          return;   // 解析失败
        }
        continue;   // 断言成功解析下一项
      }

      var start = index;
      if (begin === undefined)
        begin = start;
      var flag = item[1];
      if (token = parseType(type, syntactic)) {
        if (flag < 0) {    // 转义解析项
          var oldend = end;
          index = start;  // 回溯到空白后
          if (token = parseType(-flag, syntactic)) {
            var list;
            if ((list = token.c) && !names[token.$]) {
              for (var i = 0; i < list.length; i++)
                nodes[ni++] = list[i];
              if (list = token.C)
                for (var i = 0; i < list.length; i++)
                  Nodes[Ni++] = list[i];
            }
            else {
              nodes[ni++] = token;
              if (option.blank)
                Nodes[Ni++] = token;
            }
          }
          end = oldend;
          continue;   // 转义解析成功，解析下一项
        }

        if (flag & DENY) {   // 若是前向否定断言，但却解析到该符号，则解析失败
          index = Begin;    // 全部回溯
          return;
        }

        if (flag & NEED) {    // 若是前向肯定断言，而已解析到该符号，则断言成功
          index = start;      // 回溯到空白后
          continue;    // 解析下一项
        }

        if ((list = token.c) && !names[token.$]) {
          for (var i = 0; i < list.length; i++)
            nodes[ni++] = list[i];
          if (list = token.C)
            for (var i = 0; i < list.length; i++)
              Nodes[Ni++] = list[i];
        }
        else {
          nodes[ni++] = token;
          if (option.blank)
            Nodes[Ni++] = token;
        }

        while (token && flag & MULT) {
          while (token = parseType(0))
            if (option.blank)
              Nodes[Ni++] = token;
          start = index;
          if (token = parseType(type, syntactic)) {
            if ((list = token.c) && !names[token.$]) {
              for (var i = 0; i < list.length; i++)
                nodes[ni++] = list[i];
              if (list = token.C)
                for (var i = 0; i < list.length; i++)
                  Nodes[Ni++] = list[i];
            }
            else {
              nodes[ni++] = token;
              if (option.blank)
                Nodes[Ni++] = token;
            }
          }
        }
      }
      else {
        if (flag & NEED) {
          index = Begin;
          return;
        }
        if (!(flag & (OPTION | DENY))) {   // 若不是可选项或前向否定断言，则解析失败
          index = Begin; // 完全回溯
          return;   // 解析失败
        }
      }
    }
    if (ni) {
      token = { b: begin, c: nodes };
      if (option.blank)
        token.C = Nodes;
      return token;
    }
    index = Begin;  // 完全回溯
  }

  function parseRegexp(regexp) {
    if (index < end) {
      regexp.lastIndex = index;
      if ((regexp.exec(code)[0]) && regexp.lastIndex <= end) {
        var token = { b: index };
        index = regexp.lastIndex;
        return token;
      }
      else {
        fail = index;
      }
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
      if (list = ast.c)
        for (var i = 0; ast = list[i]; i++)
          text += n2s(ast, space + '  ');
    }
    return text;
  }
}