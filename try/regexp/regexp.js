var lex = function(keys, ki, key, lex){
  lex = make(A(
    [{ TERM: /\w+/ }, '::'],
    [{ SYMBOL: /\w+/ }, '(?:\\[', { PARAMS: /\w+(?:,\w+)*/ }, '])?:'],
    {
      ITEM: [
        { TAG: '[?+*&=!]|' },
        '(?:',
        A(
          [{ ID: /\w+/ }, '(?:\\[', { ARGS: '[?+~]\w+(?:,[?+~]\w+)*' }, '\\])?'],
          ['\\/', { REGEX: /(?:\\.|\[(?:\\.|[^\]])*]|[^\/*\n\r])(?:\\.|\[(?:\\.|[^\]])*]|[^/\n\r])*?/ }, '\\/']
        ),
        ')'
      ]
    }
  ));

  lex = RegExp(lex, 'g');
  for (ki = 0; key = keys[ki];) {
    ki++;
    lex[key] = ki;
    lex[ki] = key;
  }

  return lex;

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
        keys[ki++] = arg;
        item = '(' + make(item[arg]) + ')';
      }
    }
    return item;
  }

}([], 0);

console.log(lex);
