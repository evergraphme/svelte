// From https://www.w3.org/TR/REC-xml/#sec-notation

export function characterSet() {
  // characterSet, [a-z]
  return new Rule({
    name: 'characterSet',
    next: (instance) => { return false; },
  });
}

export function string() {
  // string, 'abc'
  return new Rule({
    name: 'string',
    next: (instance) => { return false; },
  });
}

export function optional() {
  // optional, A?
  return new Rule({
    name: 'optional',
    next: (instance) => { return false; },
  });
}

export function sequence() {
  // sequence, A B
  return new Rule({
    name: 'sequence',
    next: (instance) => { return false; },
  });
}

export function or() {
  // or, A | B
  return new Rule({
    name: 'or',
    next: (instance) => { return false; },
  });
}

export function difference() {
  // difference, A - B
  return new Rule({
    name: 'difference',
    next: (instance) => { return false; },
  });
}

export function oneOrMore() {
  // oneOrMore, A+
  return new Rule({
    name: 'oneOrMore',
    next: (instance) => { return false; },
  });
}

export function zeroOrMore() {
  // zeroOrMore, A*
  return new Rule({
    name: 'zeroOrMore',
    next: (instance) => { return false; },
  });
}

