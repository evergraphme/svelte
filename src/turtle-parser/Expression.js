import { Parser } from './Parser';

export class Expression {
  constructor({name, push, terminal, satisfied = false, lazy_expression}) {
    this.name = name;
    this.terminal = terminal;
    this.push = push || this.lazy_push;
    this.satisfied = satisfied;
    this.lazy_expression = lazy_expression;
  }

  test(text, parent) {
    return new Parser({
      expression: this,
      parent,
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
