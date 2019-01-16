// 标志位分量：
var OPTION = 1, MULT = 2, IMPLY = 4, NEED = 8, DENY = 16, NOWRAP = 32;
var flags = { '?': OPTION, '+': MULT, '*': OPTION | MULT, '&': IMPLY, '=': NEED, '!': DENY };

/**
 * $() 函数用于构造正则片段的选项列表。同时 $ 名字空间用于存储匹配序号的常量名对应关系
 */
function $() { return arguments } // 构造正则字符串相选择项列表，并作为常量名字空间。

/**
 * regstr(any, names)
 *   将 arguments 或 array 转换为正则表达式原文字符串
 */
function regstr(any, keys) {
  var arg;
  if (any instanceof Object) {
    if (any instanceof RegExp) {
      any = any.source;
    }
    else if (any.length) {
      var arg = [];
      for (var i = 0; i < any.length; i++)
        arg[i] = regstr(any[i], keys);
      any = arg.join(any.join ? '' : '|');
    }
    else {
      arg = String(Object.keys(any));
      keys[arg] = keys.$ = (keys.$ | 0) + 1;
      any = '(' + regstr(any[arg], keys) + ')';
    }
  }
  else {
    any = String(any);
  }
  return any;
}

// 构造解析文法原文的正则式及其索引映射：
var reGrammar = RegExp(regstr($(
  [{ G/*rammar*/: /[$]?/ }, { N/*otation*/: /[a-z_A-Z]+/ }, ':'],
  ['\\[(?:', { Q/*ualify*/: /\+/ }, '|~)', { C/*ondition*/: /[a-zA-Z]+/ }, '\\]'],
  { E/*nd*/: /\}/ },
  { L/*ine*/: '~' },
  ['>', { R/*efine*/: /[a-zA-Z]+/ }, '(?:\\[', { V/*ariables*/: /[?+~][a-zA-Z]+(?:,[?+~][a-zA-Z]+)*/ }, '\\])?'],
  { D/*ivider*/: /\|/ },
  {
    I/*tem*/: [
      { F/*lag*/: '[?+*&=!]|' },
      '(?:',
      $(
        [{ S/*ymbol*/: /[a-zA-Z]+/ }, '(?:\\[', { A/*rguments*/: /[?+~][a-zA-Z]+(?:,[?+~][a-zA-Z]+)*/ }, '\\])?'],
        ['`', { K/*eyword*/: /\w+/ }, '`'],
        { B/*egin*/: /\{/ },
        { O/*ther*/: /\S+/ }
      ),
      ')'
    ]
  },
  { W/*rap*/: /[\n\r\u2028\u2029]\s*/ }
), $), 'g');

/**
 * newGrammarReader(text)
 *   创建文法文本的读取函器
 */
function newGrammarReader(text) {
  if (text instanceof RegExp)
    text = text.source;
  var re = new RegExp(reGrammar), last;

  function read(ms) {
    return last ? (ms = last, last = undefined, ms) : get();
  }

  Object.defineProperty(read, '$', {
    get: function () {
      return last || (last = get());
    }
  });

  function get() {
    return re.exec(text) || (get = Function.prototype, null)
  }

  return read;
}

function GrammarError(msg, index) {
  this.message = msg;
  this.i = index;
}

/**
 * readGrammar(text)
 *   根据文法原文构建初级文法对象
 */
function readGrammar(text) {
  var grammar = {}, start, symbols = { $: grammar };   // 文法对象
  var read = newGrammarReader(text);
  var ms, key, rules, any;
  try {
    while (ms = read.$) {
      if (key = ms[$.N]) {  // 若匹配到非终结符（Notation）名
        read();
        if (rules = readRules(read)) {
          if (rules.length == 1 && (any = rules[0]).length == 1 && (any = any[0])[0] instanceof RegExp && !any[1] && !any[2])
            rules = any[0];

          symbols[key] = rules;
          if (ms[$.G] || !start && (start=key) ) // 若是文法符号（Grammar）或第一个符号
            grammar[key] = rules;
        }
      }
      else if (ms[$.W]) {   // 若匹配折行（Wrap），则跳过
        read();
      }
      else {
        throw new GrammarError('unknown token ' + ms[0], ms.index);
      }
    }
  } catch (e) {
    throw e instanceof GrammarError ? Error(e.message + ' at ' + rowcol(text, e.i)) : e;
  }

  return symbols;
}

/**
 * readRules(read)
 *   读取语法规则列表
 */
function readRules(read) {
  var rules = [], ri = 0, rule;
  while (rule = readRule(read))
    rules[ri++] = rule;
  return ri && rules;
}

/**
 * readRule(read)
 *   读取一条语法规则 
 */
