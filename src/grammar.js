// 标志位分量：
var OPTION = 1, MULT = 2, NEED = 4, DENY = 8, OPEN = 16, CLOSE = 32, VARY = 64;
var flags = { '?': OPTION, '+': MULT, '*': OPTION | MULT, '&': NEED, '!': DENY, '<': OPEN, '>': CLOSE };

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
  ['\\[', { P/*recondition*/: /[+-][a-zA-Z]+/ }, '\\]'],
  { E/*nd*/: /\}/ },
  ['@', { R/*efine*/: /[a-zA-Z]+(?:[?+][a-zA-Z]+)*/ }],
  { D/*ivider*/: /\||\/\/.*|[\n\r\u2028\u2029]\s*/ },
  {
    I/*tem*/: [
      { F/*lag*/: '[?+*&!<>]|' },
      '(?:',
      $(
        { S/*ymbol*/: /[a-zA-Z]+(?:[?+][a-zA-Z]+)*/ },
        ['`', { K/*eyword*/: /\w+/ }, '`'],
        { B/*egin*/: /\{/ },
        { W/*hitespace*/: '[~_]'},
        { A/*ny*/: /\S+/ }
      ),
      ')'
    ]
  }
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
  var starts = [], first, symbols = { $: starts };   // 文法对象
  var read = newGrammarReader(text);
  var ms, key, token, any;
  try {
    while (ms = read.$) {
      if (key = ms[$.N]) {  // 若匹配到非终结符（Notation）名
        read();
        if (token = readRules(read)) {
          // if (token.length === 1 && (any = token[0]).length === 1 && (any = any[0])[0] instanceof RegExp && !any[1] && !any[2])
          //   rules = any[0];

          symbols[key] = token;
          if (ms[$.G] || !first && (first = key)) // 若是文法符号（Grammar）或第一个符号
            starts.push(key);
        }
      }
      else if (ms[$.D]) {   // 若匹配折行（Wrap），则跳过
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
  var rule = [], i = 0, ms, s, type, flag, refine;

  while ((ms = read.$) && ms[$.D/*ivider*/])
   read();  // 跳过分隔符

  if ((ms = read.$) && (s = ms[$.P])) {   // 若首先匹配到规则限定条件（Qualify）
    read();
    rule.p = s;
  }

  while (ms = read.$) {
    if (ms[$.I]) {                // 匹配一般规则项（Item）：
      read();
      flag = flags[ms[$.F]] || 0;
      if (s = ms[$.S]) {       // 若该项是符号（Symbol）
        type = 1;
      }
      else if (s = ms[$.K]) {  // 若该项是关键字（Keyword）
        type = 0;
        s = '\\b' + s + '\\b';   // RegExp('\\b' + item + '\\b|', 'g');
      }
      else if (ms[$.B]) {  // 若该项是子语法开始项（Begin）
        type = 2;
        s = readRules(read);
        ms = read();
        if (!(ms && ms[$.E]))   // 若没有对应的子语法结束项（End），则报错
          throw new GrammarError('missing }', ms ? ms.index : -1);
      }
      else if(s=ms[$.W]) {
        type = -1;
      }
      else { // 否则是其他正则片段（Other）
        type = 0;   //RegExp(item + '|', 'g');
        s = ms[$.A/*ny*/];
      }
      refine = readRefine(read);   // 尝试读转义解析项
    }
    else if (s = ms[$.L]) {   // 匹配行保持项（Line）
      read();
      type = -1;
      // flag = DENY | NOWRAP; // 标志设置为禁止且无折行
      // item = '[\\n\\r\\u2028\\u2029]';
      refine = 0;   // 保持行是无转移匹配项的
    }
    else {  // 其他的表示本条规则已结束
      // while (read.$ && read.$[$.D])
      //  read();   // 跳过规则分隔符（Divider）
      break;
    }
    rule[i++] = s = { t: type, s: s, f: flag };
    if (refine)
      s.r = refine;
  }

  return i && rule;
}

/**
 * readRefine(read) 读取转义解析项 
 */
function readRefine(read) {
  var ms = read.$;
  if (ms && (ms = ms[$.R])) { // 若匹配转义解析项（Refine）
    read();
    return ms;
  }
}

/**
 * makeGrammar(grammar)
 *   从起始符号开始递归生成文法符号对象
 */
function makeGrammar(oldGrammar) {
  var symbols = [' '], newGrammar = { $: symbols }, index = 1;
  var starts = oldGrammar.$;
  for (var si = 0, start; start = starts[si]; si++)
    makeNamesake(start, [], '');

  return newGrammar;

  function makeNamesake(nameargs, params, path, refine) {
    var name = makename(nameargs, params), id;
    path += '>' + name;
    if (path.indexOf('>' + name + '>') >= 0)
      throw Error('Left recursive grammar: ' + path.slice(1));

    if (!(id = newGrammar[name])) {
      var oldName = getname(nameargs);
      if (symbol = oldGrammar[oldName]) {
        newGrammar[name] = id = index++;
        params = makeparams(nameargs, params);
        newGrammar[id] = makeRules(symbol, params, path);
      }
      else if(refine) {
        newGrammar[name] = id = index++;
      }
      else {
          throw Error('Unknown grammar symbol: ' + oldName);
      }
      symbols[id] = name;
    }
    return id;
  }

  function makeRules(oldRules, params, path) {
    var newRules = [], nri = 0, oldRule, rule, key;
    for (var ori = 0; oldRule = oldRules[ori]; ori++) {
      if (precheck(oldRule.p, params)) {
        var newRule = [], ni = 0, newItem;
        var stack = path;
        for (var oi = 0, oldItem; oldItem = oldRule[oi]; oi++) {
          var type = oldItem.t, symbol = oldItem.s, flag = oldItem.f, refine = oldItem.r, args;
          switch (type) {
            case 1:     // 符号式
              symbol = makeNamesake(symbol, params, stack);
              break;
            case 2:     // 子规则集
              symbol = makeRules(symbol, params, stack);
              break;
            case -1:    // 特殊符号（空白或换行）
              symbol = symbol == '_' ? 0 : -1;
          }

          if (refine)
            refine = -makeNamesake(refine, params, stack, 1);

          if (stack && !(flag & OPTION))
            stack = '';

          if (refine)
            flag = refine;

          newItem = flag ? [symbol, flag] : [symbol];

          newRule[ni++] = newItem;
        }
        newRules[nri++] = newRule;
      }
    }
    if (nri) {
      if (nri === 1 && ni === 1 && !type && !flag && !refine)
        newRules = newRules[0][0][0];
      return newRules;
    }
  }
}

/**
 * linkGrammar(grammar)
 *   链接文法成为解析驱动表
 */
function linkGrammar(grammar) {
  var indexes = {}, length = grammar.$.length, index, symbol;
  grammar[0] = /\s+|()/g;   // 空白解析项
  for (index = 1; index<length; index++){
    symbol = grammar[index];
    if (typeof symbol === 'string') {
      indexes[symbol] = index;
      grammar[index] = RegExp(symbol + '|()', 'g');
    }
  }
  for (var i = 1; i < length; i++) {
    symbol = grammar[i];
    if (typeof symbol === 'object')
      linkRules(symbol);
  }

  return grammar;

  function linkRules(rules) {
    for (var ri = 0, rule; rule = rules[ri]; ri++)
      for (var i = 0, item; item = rule[i]; i++) {
        var symbol = item[0], id;
        if (typeof symbol === 'object') {
          item[0] = id = index++;
          grammar[id] = linkRules(symbol);
        }
        else if (typeof symbol === 'string') {
          if (!(id = indexes[symbol])) {
            id = indexes[symbol] = index++;
            grammar[id] = RegExp(symbol + '|()', 'g');
          }
          item[0] = id;
        }
      }
    return rules;
  }
}


/** Utilities: -------------------------------------------------------------------------------- */

var reArgs = /[+?-](\w+)/g;
var reNamelen = /\W|$/;

// 获取符号项的名称部分
function getname(nameargs) {
  return nameargs.substr(0, nameargs.match(reNamelen).index);
}

// 获取符号项的形参
function getargs(nameargs) {
  return nameargs.match(reArgs) || [];
}

// 根据符号项和当前值参创建新的值参
function makeparams(nameargs, params) {
  return getargs(nameargs).map(function (s){
    return s[0]==='+' && s.slice(1) || s[0] === '?' && params.indexOf(s=s.slice(1))>=0 && s || '';
  })
  .filter(Boolean);      
}

// 根据符号项和当前值参创建符号名
function makename(nameargs, params) {
  return getname(nameargs) + makeparams(nameargs, params).join('');
}

// 检查前规则的提条件
function precheck(precond, params) {
  return !precond || (precond[0]==='+')^(params.indexOf(precond.slice(1))<0)
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
