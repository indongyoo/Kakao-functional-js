const curry = f => (a, ..._) =>
  _.length ?
    f(a, ..._) :
    (..._) => f(a, ..._);

const go1 = (a, f) => a instanceof Promise ?
  a.then(f) : f(a);

const reduce = curry(function(f, acc, iterable) {
  if (arguments.length == 2) {
    iterable = acc[Symbol.iterator]();
    acc = iterable.next().value;
  }
  for (let a of iterable) {
    acc = go1(acc, acc => f(acc, a));
  }
  return acc;
});

const go = (a, ...fs) => reduce((a, f) => f(a), a, fs);

const pipe = (f, ...fs) => (..._) => go(f(..._), ...fs);

const add = (a, b) => a + b;

const L = {};

L.map = curry(function* (f, iterable) {
  for (const a of iterable) yield f(a);
});

L.filter = curry(function* (f, iterable) {
  for (const a of iterable) if (f(a)) yield a;
});

L.take = curry(function (l, iterable) {
  return L.takeUntil(_ => --l == 0,iterable);
});

L.takeUntil = curry(function* (f, iterable) {
  for (const a of iterable) {
    yield a;
    if (f(a)) break;
  }
});

const isIterable = iter =>
  Boolean(iter && iter[Symbol.iterator]);

L.flat = function* (iterable) {
  for (const a of iterable) {
    if (isIterable(a)) {
      yield* a;
    } else {
      yield a;
    }
  }
};

L.range = function* (start, stop, step = 1) {
  while (start < stop) {
    yield start;
    start += step;
  }
};

L.flatMap = curry(pipe(L.map, L.flat));

const map = curry((..._) => [...L.map(..._)]);

const filter = curry((..._) => [...L.filter(..._)]);

const take = curry((..._) => [...L.take(..._)]);

const takeUntil = curry((..._) => [...L.takeUntil(..._)]);

const flat = _ => [...L.flat(_)];

const flatMap = curry(pipe(L.map, flat));