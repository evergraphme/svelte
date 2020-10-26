const rdf = require("rdf-ext");
const namespace = require('@rdfjs/namespace');
const XSD = namespace('http://www.w3.org/2001/XMLSchema#');

export class Parser {
  constructor({expression, parent, text = '', satisfied = false, state, callback}) {
    // Parser state as per https://www.w3.org/TR/turtle/#sec-parsing
    this.state = parent ? parent.state : state ? state : {
      baseURI: undefined,
      namespaces: {},
      bnodeLabels: {},
      curSubject: undefined,
      curPredicate: undefined,
    }
    this.expression = expression;
    this.parent = parent;
    this.children = [];
    this.callback = parent ? parent.callback : callback;
    // The text that this parser has accepted so far
    this.text = '';
    // The current input is valid turtle (but we might need more to get satisfied)
    this.valid = true;
    // The current input is sufficient for this parser to be complete
    this.originalSatisfied = this.satisfied = satisfied;
    // Kind of like "still active". True until a character is pushed that is not accepted.
    this.accepting = true;

    for (let i = 0; i < text.length; i++) {
      this.push(text[i]);
    }
  }

  reset(text) {
    // console.log(`Parser reset from [${this.text.replace(/\n/g, '\\n')}] to [${text.replace(/\n/g, '\\n')}]. Base=[${this.state.baseURI}], parent=[${this.parent}]`);
    this.state.curSubject = undefined;
    this.state.curPredicate = undefined;
    this.children = []
    this.text = '';
    this.valid = true;
    this.satisfied = this.originalSatisfied;
    this.accepting = true;
    for (let i = 0; i < text.length; i++) {
      this.push(text[i]);
    }
    return this;
  }

  clone({text, callback = this.callback}) {
    // console.log('Parser cloned');
    return new Parser({
      expression: this.expression,
      state: this.state,
      parent: this.parent,
      satisfied: this.originalSatisfied,
      text,
      callback,
    })
  }

  get length() {
    return this.text.length;
  }

  emitBase() {
    const IRIREF = this.collect(p => p.expression.name === 'IRIREF')[0].value();
    this.state.baseURI = IRIREF;
    // console.log(`base ${IRIREF}`);
  }

  emitPrefix() {
    const prefixParser = this.collect(p => p.expression.name === 'PN_PREFIX')[0];
    const PN_PREFIX = prefixParser ? prefixParser.text : '';
    const IRIREF = this.collect(p => p.expression.name === 'IRIREF')[0].value();
    this.state.namespaces[PN_PREFIX] = IRIREF;
    // console.log(`prefix ${PN_PREFIX}: ${IRIREF}`);
  }

  emitSubject() {
    this.state.curSubject = this.value();
    // console.log(`subject ${this.value()}`);
  }