function readRule(read) {
  var rule = [], i = 0, ms, item, flag, refine;

  while ((ms = read.$) && ms[$.W]) read();  // 跳过折行（Wrap）

  if ((ms = read.$) && (item = ms[$.C])) {   // 若首先匹配到规则限定条件（Condition）
    read();
    rule.c = item;
    if (ms[$.Q]) rule.q = 1;    // 设置限定前提（Qualify)
  }

  while (ms = read.$) {
    flag = 0, refine = undefined; // 初始无标志，无转义解析项
    if (ms[$.I]) {                // 匹配一般规则项（Item）：
      read();
      flag = flags[ms[$.F]] || 0;
      if (item = ms[$.S]) {        // 若该项是符号（Symbol）
        item = [item, readArgs(ms[$.A])];
      }
      else if (item = ms[$.K]) {  // 若该项是关键字（Keyword）
        item = RegExp('\\b' + item + '\\b|', 'g');
      }
      else if (ms[$.B]) {  // 若该项是子语法开始项（Begin）    
        item = readRules(read);
        ms = read();
        if (!(ms && ms[$.E]))   // 若没有对应的子语法结束项（End），则报错
          throw new GrammarError('missing }', ms ? ms.index : -1);
      }
      else { // 否则是其他正则片段（Other）
        if(RegExp(item=ms[$.O]).test(''))   // 若正则片段能匹配空字符串，则报错
          throw new GrammarError(item + ' must not match an empty string', ms.index);
        item = RegExp(item + '|', 'g');
      }
      refine = readRefine(read);   // 尝试读转义解析项
    }
    else if (ms[$.L]) {   // 匹配行保持项（Line）
      read();
      flag = DENY | NOWRAP; // 标志设置为禁止且无折行
      item = /[\n\r\u2028\u2029]|/g;
    }
    else {  // 其他的表示本条规则已结束
      while (read.$ && (read.$[$.D] || read.$[$.W])) read();   // 跳过规则分隔符（Divider）或折行（Wrap）
      break;
    }
    rule[i++] = item = [item, flag];
    if (refine)
      item[2] = refine;
  }

  return i && rule;
}

/**
 * readRefine(read) 读取转义解析项 
 */
function readRefine(read) {
  var ms = read.$, symbol;
  if (ms && (symbol = ms[$.R])) { // 若匹配转义解析项（Refine）
    read();
    return [symbol, readArgs(ms[$.V])];
  }
}

/**
 * readArgs(args) 编译符号参数元
 */
function readArgs(args) {
  args = args ? args.split(',') : [];
  for (var i = 0, arg; arg = args[i]; i++)
    args[i] = [arg[0], arg.slice(1)];
  return args;
}

/**
 * makeGrammar(grammar)
 *   从起始符号开始递归生成文法符号对象
 */
function makeGrammar(symbols) {
  var grammar = {};
  var $ = symbols.$;
  for (key in $)
    makeKey(key, key, [], '>'+key);
  return grammar;

  function makeKey(name, key, args, path) {
    if(path.indexOf('>'+name+'>')>=0)
      throw Error('Left recursive grammar: '+path.slice(1));
    var symbol;
    if (!(symbol = grammar[name])) {
      grammar[name] = []; //占位符，防止死递归
      if (symbol = symbols[key]) {
        symbol = grammar[name] = makeSymbol(symbol, args, path);
      }
      else {
        throw Error('Unknown grammar symmbol: ' + key);
      }
    }
    return symbol;
  }

  function makeParams(params, args) {
    var values = [], vi = 0;
    for(var i=0, arg; arg = args[i]; i++) {
      var tag = arg[0], arg = arg[1];
      if(tag === '+' || tag === '?' && params.indexOf(arg)>=0)
        values[vi++] = arg;
    }
    return values;
  }

  function makeSymbol(symbol, params, path) {
    if(symbol instanceof Array) {
      symbol = makeRules(symbol, params, path);
    }
    return symbol;
  }

  function makeRules(lists, params, path) {
    var rules = [], ri = 0, list, rule, key;
    for (var li = 0; list = lists[li]; li++) {
      var cond = list.c;
      if (cond && (params.indexOf(cond) >= 0) ^ list.q)
        continue;
      rule = [];
      for (var i = 0, e=path, item; item = list[i]; i++) {
        var any = item[0], tag = item[1], refine = item[2], args, symbol;
        if (typeof (key = any[0]) === 'string') {
          args = makeParams(params, any[1]);
          var name = key + args.join('');
          any = makeKey(name, key, args, (e || '') + '>'+name);
          symbol = [name, tag];
        }
        else {
          any = makeSymbol(any, params, e);
          symbol = [any, tag];
        }
        if(e && !(tag&OPTION) && !any.e )
          e = '';
        if(refine) {
          args = makeParams(params, refine[1]);
          name = refine[0] + args.join('');
          makeKey(name, refine[0], params, (e || '') + '>'+name);
          symbol[2] = name;
        }
        rule.push(symbol);
      }
      rules[ri++] = rule;
      if(e)
        rules.e = 1;
    }
    if(ri)
      return rules;
  }
}

/**
 * linkGrammar(grammar)
 *   链接文法成为解析驱动表
 */
function linkGrammar(grammar) {
  var keys = Object.getOwnPropertyNames(grammar);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var symbol = grammar[key];
    grammar[key] = i;
    grammar[i] = symbol;
  }

  keys = {};  // 缓存正则式项的索引

  var l = i, j = i, x;
  for (var i = 0; i < j; i++) {
    symbol = grammar[i];
    if (symbol instanceof Array) {
      for (var ri = 0, rule; rule = symbol[ri]; ri++) {
        for (var ii = 0, item; item = rule[ii]; ii++) {
          var value = item[0];
          if (typeof value === 'string') {
            item[0] = grammar[value];
          }
          else if (value instanceof RegExp) {
            key = value.source;
            if (x = keys[key]) {
              item[0] = x;
            }
            else {
              grammar[j] = value;
              item[0] = keys[key] = j++;
            }
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

/**
 * linkGrammar(srcGrammar)
 *   将文法链接成数字索引的形式
 */
function linkGrammar(srcGrammar){
  var desGrammar = {}, di = 0, keys =[], i = 0;
  for(keys[i++] in srcGrammar);
}

/**
 * rowcol(text, i)
 *   计算文本 text 位置 i 的行列值。返回格式 "row:col"
 */
function rowcol(text, index) {
  if (index < 0) return '<EOF>';
  var reLn = /[\n\u2028\u2029]|\r\n?/g;
  var row = 0, col = 0;
  while (reLn.exec(text) && index > reLn.lastIndex) {
    row++;
    col = reLn.lastIndex;
  }
  col = index - col;
  return (row + 1) + ':' + (col + 1);
}
