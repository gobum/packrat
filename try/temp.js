```
Polynome:
  Monomial *{ [+-] Monomial }
Monomial:
  Number *{ [*/] Number?In }
  \( Polynome \)
  [+-] Monomial
Number:
  \d+
```

var G01 = {
  $: ['Polynome'],
  Polynome: [
    [
      { t: 1, s: 'Monomial', f: 0 },
      {
        t: 2,
        s: [
          [{ t: 0, s: '[+-]', f: 0 }, { t: 1, s: 'Monomial', f: 0 }]
        ],
        f: 1 + 2
      }
    ]
  ],
  Monomial: [
    [
      { t: 1, s: 'Number', f: 0 },
      {
        t: 2,
        s: [
          [{ t: 0, s: '[*/]', f: 0 }, { t: 1, s: 'Number', f: 0 }]
        ],
        f: 1 + 2
      }
    ],
    [{ t: 0, s: '\\(', f: 0 }, { t: 1, s: 'Polynome', f: 0 }, { t: 0, s: '\\)', f: 0 }],
    [{ t: 1, s: '[+-]', f: 0 }, { t: 1, s: 'Monomial', f: 0 }]
  ],
  Number: [
    [{ t: 0, s: '\\d+', f: 0 }]
  ]
}

G2 = {
  Polynome: 0,
  Monomial: 1,
  Number: 2,
  0: {
    n: 'Polynome',
    t: 2,
    s: [
      [
        { i: 1 /*Monomial*/, f: 0 },
        { i: 3, f: 1 + 2 }
      ]
    ]
  },
  1: {
    n: 'Monomial',
    t: 2,
    s: [
      [
        { i: 2 /*Number*/, f: 0 },
        { i: 5 /*[/*]*/, f: 1 + 2 }
      ],
      [
        { i: 6 /*\\(*/, f: 0 },
        { i: 0 /*Polynome*/, f: 0 },
        { i: 7 /*\\)*/, f: 0 }
      ],
      [
        { i: 4 /*[+-]*/, f: 0 },
        { i: 1 /*Monomial*/, f: 0 }
      ]
    ]
  },
  2: { n: 'Number', t: 0, s: '\\d+' },
  3: {
    t: 2,
    s: [
      [
        { i: 4 /*[+-]*/, f: 0 },
        { i: 1 /*Monomial*/, f: 0 }
      ]
    ]
  },
  4: {
    t: 0, s: '[+-]'
  },
  5: { t: 0, s: '[*/]' },
  6: { t: 0, s: '\\(' },
  7: { t: 0, s: '\\)' }
}

