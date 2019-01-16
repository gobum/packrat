I.js('../../src/grammar.js');

I.do('getname(nameargs):', function (I) {
  I.hope(getname('')).strict.equal('');
  I.hope(getname('Jane')).strict.equal('Jane');
  I.hope(getname('Jane?An+Be?Co?Do')).strict.equal('Jane');
  I.hope(getname('Jane?An?Be?Co?Do')).strict.equal('Jane');
  I.hope(getname('Jane?An-Be?Co?Do')).strict.equal('Jane');
  I.hope(getname('Jane+An+Be?Co?Do')).strict.equal('Jane');
  I.hope(getname('Jane+An?Be?Co?Do')).strict.equal('Jane');
  I.hope(getname('Jane+An-Be?Co?Do')).strict.equal('Jane');
  I.hope(getname('Jane-An+Be?Co?Do')).strict.equal('Jane');
  I.hope(getname('Jane-An?Be?Co?Do')).strict.equal('Jane');
  I.hope(getname('Jane-An-Be?Co?Do')).strict.equal('Jane');

  I.sum();
});

I.do('makename(nameargs, params):', function (I) {
  I.hope(makename('', [])).strict.equal('');
  I.hope(makename('Jane', [])).strict.equal('Jane');
  I.hope(makename('Jane?An+Be?Co?Do', [])).strict.equal('JaneBe');
  I.hope(makename('Jane?An?Be?Co?Do', [])).strict.equal('Jane');
  I.hope(makename('Jane?An-Be?Co?Do', [])).strict.equal('Jane');
  I.hope(makename('Jane+An+Be?Co?Do', [])).strict.equal('JaneAnBe');
  I.hope(makename('Jane+An?Be?Co?Do', [])).strict.equal('JaneAn');
  I.hope(makename('Jane+An-Be?Co?Do', [])).strict.equal('JaneAn');
  I.hope(makename('Jane-An+Be?Co?Do', [])).strict.equal('JaneBe');
  I.hope(makename('Jane-An?Be?Co?Do', [])).strict.equal('Jane');
  I.hope(makename('Jane-An-Be?Co?Do', [])).strict.equal('Jane');

  I.hope(makename('Jane?An+Be?Co?Do', ['Be'])).strict.equal('JaneBe');
  I.hope(makename('Jane?An?Be?Co?Do', ['Be'])).strict.equal('JaneBe');
  I.hope(makename('Jane?An-Be?Co?Do', ['Be'])).strict.equal('Jane');
  I.hope(makename('Jane+An+Be?Co?Do', ['Be'])).strict.equal('JaneAnBe');
  I.hope(makename('Jane+An?Be?Co?Do', ['Be'])).strict.equal('JaneAnBe');
  I.hope(makename('Jane+An-Be?Co?Do', ['Be'])).strict.equal('JaneAn');
  I.hope(makename('Jane-An+Be?Co?Do', ['Be'])).strict.equal('JaneBe');
  I.hope(makename('Jane-An?Be?Co?Do', ['Be'])).strict.equal('JaneBe');
  I.hope(makename('Jane-An-Be?Co?Do', ['Be'])).strict.equal('Jane');

  I.hope(makename('Jane?An+Be?Co?Do', ['Be', 'Do'])).strict.equal('JaneBeDo');
  I.hope(makename('Jane?An?Be?Co?Do', ['Be', 'Do'])).strict.equal('JaneBeDo');
  I.hope(makename('Jane?An-Be?Co?Do', ['Be', 'Do'])).strict.equal('JaneDo');
  I.hope(makename('Jane+An+Be?Co?Do', ['Be', 'Do'])).strict.equal('JaneAnBeDo');
  I.hope(makename('Jane+An?Be?Co?Do', ['Be', 'Do'])).strict.equal('JaneAnBeDo');
  I.hope(makename('Jane+An-Be?Co?Do', ['Be', 'Do'])).strict.equal('JaneAnDo');
  I.hope(makename('Jane-An+Be?Co?Do', ['Be', 'Do'])).strict.equal('JaneBeDo');
  I.hope(makename('Jane-An?Be?Co?Do', ['Be', 'Do'])).strict.equal('JaneBeDo');
  I.hope(makename('Jane-An-Be?Co?Do', ['Be', 'Do'])).strict.equal('JaneDo');

  I.sum();
});

