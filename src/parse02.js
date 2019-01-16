// 标志位分量：
// var OPTION = 1, MULT = 2, IMPLY = 4, NEED = 8, DENY = 16, NOWRAP = 32;

function parse(code, grammar, name) {
  var names = grammar.$, type = grammar[name], index = 0, end = code.length, fail = 0;
  if (!type)
    throw Error('Unknown grammar symbol: ' + name);
  var pack = [];
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
      token = parseSymbol(grammar[type], type && syntactic);
      if (name = names[type]) {
        if (token || grammar['_' + type])
          token = { $: name, s: token }
      }
      parsed[type] = [token, index];
    }
    return token || '';
  }

  function parseSymbol(symbol, syntactic) {
    var token, s;
    if (symbol.exec) {
      token = [];
      if (syntactic)
        parseBlank(token);
      if (s = parseRegexp(symbol)) {
        token.push(s);
      }
      else {
        token = '';
      }
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
    var tokens = [], ti = 0, token;
    for (var ri = 0, item; item = rule[ri]; ri++) {
      var type = item[0], flag = item[1], refine = item[2], ok = 0;

      do {
        var start = index;
        var wrap = syntactic ? parseBlank(tokens) : 0;

        ti = tokens.length;

        if (type < 0) {  // 若是前向无换行断言项
          if (wrap) {         // 若有换行则回溯
            index = start;
            return;   // 解析失败
          }
          break;
        }
        if (token = parseType(type, syntactic)) { // 若解析成功
          if (flag & NEED) {   // 若是前向肯定断言
            index = start;    // 回溯后解析下一项
            break;
          }
          if(refine) {
            var savend = end;
            token = parseType(refine, syntactic);
            end = savend;
          }
        }
        if(token) {
          if (token instanceof Array) {
            for (var i = 0; item = token[i]; i++)
              tokens[ti++] = item;
          }
          else {
            tokens[ti++] = token;
          }
          ok = 1;
        }
        else {  // 未解析成功
          index = start; // 回溯
          if (ok || flag & (OPTION | DENY)) {   // 若已解析成功过或者是可选项或前向否定断言，则解析下一项
            break;
          }
          return;   // 解析失败
        }

      } while (token && flag & MULT);
    }
    if (ti)
      return tokens;
  }

  function parseRegexp(regexp) {
    // var token;
    if (index < end) {
      regexp.lastIndex = index;
      if ((regexp.exec(code)[0]) && regexp.lastIndex <= end) {
        return {b: index, e: index = regexp.lastIndex }
        // index = regexp.lastIndex;
      }
      else {
        fail = index;
      }
    }
    // else {
    //   token = '';
    // }
    // return token;
  }

  function parseBlank(tokens) {
    var start = index, ti = tokens.length, token;
    while (token = parseType(0)) {
      tokens.push.apply(tokens, token);
    }
    return /\n\r\u2028\u2029/.test(code.slice(start, index));
  }
}
