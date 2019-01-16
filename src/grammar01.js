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
  [{ N/*otation*/: /[a-z_A-Z]+/ }, '(?:\\[', { P/*arameters*/: /[a-zA-Z]+(?:,[a-zA-Z]+)*/ }, '])?:'],
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
 * makeGrammar(text)
 *   根据文法原文构建初级文法对象
 */
function makeGrammar(text) {
  var grammar = {};   // 文法对象
  var leads = grammar.$ = {};   // 无惨符号
  var read = newGrammarReader(text);
  var ms, key, item;
  try {
    while (ms = read.$) {
      if (key = ms[$.N]) {  // 若匹配到非终结符（Notation）名
        read();
        if (item = readRules(read)) {
          var rules = makeRules(item, '');
          grammar[key] = rules;

          if (ms = ms[$.P]) {  // 若非终结符有参数（Parameters）
            ms = ms.split(',');
            var i, len = ms.length;
            for (i = 0; i < len; i++)
              for (var beg = i + 1; beg < len; beg++)
                for (var end = beg + 1; end <= len; end++)
                  ms.push(ms[i] + ms.slice(beg, end).join(''));
            for (i = 0, len = ms.length; i < len; i++) {
              var param = ms[i];
              if (rules = makeRules(item, param))
                grammar[key + param] = rules;
            }
          }
          else {
            leads[key] = 1;  // 给起始语法符号打标
          }
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

  return grammar;
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
        item = [item, makeArgs(ms[$.A])];
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
        item = RegExp(ms[$.O] + '|', 'g');
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
    return [symbol, makeArgs(ms[$.V])];
  }
}

/**
 * makeArgs(args) 编译符号参数元
 */
function makeArgs(args) {
  args = args ? args.split(',') : [];
  for (var i = 0, arg; arg = args[i]; i++)
    args[i] = [arg[0], arg.slice(1)];
  return args;
}

/**
 * makeRules(lists, param, usage)
 */
function makeRules(lists, param) {
  var rules = [], ri = 0;
  for (var li = 0, list; list = lists[li]; li++) {
    var cond = list.c;
    if (cond && (param.indexOf(cond) >= 0) ^ list.q)
      continue;
    var rule = [];
    for (var i = 0, item; item = list[i]; i++) {
      var any = item[0];
      if (any[0] instanceof Array) {  // 若是子规则集（其第一个元素是数组）
        any = makeRules(any, param);
      }
      else if (typeof any[0] === 'string') {  // 若是符号项（其第一个元素是字符串）
        any = makeSymbol(any, param);
      }
      rule[i] = any = [any, item[1]];
      if (item[2]) { // 有转义解析项
        any[2] = makeSymbol(item[2], param);
      }
    }
    rules[ri++] = rule;
  }
  if (ri === 1 && i == 1 && any[0] instanceof RegExp && !any[1] && !any[2])
    rules = any[0];
  return rules;
}

/**
 * makeSymbol(symbol, param, usage)
 */
function makeSymbol(symbol, param) {
  var key = symbol[0], args = symbol[1];
  for (var i = 0, arg; arg = args[i]; i++) {
    var tag = arg[0], arg = arg[1];
    if (tag === '+' || tag === '?' && param.indexOf(arg) >= 0)
      key += arg;
  }
  return key;
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

/**
 * cleanGrammar(grammar)
 *   清理和检查文法
 */
function cleanGrammar(grammar) {
  var $ = grammar.$, usage = {}, nowrap;

  // 清除未使用的符号项。
  for (var key in $)
    if (!usage[key])
      incSymbol(grammar[key], [key]);

  console.log(usage);

  for (var key in usage)
    if (!usage[key])
      decSymbol(grammar[key], [key]);

  console.log(usage);

  for (var key in grammar)
    if (!usage[key] && key !== '_' && key !== '__' && !grammar[key].$)
      delete grammar[key];

  if (!grammar._)
    grammar._ = /\s+|/g;

  if (nowrap && !grammar.__)
    grammar.__ = /[\u0020\t\v\f\u00a0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff\ufffe]+|/g;

  return grammar;

  function incSymbol(symbol, path) {
    if (symbol instanceof Array) {
      for (var r = 0, rule; rule = symbol[r]; r++) {
        for (var i = 0, item, any; item = rule[i]; i++) {
          if (typeof (any = item[0]) === 'string') {
            incUsage(any, path);
          }
          else {
            incSymbol(any, path);
          }
          if (item[1] & NOWRAP)
            nowrap = 1;
          if (any = item[2]) {
            incUsage(any, path);
          }
        }
      }
    }
  }

  function incUsage(key, path) {
    var symbol;
    if (path.indexOf(key) < 0) {   // 非递归引用
      if (usage[key]) {
        usage[key]++;  // 增加引用量
      }
      else {
        usage[key] = 1;
        if (!(symbol = grammar[key]))
          throw Error('Unknown grammar symbol: ', + key);
        incSymbol(symbol, path.concat(key));
      }
    }
  }

  function decSymbol(symbol, path) {
    if (symbol instanceof Array) {
      for (var r = 0, rule; rule = symbol[r]; r++) {
        for (var i = 0, item, any; item = rule[i]; i++) {
          if (typeof (any = item[0]) === 'string') {
            decUsage(any, path);
          }
          else {
            decSymbol(any, path);
          }
          if (item[1] & NOWRAP)
            nowrap = 1;
          if (any = item[2]) {
            decUsage(any, path);
          }
        }
      }
    }
  }

  function decUsage(key, path) {
    var symbol;
    if (path.indexOf(key) < 0) {   // 非递归引用
      if (!(--usage[key])) {
        decSymbol(grammar[key], path.concat(key));
      }
    }
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