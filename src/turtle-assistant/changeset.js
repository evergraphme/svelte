import { Statement } from './statement';

/* During parsing/assistance, a changeset holds contextual changes
* so that all of them can be applied to the editor as a single atomic change.
* When making a change to the middle of the document, the remainder of the
* document is always re-parsed as indentation/semantics might have changed.
*/
export class Changeset {
  constructor({ parser, wanted, input, startRow = 0 }) {
    // String of the remainder of the document to be parsed
    // Contains this.parser.text (already parsed for current statement)
    // Does not contain already parsed statements
    this.change = input ? parser.text + input : wanted;
    this.originalChange = this.change;
    // this.parser.text keeps track of how far we have parsed
    // If the change is in the middle of the text, reparse from the beginning
    this.parser = parser.expression.test(this.change.indexOf(parser.text) === 0 ? parser.text : '');
    // Already parsed statements
    this.statements = [];
    // Row in the document this change starts on
    this.startRow = startRow;
  }

  // Next character to parse
  nextChar() {
    return this.change[this.parser.text.length];
  }

  // Last character parsed
  lastChar() {
    return this.change[this.parser.text.length - 1];
  }

  currentRow() {
    return this.statements.map(s => s.rowCount).reduce((acc, cur) => {
      return acc + cur;
    }, 0);
  }

  // Helper function while parsing
  // Replacement pushed to parser without assistance rules
  replaceChar(replacement) {
    // console.log(`replaceChar [${replacement}]`);
    this.change =
      this.change.substring(0, this.parser.text.length)
      + replacement
      + this.change.substring(this.parser.text.length + 1);
    this.parser.push(replacement);
  }

  // Helper function while parsing
  // Replacement pushed to parser without assistance rules
  replaceFromStart(replacement) {
    // console.log(`replaceFromStart [${replacement}]`);
    this.change =
      replacement
      + this.change.substring(this.parser.text.length + 1);
    // Restart parsing from beginning of statement
    this.parser = this.parser.expression.test(replacement);
  }

  // Helper function while parsing
  // Replacement pushed to parser without assistance rules
  add(text) {
    // console.log(`add [${text}]`);
    this.change = this.change + text;
    this.parser.push(this.nextChar() + text);
  }

  // Helper function while parsing
  completeStatement() {
    this.statements.push(new Statement({
      startRow: this.startRow + this.currentRow(),
      text: this.parser.text.trim(),
    }));
    // Remove completed statement from change/parser
    this.change = this.change.substring(this.parser.text.length);
    // console.log(`new statement [${this.parser.text.replace(/\n/g, '\\n')}], remaining change [${this.change.replace(/\n/g, '\\n')}]`);
    this.parser = this.parser.expression.test('');
  }
}

// Execute rules and parser on the next character input
export const parseNextInput = function(changeset, rules) {
  let index = 0;
  const current = changeset.parser.text + changeset.nextChar();
  const next = () => {
    // If a rule has changed the input, no further processing
    if (current === changeset.parser.text + changeset.nextChar()) {
      if (rules.length > index) {
        index = index + 1;
        rules[index-1](changeset, next);
      }
      else {
        const accepted = changeset.parser.push(changeset.nextChar());
      }
    }
    // Parse a single statement at a time
    if (changeset.parser.text.length > 0 && changeset.parser.satisfied) {
      // push statement to stack
      changeset.completeStatement();
    }
  }
  next();
}

export const fromAceDelta = function(statements, parser, delta) {
  let changeset;

  // Retrieve all statments that are affected by the change
  let statementStart = statements.length;
  let startRow = statements.length > 0
    ? statements[statements.length - 1].endRow + 1
    : 0;
  for (; delta.start.row < startRow; statementStart = statementStart - 1) {
    if (statements[statementStart-1].startRow <= delta.start.row) {
      startRow = statements[statementStart-1].startRow
    }
  }
  const affectedStatements = statements.slice(statementStart);
  const lines = affectedStatements.map(s => s.text.split('\n')).concat(parser.text.split('\n')).flat();
  const now = lines.join('\n');
  const deltaStartRow = delta.start.row - startRow;
  const deltaEndRow = delta.end.row - startRow;
  const startIndex = lines.slice(0, deltaStartRow).map(l => l.length).reduce((a,c) => {return a+c;}, 0) + deltaStartRow + delta.start.column;
  const endIndex = lines.slice(0, deltaEndRow).map(l => l.length).reduce((a,c) => {return a+c;}, 0) + deltaEndRow + delta.end.column;
  let change;
  if (delta.action === 'insert') {
    change = now.substring(0, startIndex) + delta.lines.join('\n') + now.substring(startIndex);
  }
  else if (delta.action === 'remove') {
    change = now.substring(0, startIndex) + now.substring(endIndex);
  }

  changeset = new Changeset({
    parser: parser,
    wanted: change,
    startRow: startRow,
  });

  return changeset;
}
