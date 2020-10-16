export class Parser {
  constructor({expression, parent, text = '', satisfied = false}) {
    this.expression = expression;
    this.parent = parent;
    this.children = [];
    // The text that this parser has accepted so far
    this.text = '';
    // The current input is valid turtle (but we might need more to get satisfied)
    this.valid = true;
    // The current input is sufficient for this parser to be complete
    this.satisfied = satisfied;
    // Kind of like "still active". True until a character is pushed that is not accepted.
    this.accepting = true;

    for (let i = 0; i < text.length; i++) {
      this.push(text[i]);
    }
  }

  get length() {
    return this.text.length;
  }

  push(char) {
    if (! this.valid || ! this.accepting) {
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
    const accepted = this.accepting = this.expression.push(this, char);
    if (accepted) {
      this.text = this.text + char;
    }
    // console.log(this.expression.name, this.text, this.valid, accepted);
    return accepted;
  }

  // Returns the number of parents this parser has
  level() {
    return this.parent ? this.parent.level() + 1 : 0;
  }

  // Returns expression name, including parents, joined with dot. E.g. 'turtleDoc.statement...'
  fullName() {
    return this.parent ? this.parent.fullName() + `.${this.expression.name}` : this.expression.name;
  }

  hasParent(name) {
    return this.expression.name === name ? true : this.parent && this.parent.hasParent(name);
  }

  justCompleted(name) {
    return this.collect(p => p.satisfied && p.text.length > 0).pop().hasParent(name);
  }

  toString() {
    return this.collect(p => p.expression.terminal !== true || ! p.valid || ! p.satisfied)
    .map(p =>
      `${''.padStart(p.level()*2)}${p.valid ? p.satisfied ? '√' : '⋯' : 'x'}`
      + ` ${p.expression.name} [${p.text.replace(/\n/g, '\\n')}]`)
    .join('\n');
  }

  // Get currently active part of sequences
  //collect(p => p.expression.name === 'sequence' && p.accepting).map(p => p.children[p.index].fullName())

  // Traverse tree and collect parsers that match
  collect(matcher) {
    let result = this.children.map(p => p.collect(matcher)).flat();
    if (matcher(this)) {
      result.unshift(this);
    }
    return result;
  }

  // Convenince method to check if a certain expression is accepting input
  // and has already accepted input
  someAccepting(name) {
    return this.collect(p => p.accepting && p.expression.name === name && p.text.length > 0).length > 0
  }
}
