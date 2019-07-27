const curry = f => (a, ..._) =>
  _.length ?
    f(a, ..._) :
    (..._) => f(a, ..._);

const add = (a, b) => a + b;

const reduce = curry(function(f, acc, iterable) {
  if (arguments.length == 2) {
    iterable = acc[Symbol.iterator]();
    acc = iterable.next().value;
  }
  for (const a of iterable) {
    acc = acc instanceof Promise ?
      acc.then(acc => f(acc, a)) :
      f(acc, a);
  }
  return acc;
});

const go = (a, ...fs) => reduce((a, f) => f(a), a, fs);

const pipe = (f, ...fs) => (...args) => go(f(...args), ...fs);

const inc = (obj, k) => {
  obj[k] = (obj[k] || 0) + 1;
  return obj;
};

const count = iterable => reduce(inc, {}, iterable);

const push = (res, a) => (res.push(a), res);

const toArray = iterable => reduce(push, [], iterable);

const L = {};

L.range = function* (start, stop, step = 1) {
  while (start < stop) {
    yield start;
    start += step;
  }
};

L.map = curry(function* (f, iterable) {
  for (const a of iterable) {
    yield f(a);
  }
});

L.filter = curry(function* (f, iterable) {
  for (const a of iterable) {
    if (f(a)) yield a;
  }
});

L.takeUntil = curry(function* (f, iterable) {
  for (const a of iterable) {
    yield a;
    if (f(a)) break;
  }
});

L.take = curry(function(l, iterable) {
  return L.takeUntil(() => --l == 0, iterable);
});

const isIterable = iterable =>
  Boolean(iterable && iterable[Symbol.iterator]);

L.flat = function* (iterable) {
  for (const a of iterable) {
    if (typeof a != 'string' && isIterable(a)) {
      yield* a;
    } else {
      yield a;
    }
  }
};

L.flatMap = curry(pipe(L.map, L.flat));

const map = curry(function(f, iterable) {
  return toArray(L.map(f, iterable));
});

const filter = curry(function(f, iterable) {
  return toArray(L.filter(f, iterable));
});

const sum = reduce(add);

const sumMap = curry(pipe(L.map, sum));