  emitVerb() {
    if (this.text === 'a') {
      this.state.curPredicate = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
      // console.log('verb http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    }
    else {
      this.state.curPredicate = this.value();
      // console.log(`verb ${this.value()}`);
    }
  }

  emitObject() {
    // console.log(`object ${this.value()}`);
    // console.log(`triple ${this.state.curSubject} ${this.state.curPredicate} ${this.value()} .`);
    const curObject = this.value();
    // Todo: stop checking curObject here and instead disallow invalid prefix usage or other reasons for triple to be invalid
    if (this.callback && curObject) {
      this.callback(
        rdf.quad(
          rdf.namedNode(this.state.curSubject),
          rdf.namedNode(this.state.curPredicate),
          curObject.termType ? curObject : rdf.namedNode(curObject)));
    }
  }

  // From https://www.w3.org/TR/turtle/#sec-parsing-terms
  value() {
    let result = undefined;
    if (this.expression.name === 'IRIREF') {
      // Strip <>
      result = this.text.substring(1, this.text.length - 1);
      result = unescapeNumeric(result);
      if (this.state.baseURI) {
        result = new URL(result, this.state.baseURI).href;
      }
    }
    else if (this.expression.name === 'PNAME_NS') {
      result = this.text.substring(0, this.text.length - 1);
      if (
        this.parent
        && this.parent.expression.name === 'PNAME_LN'
        || this.parent.expression.name === 'PrefixedName') {
        // If in PrefixedName context, return referenced IRI
        result = this.state.namespaces[result];
      }
    }
    else if (this.expression.name === 'PNAME_LN') {
      const PNAME_NS = this.collect(p => p.expression.name === 'PNAME_NS')[0];
      const remainder = this.text.substring(PNAME_NS.text.length);
      result = PNAME_NS.value() + remainder;
    }
    else if (this.expression.name === 'STRING_LITERAL_SINGLE_QUOTE' || this.expression.name === 'STRING_LITERAL_QUOTE') {
      result = this.text.substring(1, this.text.length - 1);
      result = unescapeNumeric(result);
      result = unescapeString(result);
    }
    else if (this.expression.name === 'STRING_LITERAL_LONG_SINGLE_QUOTE' || this.expression.name === 'STRING_LITERAL_LONG_QUOTE') {
      result = this.text.substring(3, this.text.length - 3);
      result = unescapeNumeric(result);
      result = unescapeString(result);
    }
    else if (this.expression.name === 'LANGTAG') {
      result = this.text.substring(1);
    }
    else if (this.expression.name === 'RDFLiteral') {
      const _String = this.collect(p => p.expression.name === 'String')[0];
      const LANGTAG = this.collect(p => p.expression.name === 'LANGTAG')[0];
      const IRIREF = this.collect(p => p.expression.name === 'IRIREF')[0];
      const PrefixedName = this.collect(p => p.expression.name === 'PrefixedName')[0];
      if (LANGTAG) {
        result = rdf.literal(_String.value(), LANGTAG.value());
      }
      else if (IRIREF) {
        result = rdf.literal(_String.value(), rdf.namedNode(IRIREF.value()));
      }
      else if (PrefixedName) {
        const datatype = PrefixedName.children.map(p => p.value && p.value()).filter(v => v !== undefined).join('');
        result = rdf.literal(_String.value(), rdf.namedNode(datatype));
      }
      else {
        result = rdf.literal(_String.value(), XSD('string'));
      }
    }
    else if (this.expression.name === 'INTEGER') {
      result = rdf.literal(this.text, XSD('integer'));
    }
    else if (this.expression.name === 'DECIMAL') {
      result = rdf.literal(this.text, XSD('decimal'));
    }
    else if (this.expression.name === 'DOUBLE') {
      result = rdf.literal(this.text, XSD('double'));
    }
    else if (this.expression.name === 'BooleanLiteral') {
      result = rdf.literal(this.text, XSD('boolean'));
    }
    else if (this.children.length > 0) {
      const values = this.children.map(p => p.value && p.value()).filter(v => v !== undefined);
      result = values[0]
      if (values.length > 1) {
        result = values.join('');
      }
    }
    return result;
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

    // Emit significant production rules
    if (
      this.satisfied
      && accepted
      && !/\s/.test(char)
    ) {
      if (['base', 'sparqlBase'].includes(this.expression.name)) {
        this.emitBase();
      }
      else if (['prefixID', 'sparqlPrefix'].includes(this.expression.name)) {
        this.emitPrefix();
      }
    }
    if (this.satisfied && !this.accepting) {
      if (this.expression.name === 'subject') {
        this.emitSubject();
      }
      else if (this.expression.name === 'verb') {
        this.emitVerb();
      }
      else if (this.expression.name === 'object') {
        this.emitObject();
      }
    }
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
    const matcher = p => p.expression.terminal !== true || ! p.valid || ! p.satisfied;
    return this.collect(p => p.collect(matcher).length > 0)
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

const unescapeNumeric = function(s) {
  return s
    .replace(/\\u[0-9a-fA-F]{4}/g, h => String.fromCharCode(parseInt(h.substring(2), 16)))
    .replace(/\\U[0-9a-fA-F]{8}/g, h => String.fromCharCode(parseInt(h.substring(2), 16)));
}
const unescapeString = function(s) {
  return s
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\f/g, '\f')
    .replace(/\\"/g, '\"')
    .replace(/\\'/g, "\'")
    .replace(/\\\\/g, '\\');
}
const unescapeReserved = function(s) {
  return s.replace(/\\([~\.\-!$&'()*+,;=/?#@%_])/g, '$1');
}
