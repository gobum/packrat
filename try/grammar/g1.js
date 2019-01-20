var Grammar = function () {
  var OPTION = 1, MULT = 2, IMPLY = 4, NEED = 8, DENY = 16, NOWRAP = 32;

  function GrammarError(msg, index) {
    this.message = msg;
    this.i = index;
  }

  function Grammar(grammar) {
    grammar = makeGrammar(grammar);
    grammar = cleanGrammar(grammar);
    // grammar = cleanGrammar(grammar);
    // grammar = cleanGrammar(grammar);
    // grammar = cleanGrammar(grammar);
    // grammar = cleanGrammar(grammar);
    // grammar = cleanGrammar(grammar);
    // grammar = cleanGrammar(grammar);
    // grammar = cleanGrammar(grammar);
    // grammar = cleanGrammar(grammar);
    //grammar = linkGrammar(grammar); 
    return grammar;
  }

  /** 文法预编译 ------------------------------------------------------------------------------------- */
  function makeGrammar(text, usage) {
    var grammar = {$:{}}, ms, s, token;
    var lex = Lex(text);
    try {
      while (ms = lex.$) {
        if (s = ms[lex.SYMBOL]) {
          lex();
          if (token = makeRules(lex)) {
            ms = (ms = ms[lex.PARAMS]) ? ms.split(',') : [];
            expandSymbol(s, ms, token, grammar);
          }
        }
        else if (s = ms[lex.TERM]) {
          lex();
          ms = lex.$;
          if (!ms[TAG] && (token = ms[REGX])) {
            lex();
            grammar[s] = RegExp(token + '|', g);
          }
        }
        else if (ms[lex.LF]) {
          lex();
        }
        else {
          throw new GrammarError('unknown token ' + JSON.stringify(ms[0]), ms.index);
        }
      }
    }
    catch (e) {
      if (e instanceof GrammarError) {
        e = Error(e.message + ' at ' + rowcol(text, e.i));
      }
      throw e;
    }
    return grammar;
  }

  function makeRules(lex) {
    var rules = [], ri = 0, rule;
    while (rule = makeRule(lex)) {
      rules[ri++] = rule;
    }
    if (ri) {
      return rules;
    }
  }

  var tags = { '?': OPTION, '+': MULT, '*': OPTION | MULT, '&': IMPLY, '=': NEED, '!': DENY };
  function makeRule(lex) {
    var rule = [], i = 0, token, ms, tag, refine;
    while ((ms = lex.$) && ms[lex.LF]) lex(); // 跳过空行
    if ((ms = lex.$) && (token = ms[lex.VAR])) {
      lex();
      rule.v = token;
      if (ms[lex.ADD]) rule.a = 1;
    }
    while (ms = lex.$) {
      var tag = 0, refine = undefined;
      if (ms[lex.ITEM]) {
        lex();
        tag = tags[ms[lex.TAG]] || 0;
        if (token = ms[lex.ID]) {
          token = [token, makeArgs(ms[lex.ARGS])];
        }
        else if (token = ms[lex.REGEX]) {
          token = RegExp(token + '|', 'g');
        }
        else if (token = ms[lex.KEY]) {
          token = RegExp('\\b' + token + '\b|', 'g');
        }
        else if (token = ms[lex.OP]) {
          token = RegExp(escape(token) + '|', 'g');
        }
        else { // if(ms[lex.BEG]) {
          token = makeRules(lex);
          ms = lex();
          if (!(ms && ms[lex.END]))
            throw new GrammarError('missing "}"', ms ? ms.index : -1);
        }
        refine = makeRefine(lex);
      }
      else if (ms[lex.LINE]) {
        lex();
        tag = DENY | NOWRAP;
        token = /[\n\r\u2028\u2029]|/g;
      }
      else {
        if (ms[lex.DIV] || ms[lex.LF])
          lex();
        break;
      }
      rule[i++] = token = [token, tag];
      if (refine)
        token[2] = refine;
    }
    if (i) {
      return rule;
    }
  }

  function makeRefine(lex) {
    var ms = lex.$, id;
    if (ms && (id = ms[lex.RID])) {
      lex();
      return [id, makeArgs(ms[lex.RARGS])];
    }
  }

  function makeArgs(args) {
    args = args ? args.split(',') : [];
    for (var i = 0, arg; arg = args[i]; i++)
      args[i] = [arg[0], arg.slice(1)];
    return args;
  }

  function expandSymbol(name, params, symbol, grammar) {
    for (var bas = 0, len = params.length; bas < len; bas++)
      for (var beg = bas + 1; beg < len; beg++)
        for (var end = beg + 1; end <= len; end++)
          params.push(params[bas] + params.slice(beg, end).join(''));
    grammar[name] = expandRules(symbol, '', grammar.$);
    if (!params.length) grammar[name].$ = 1;   // 打原生符号标志
    for (var pi = 0, param; param = params[pi]; pi++) {
      grammar[name + param] = expandRules(symbol, param, grammar.$);
    }
  }

  function expandRules(rules, param, usage) {
    var symbol = [], si = 0;
    for (var ri = 0, rule; rule = rules[ri]; ri++) {
      var use = rule.v;
      if (use && (param.indexOf(use) >= 0) ^ rule.a)
        continue;
      var list = [];
      for (var i = 0, item; item = rule[i]; i++) {
        var obj = item[0];
        if (obj instanceof Array) {
          if (obj[0] instanceof Array) {
            obj = expandRules(obj, param, usage);
          }
          else if (typeof obj[0] === 'string') {
            obj = expandRefer(obj, param, usage);
          }
        }
        list[i] = obj = [obj, item[1]];
        if (item[2]) { // 有转义解析项
          obj[2] = expandRefer(item[2], param, usage);
        }
      }
      symbol[si++] = list;
    }
    return symbol;
  }

  function expandRefer(refer, param, usage) {
    var name = refer[0], args = refer[1];
    for (var i = 0, arg; arg = args[i]; i++) {
      var tag = arg[0], arg = arg[1];
      if (tag === '+' || tag === '?' && param.indexOf(arg) >= 0)
        name += arg;
    }
    usage[name] = usage[name] ? usage[name]+1 : 1;
    return name;
  }

  /** 文法检查清理 ----------------------------------------------------------------------------------- */
  function cleanGrammar(grammar) {
    var usage = grammar.$;
    delete usage.$;
    var unuses = [];
    for(var use in usage)
      if(!grammar.hasOwnProperty(use))
        throw Error('Unknown grammar symbol: ' + use);
    for(var key in grammar)
      if(!usage[key] && !grammar[key].$)
        cleanSymbol(key);
    
    function cleanSymbol(key) {
      var symbol = grammar[key];
      delete grammar[key];
      if(symbol instanceof Array)
        for(var r = 0, rule; rule = symbol[r]; r++)
          for(var i = 0, item; item = rule[i]; i++) {
            if(typeof (key = item[0]) == 'string') {
              if(!(--usage[key])) {
                cleanSymbol(key);
              }
            }
            if(key=item[2]) {
              if(!(--usage[key]))
                cleanSymbol(key);
            }
          }
    }

    return grammar;
  }

  /** 文法连接 -------------------------------------------------------------------------------------- */
  function linkGrammar(grammar) {
    var keys = Object.getOwnPropertyNames(grammar);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var symbol = grammar[key];
      grammar[key] = i;
      grammar[i] = symbol;
    }
    var l = i, j = i;
    for (var i = 0; i < l; i++) {
      symbol = grammar[i];
      if (symbol instanceof Array) {
        for (var ri = 0, rule; rule = symbol[ri]; ri++) {
          for (var ii = 0, item; item = rule[ii]; ii++) {
            var value = item[0];
            if (typeof value === 'string') {
              item[0] = grammar[value];
            }
            else {
              grammar[j] = value;
              item[0] = j++;
            }
          }
        }
      }
    }

    return grammar;    
  }

  /** 文法词汇 -------------------------------------------------------------------------------------- */
  /**
   * Lex(text)
   *   创建词法解析函数。
   */
  function Lex(text, re, last) {
    re = RegExp(reGrammar);
    function lex(ms) {
      return last ? (ms = last, last = undefined, ms) : get();
    }

    Object.defineProperty(lex, '$', {
      get: function () {
        return last || (last = get());
      }
    });

    function get(ms, lastIndex, s, matchIndex, err) {
      lastIndex = re.lastIndex;
      if (ms = re.exec(text)) {
        s = ms[0];
        if (err = text.substring(lastIndex, ms.index).trim())
          throw new GrammarError('unknown token ' + JSON.stringify(err), text.indexOf(err, lastIndex));
      }
      else {
        get = Function.prototype;
      }
      return ms;
    }

    for (var i = 0, type; type = types[i];) {
      i++;
      lex[type] = i;
      //lex[i] = type;
    }
    return lex;
  }

  var types = [], ti = 0;

  var reGrammar = make(A(
    [{ TERM: /\w+/ }, '::'],
    [{ SYMBOL: /\w+/ }, '(?:\\[', { PARAMS: /\w+(?:,\w+)*/ }, '])?:'],
    {
      ITEM: [
        { TAG: '[?+*&=!]|' },
        '(?:',
        A(
          [{ ID: /\w+/ }, '(?:\\[', { ARGS: /[?+~]\w+(?:,[?+~]\w+)*/ }, '\\])?'],
          ['`', { KEY: /\w+/ }, '`'],
          ["'", { OP: /(?:\\.|[^'])+/ }, "'"],
          ['\\/', { REGEX: /(?:\\.|\[(?:\\.|[^\]])*]|[^\/*\n\r])(?:\\.|\[(?:\\.|[^\]])*]|[^/\n\r])*?/ }, '\\/'],
          { BEG: /\{/ }
        ),
        ')'
      ]
    },
    ['>', { RID: /\w+/ }, '(?:\\[', { RARGS: /[?+~]\w+(?:,[?+~]\w+)*/ }, '\\])?'],
    { END: /\}/ },
    { LINE: '~' },
    ['\\[(?:', { ADD: /\+/ }, '|~)', { VAR: /\w+/ }, '\\]'],
    { DIV: /\|/ },
    { LF: /[\n\r\u2028\u2029]\s*/ }
  ));

  reGrammar = RegExp(reGrammar, 'g');

  function A() { return arguments }

  function make(item, arg) {
    if (item instanceof Object) {
      if (item.length) {
        arg = [];
        for (var i = 0; i < item.length; i++)
          arg[i] = make(item[i]);
        item = arg.join(item.join ? '' : '|');
      }
      else if (item instanceof RegExp) {
        item = item.source;
      }
      else if (item instanceof Object) {
        var arg = String(Object.keys(item));
        types[ti++] = arg;
        item = '(' + make(item[arg]) + ')';
      }
    }
    return item;
  }

  function escape(s) {
    return s.replace(/[\\^$*+?.()[\-\]:=!|{,}\/]/g, '\\$&');
  }

  return Grammar;
}([]);

/**
 * rowcol(text, i)
 *   计算文本 text 位置 i 的行列值。返回格式 "row:col"
 */
function rowcol(text, i) {
  if (i < 0) return '<EOF>';
  var reLn = /[\n\u2028\u2029]|\r\n?/g;
  var row = 0, col = i;
  while (reLn.exec(text)) {
    if (reLn.lastIndex > i) break;
    row++;
    col = i - reLn.lastIndex;
  }
  return (row + 1) + ':' + (col + 1);
}

I.do('ES7 grammar compile:', function (I) {
  var text = I.get('../../test/es7/es7.txt');
  I.hope(text).is.ok;
  var es7 = Grammar(text);
  //console.log(es7);

  // var keys = Object.getOwnPropertyNames(es7).sort();

  // var uses = [], ui = 0;

  // for (var i = 0; i < keys.length; i++)
  //   pick(es7[keys[i]]);

  // function pick(rules) {
  //   if (rules instanceof Array) {
  //     for (var r = 0, rule; rule = rules[r]; r++) {
  //       for (var i = 0, item; item = rule[i]; i++) {
  //         var id = item[0];
  //         if (typeof id === 'string') {
  //           if (uses.indexOf(id) < 0)
  //             uses[ui++] = id;
  //         }
  //         else {
  //           pick(id);
  //         }
  //         if (id = item[2]) {
  //           if (uses.indexOf(id) < 0)
  //             uses[ui++] = id;
  //         }
  //       }
  //     }
  //   }
  // }

  // uses = uses.sort();
  // var unuses = [], unknow = [];

  // for (var k = 0, u = 0, key, use; k < keys.length || u < uses.length;) {
  //   key = keys[k];
  //   use = uses[u];
  //   if (key < use) {
  //     unuses.push(key);
  //     k++;
  //   }
  //   else if (key > use) {
  //     unknow.push(use);
  //     u++;
  //   }
  //   else {
  //     k++;
  //     u++;
  //   }
  // }

  // console.log('unuses:\n', unuses);
  // console.log(unknow);
  // console.log(Object.getOwnPropertyNames(es7));
  I.sum();
});
