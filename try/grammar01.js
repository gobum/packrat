var iTerminal, iSymbol, iDivider, iEntity, iRegexp, iInline;
var Read = function (g) {
  iTerminal = g.push(/([a-zA-Z_]\w*::)/);
  iSymbol = g.push(/([a-zA-Z_]\w*:)/);
  iEntity = g.push(/([a-zA-Z_]\w*)/);
  iRegexp = g.push(/(\/(?:\\.|\[(?:\\.|[^\]])*]|[^\/*\n\r])(?:\\.|\[(?:\\.|[^\]])*]|[^/\n\r])*?\/)/);
  iInline = g.push(/(~)/);
  iDivider = g.push(/(\|)/);
  iLinefeed = g.push(/([\n\r])/);

  for (var i = 0; i < g.length; i++)
    g[i] = g[i].source;
  var reGrammar = RegExp(g.join('|'), 'g');
  return function (code) {
    var re = RegExp(reGrammar);
    var last;
    get.see = see;
    return get;

    function see() {
      return last || (last = read());
    }
    function get(token) {
      return last ? (token=last, last=undefined, token) : read();
    }

    function read() {
      var i = re.lastIndex, ms = re.exec(code), token;
      if (ms) {
        var s = ms[0], j = re.lastIndex - s.length;
        var unknown = code.substring(i, j).trim();
        if (unknown) {
          token = { s: unknown, t: 0 },
            re.lastIndex = j;
        }
        else {
          for (t = ms.length; ms[--t] === undefined;);
          token = { s: ms[0], t: t };
        }
      }
      return token;
    }
  }
}([]);

/**
 * 编译文法为驱动表
 * @param {*} text 
 */
function Grammar(text) {
  var grammar={}, token;
  var read = Read(text);
  while(token = read()) {
    switch(token.t) {
      case iSymbol:
        makeSymbol(token.s, read, grammar);
        break;
      case iTerminal:
        makeTerminal(token.s, read, grammar);
        break;
      case iDivider:
      case iLinefeed:
        break;
      default:
        throw Error('Unknown token: '+token.s);
    }
  }

  var keys = Object.getOwnPropertyNames(grammar);
  for(var i=0; i<keys.length; i++) {
    var key = keys[i];
    var symbol = grammar[key];
    grammar[key] = i;
    grammar[i] = symbol;
  }
  var l = i, j = i;
  for(var i=0; i<l; i++) {
    symbol = grammar[i];
    if(symbol instanceof Array) {
      for(var ri=0, rule; rule=symbol[ri]; ri++) {
        for(var ii=0, item; item = rule[ii]; ii++) {
          var value = item[0];
          if(typeof value === 'string') {
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

function makeSymbol(title, read, grammar) {
  var symbol = [];
  var token;
  while((token=read.see())&&token.t===iLinefeed) read();  //跳过换行
  loop: while(token = read.see()) {
    switch(token.t) {
      case iEntity:
      case iRegexp:
      case iInline:
        symbol.push(makeRule(read));
        break;
      case iDivider:
      case iLinefeed:
        read();
        break;
      default:
        break loop;
    }
  }
  var name = title.slice(0, -1);
  grammar[name] = symbol;
}

function makeRule(read) {
  var rule=[], token;
  loop: while(token = read.see()) {
    switch(token.t) {
      case iEntity:
        rule.push([token.s, 0]);
        break;
      case iRegexp:
        rule.push([makeRegexp(token.s), 0]);
        break;
      default:
        break loop;
    }
    read();
  }
  return rule;
}

function makeTerminal(title, read, grammar) {
  var token;
  while((token=read.see())&&token.t===iLinefeed) read();  //跳过换行
  token = read();
  if(token.t === iRegexp) {
    var name = title.slice(0, -2);
    grammar[name] = makeRegexp(token.s);
  }
  else {
    throw Error('Error at: '+token.s);
  }
}

function makeRegexp(s) {
  return RegExp(s.slice(1,-1)+'|', 'g');
}

var sGrammar = `
VariableStatement:
  /\\bvar\\b/ Identifier /;/
Identifier::
  /\\[a-zA-Z_$][\\w$]*/
_::
  /[\\u0020\\t\\v\\f\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000\\ufeff\\ufffe]+/
__::
  /\\s+/
`;

var grammar = Grammar(sGrammar);
console.log(grammar);