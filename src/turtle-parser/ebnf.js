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
    if (char.length > 1) {
      // Push one character at a time
      let result;
      for (let i = 0; i < char.length; i++) {
        result = this.push(char[i]);
      }
      return result;
    }
    const accepted = this.expression.push(this, char);
    if (accepted) {
      this.text = this.text + char;
    }
    // console.log(this.expression.name, this.text, this.valid, accepted);
    return accepted;
  }

  toString(indent = 0) {
    let result = '';
    let nextIndent = indent;
    if (this.expression.terminal === false || ! this.valid || ! this.satisfied) {
      const state = this.valid ? this.satisfied ? '√' : '⋯' : 'x';
      result = `${''.padStart(indent)}${state} ${this.expression.name} [${this.text.replace('\n', '\\n')}]\n`;
      nextIndent = indent + 2;
    }
    if (Array.isArray(this.wrapped)) {
      result = result + this.wrapped.map(p => p.toString(nextIndent)).filter(l => l.length > 0).join('');
    }
    else if (this.wrapped) {
      result = result + this.wrapped.toString(nextIndent);
    }
    return result;
  }
}

export class Expression {
  constructor({name, push, terminal, satisfied = false, lazy_expression}) {
    this.name = name;
    this.terminal = terminal;
    this.push = push || this.lazy_push;
    this.satisfied = satisfied;
    this.lazy_expression = lazy_expression;
  }

  test(text) {
    return new Parser({
      expression: this,
      text,
      satisfied: this.satisfied,
    });
  }

  // Hmm. Must be a prettier way to handle circular references in Turtle/EBNF grammar
  lazy_push(parser, char) {
    if (! this.expression) {
      this.expression = this.lazy_expression && this.lazy_expression();
    }
    if (this.expression) {
      return this.expression.push(parser, char);
    }
    return false;
  }
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
      if (parser.length === s.length) {
        return false;
      }
      if (s.indexOf(parser.text + char) != 0) {
        return parser.valid = parser.satisfied = false;
      }
      parser.satisfied = s.length === (parser.length + 1);
      return true;
    },
  });
}

export function caseInsensitiveString(s) {
  // string, 'abc'
  return new Expression({
    name: 'string',
    push: (parser, char) => {
      if (parser.length === s.length) {
        return false;
      }
      if (s.toLowerCase().indexOf(parser.text.toLowerCase() + char.toLowerCase()) != 0) {
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
          parser.wrapped = undefined;
        }
      }
      parser.satisfied = parser.length === 0 || parser.wrapped.satisfied;
      return accepted;
    },
    satisfied: true,
  });
}

export function sequence(expressions, ws = false) {
  // sequence, A B
  return new Expression({
    name: 'sequence',
    push: (parser, char) => {
      if (!parser.wrapped) {
        parser.wrapped = expressions.map(e => e.test());
        parser.index = 0;
      }
      if (parser.index >= parser.wrapped.length) {
        return false;
      }
      let accepted = parser.wrapped[parser.index].push(char);
      if (!parser.wrapped[parser.index].valid) {
        parser.valid = false;
        parser.index = parser.wrapped.length;
        return false;
      }
      if (!accepted && ws && /\s/.test(char)) {
        // Accept whitespace between sequence expressions if non-terminal
        return true;
      }
      while (parser.index + 1 < parser.wrapped.length && !accepted) {
        parser.index = parser.index + 1;
        accepted = parser.wrapped[parser.index].push(char);
        if (!parser.wrapped[parser.index].valid) {
          parser.valid = false;
          parser.index = parser.wrapped.length;
          return false;
        }
      }
      parser.satisfied = parser.wrapped.every(p => p.satisfied);
      return accepted;
    },
  });
}

export function wsequence(expressions) {
  return sequence(expressions, true);
}

export function or(expressions) {
  // or, A | B
  return new Expression({
    name: 'or',
    push: (parser, char) => {
      parser.wrapped = parser.wrapped || expressions.map(e => e.test());
      const accepted = parser.wrapped.map(p => p.push(char)).some(a => a);
      parser.wrapped = parser.wrapped.filter(p => p.valid);
      parser.satisfied = parser.wrapped.some(p => p.satisfied);
      if (accepted) {
        parser.wrapped = parser.wrapped.filter(p => p.length === parser.length + 1);
      }
      else {
        parser.valid = parser.wrapped.length > 0 && parser.satisfied;
      }
      return accepted;
    },
  });
}

export function difference() {
  // difference, A - B
  return new Expression({
    name: 'difference',
    push: (parser, char) => { return false; },
  });
}

export function oneOrMore(expression) {
  // oneOrMore, A+
  return new Expression({
    name: 'oneOrMore',
    push: (parser, char) => {
      if (parser.nomore) {
        return false;
      }
      parser.wrapped = parser.wrapped || [];
      let current = parser.wrapped[parser.wrapped.length - 1];
      let accepted = current && current.push(char);
      if (! accepted && (!current || current.valid)) {
        current = expression.test();
        accepted = current.push(char);
        if (accepted) {
          parser.wrapped.push(current);
        }
        else {
          parser.nomore = true;
        }
      }
      parser.valid = parser.wrapped.every(p => p.valid);
      parser.satisfied = parser.wrapped.length > 0 && parser.wrapped.every(p => p.satisfied);
      return accepted;
    },
  });
}

export function zeroOrMore(expression) {
  // zeroOrMore, A*
  return new Expression({
    name: 'zeroOrMore',
    push: (parser, char) => {
      if (parser.nomore) {
        return false;
      }
      parser.wrapped = parser.wrapped || [];
      let current = parser.wrapped[parser.wrapped.length - 1];
      let accepted = current && current.push(char);
      if (! accepted && (!current || current.valid)) {
        current = expression.test();
        accepted = current.push(char);
        if (accepted) {
          parser.wrapped.push(current);
        }
        else {
          parser.nomore = true;
        }
      }
      parser.valid = parser.wrapped.every(p => p.valid);
      parser.satisfied = parser.wrapped.every(p => p.satisfied);
      return accepted;
    },
    satisfied: true,
  });
}

