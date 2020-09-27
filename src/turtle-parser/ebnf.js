// From https://www.w3.org/TR/REC-xml/#sec-notation

class Parser {
  constructor({expression, text = '', satisfied = false}) {
    this.expression = expression;
    this.text = '';
    this.valid = true;
    this.satisfied = satisfied;

    for (let i = 0; i < text.length; i++) {
      this.push(text[i]);
    }
  }

  get current() {
    return this.buffer[this.start + this.length - 1];
  }

  get fullString() {
    return this.buffer.substring(this.start, this.length);
  }

  get length() {
    return this.text.length;
  }

  push(char) {
    if (! this.valid) {
      return false;
    }
    // this.length = this.length + 1;
    const accepted = this.expression.push(this, char);
    if (accepted) {
      this.text = this.text + char;
    }
    // console.log(this.expression.name, this.text, this.valid, accepted);
    return accepted;
  }
}

class Expression {
  constructor({name, push, satisfied = false}) {
    this.name = name;
    this.push = push;
    this.satisfied = satisfied;
  }

  test(text) {
    return new Parser({
      expression: this,
      text,
      satisfied: this.satisfied,
    });
  }

  // push(parser, char) {
  //   return false;
  // }
}

export function characterClass(regex) {
  // characterClass, [a-z]
  return new Expression({
    name: 'characterClass',
    push: (parser, char) => {
      if (parser.length > 0) {
        return false;
      }
      return parser.valid = parser.satisfied = regex.test(char); },
  });
}

export function string(s) {
  // string, 'abc'
  return new Expression({
    name: 'string',
    push: (parser, char) => {
      if (parser.length >= s.length) {
        return parser.valid = parser.satisfied = false;
      }
      if (s.indexOf(parser.text + char) != 0) {
        return parser.valid = parser.satisfied = false;
      }
      parser.satisfied = s.length === (parser.length + 1);
      return true;
    },
  });
}

export function optional(expression) {
  // optional, A?
  return new Expression({
    name: 'optional',
    push: (parser, char) => {
      if (parser.nomore) {
        return false;
      }
      parser.wrapped = parser.wrapped || expression.test();
      let accepted = parser.wrapped.push(char);
      if (! accepted) {
        parser.nomore = true;
        if (! parser.wrapped.valid) {
          parser.text = '';
        }
      }
      parser.satisfied = parser.length === 0 || parser.wrapped.satisfied;
      return accepted;
    },
    satisfied: true,
  });
}

export function sequence() {
  // sequence, A B
  return new Expression({
    name: 'sequence',
    push: (parser, char) => { return false; },
  });
}

export function or() {
  // or, A | B
  return new Expression({
    name: 'or',
    push: (parser, char) => { return false; },
  });
}

export function difference() {
  // difference, A - B
  return new Expression({
    name: 'difference',
    push: (parser, char) => { return false; },
  });
}

export function oneOrMore() {
  // oneOrMore, A+
  return new Expression({
    name: 'oneOrMore',
    push: (parser, char) => { return false; },
  });
}

export function zeroOrMore() {
  // zeroOrMore, A*
  return new Expression({
    name: 'zeroOrMore',
    push: (parser, char) => { return false; },
  });
}