I.do('makeparams(nameargs, params):', function (I) {
  I.hope(makeparams('', [])).deep.equal([]);
  I.hope(makeparams('Jane', [])).deep.equal([]);
  I.hope(makeparams('Jane?An+Be?Co?Do', [])).deep.equal(['Be']);
  I.hope(makeparams('Jane?An?Be?Co?Do', [])).deep.equal([]);
  I.hope(makeparams('Jane?An-Be?Co?Do', [])).deep.equal([]);
  I.hope(makeparams('Jane+An+Be?Co?Do', [])).deep.equal(['An', 'Be']);
  I.hope(makeparams('Jane+An?Be?Co?Do', [])).deep.equal(['An']);
  I.hope(makeparams('Jane+An-Be?Co?Do', [])).deep.equal(['An']);
  I.hope(makeparams('Jane-An+Be?Co?Do', [])).deep.equal(['Be']);
  I.hope(makeparams('Jane-An?Be?Co?Do', [])).deep.equal([]);
  I.hope(makeparams('Jane-An-Be?Co?Do', [])).deep.equal([]);

  I.hope(makeparams('Jane?An+Be?Co?Do', ['Be'])).deep.equal(['Be']);
  I.hope(makeparams('Jane?An?Be?Co?Do', ['Be'])).deep.equal(['Be']);
  I.hope(makeparams('Jane?An-Be?Co?Do', ['Be'])).deep.equal([]);
  I.hope(makeparams('Jane+An+Be?Co?Do', ['Be'])).deep.equal(['An','Be']);
  I.hope(makeparams('Jane+An?Be?Co?Do', ['Be'])).deep.equal(['An','Be']);
  I.hope(makeparams('Jane+An-Be?Co?Do', ['Be'])).deep.equal(['An']);
  I.hope(makeparams('Jane-An+Be?Co?Do', ['Be'])).deep.equal(['Be']);
  I.hope(makeparams('Jane-An?Be?Co?Do', ['Be'])).deep.equal(['Be']);
  I.hope(makeparams('Jane-An-Be?Co?Do', ['Be'])).deep.equal([]);

  I.hope(makeparams('Jane?An+Be?Co?Do', ['Be', 'Do'])).deep.equal(['Be','Do']);
  I.hope(makeparams('Jane?An?Be?Co?Do', ['Be', 'Do'])).deep.equal(['Be','Do']);
  I.hope(makeparams('Jane?An-Be?Co?Do', ['Be', 'Do'])).deep.equal(['Do']);
  I.hope(makeparams('Jane+An+Be?Co?Do', ['Be', 'Do'])).deep.equal(['An','Be','Do']);
  I.hope(makeparams('Jane+An?Be?Co?Do', ['Be', 'Do'])).deep.equal(['An','Be','Do']);
  I.hope(makeparams('Jane+An-Be?Co?Do', ['Be', 'Do'])).deep.equal(['An','Do']);
  I.hope(makeparams('Jane-An+Be?Co?Do', ['Be', 'Do'])).deep.equal(['Be','Do']);
  I.hope(makeparams('Jane-An?Be?Co?Do', ['Be', 'Do'])).deep.equal(['Be','Do']);
  I.hope(makeparams('Jane-An-Be?Co?Do', ['Be', 'Do'])).deep.equal(['Do']);

  I.sum();
});

I.do('precheck(precond, params):', function(I){
  I.hope(precheck('', [])).is.ok;
  I.hope(precheck('+In', [])).is.not.ok;
  I.hope(precheck('-In', [])).is.ok;
  I.hope(precheck('', ['In'])).is.ok;
  I.hope(precheck('+In', ['In'])).is.ok;
  I.hope(precheck('-In', ['In'])).is.not.ok;
  I.hope(precheck('', ['In'])).is.ok;
  I.hope(precheck('+No', ['In'])).is.not.ok;
  I.hope(precheck('-No', ['In'])).is.ok;
  I.hope(precheck('', ['In','No'])).is.ok;
  I.hope(precheck('+No', ['In','No'])).is.ok;
  I.hope(precheck('-No', ['In','No'])).is.not.ok;
  
  I.sum();
});