// From https://www.w3.org/TR/REC-xml/#sec-notation
import { Expression } from './Expression';

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
      if (parser.children.length === 0) {
        parser.children.push(expression.test('', parser));
      }
      let accepted = parser.children[0].push(char);
      if (! accepted) {
        if (! parser.children[0].valid) {
          parser.text = '';
          parser.children.pop();
        }
      }
      parser.satisfied = parser.length === 0 || parser.children[0] && parser.children[0].satisfied;
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
      if (parser.children.length === 0) {
        parser.children = expressions.map(e => e.test('', parser));
        parser.index = 0;
      }
      if (parser.index >= parser.children.length) {
        return false;
      }
      let accepted = parser.children[parser.index].push(char);
      if (!parser.children[parser.index].valid) {
        parser.valid = false;
        parser.index = parser.children.length;
        return false;
      }
      // if (!accepted && ws && parser.children[parser.index].expression.terminal === false && !/\s/.test(parser.text[parser.text.length - 1])) {
      //   console.log(`finished sequenced ${parser.children[parser.index].expression.name} [${parser.children[parser.index].text}]`)
      // }
      if (!accepted && ws && /\s/.test(char)) {
        // Accept whitespace between sequence expressions if non-terminal
        return true;
      }
      while (parser.index + 1 < parser.children.length && !accepted) {
        parser.index = parser.index + 1;
        accepted = parser.children[parser.index].push(char);
        if (!parser.children[parser.index].valid) {
          parser.valid = false;
          parser.index = parser.children.length;
          return false;
        }
        // if (parser.children[parser.index].expression.terminal === false)
        //   console.log(`new sequenced ${parser.children[parser.index].expression.name} [${parser.children[parser.index].text}]`)
      }
      parser.satisfied = parser.children.every(p => p.satisfied);
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
      if (parser.children.length === 0) {
        parser.children = expressions.map(e => e.test('', parser));
      }
      const accepted = parser.children.map(p => p.push(char)).some(a => a);
      parser.children = parser.children.filter(p => p.valid);
      parser.satisfied = parser.children.some(p => p.satisfied);
      if (accepted) {
        parser.children = parser.children.filter(p => p.length === parser.length + 1);
      }
      else {
        parser.valid = parser.children.length > 0 && parser.satisfied;
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
      let current = parser.children[parser.children.length - 1];
      let accepted = current && current.push(char);
      if (! accepted && (!current || current.valid)) {
        current = expression.test('', parser);
        accepted = current.push(char);
        if (accepted) {
          parser.children.push(current);
        }
      }
      parser.valid = parser.children.every(p => p.valid);
      parser.satisfied = parser.children.length > 0 && parser.children.every(p => p.satisfied);
      return accepted;
    },
  });
}

export function zeroOrMore(expression) {
  // zeroOrMore, A*
  return new Expression({
    name: 'zeroOrMore',
    push: (parser, char) => {
      let current = parser.children[parser.children.length - 1];
      let accepted = current && current.push(char);
      if (! accepted && (!current || current.valid)) {
        current = expression.test('', parser);
        accepted = current.push(char);
        if (accepted) {
          parser.children.push(current);
        }
      }
      parser.valid = parser.children.every(p => p.valid);
      parser.satisfied = parser.children.every(p => p.satisfied);
      return accepted;
    },
    satisfied: true,
  });
}

