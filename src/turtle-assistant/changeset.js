import { Statement } from './statement';

/* During parsing/assistance, a changeset holds contextual changes
* so that all of them can be applied to the editor as a single atomic change.
* When making a change to the middle of the document, the remainder of the
* document is always re-parsed as indentation/semantics might have changed.
*/
export class Changeset {
  constructor({ parser, original, wanted, input, startRow = 0, inserting = true, cursor }) {
    // Already parsed statements
    this.statements = [];
    // Quads emitted from current statement
    this.currentQuads = [];
    // Original text before change
    this.original = original ? original : parser.text;
    // Row in the document this change starts on
    this.startRow = startRow;
    // Row in the document this change ended on (before the changes are applied)
    this.endRow = startRow + this.original.split('\n').length - 1;
    // Column in the document this change ended on (before the changes are applied)
    this.endColumn = this.original.lastIndexOf('\n') >= 0
      ? this.original.length - this.original.lastIndexOf('\n')
      : this.original.length;
    // String of the remainder of the document to be parsed
    // Contains this.parser.text (already parsed for current statement)
    // Does not contain already parsed statements
    this.change = input ? parser.text + input : wanted;
    this.originalChange = this.change;
    // Inserting or removing?
    this.inserting = inserting;
    // this.parser.text keeps track of how far we have parsed
    // If the change is in the middle of the text, reparse from the beginning
    this.parser = parser.clone({
      text: this.change.indexOf(parser.text) === 0 ? parser.text : '',
      callback: (quad) => { this.currentQuads.push(quad); },
    });
    this.cursor = cursor ? cursor : { row: 0, column: 0 };
    const lengthOfChange = this.change.length - this.original.length;
    this.charactersAfterCursor = this.change
      .split('\n')
      .slice(this.cursor.row - this.startRow)
      .join('\n')
      .length - this.cursor.column - (this.inserting ? lengthOfChange : 0);
    console.log(`aftercursor:${this.charactersAfterCursor} changed:${this.change.length-this.original.length} (${this.cursor.row}, ${this.cursor.column}) [${this.change.replace(/\n/g, '\\n')}]`);
  }

  // Next character to parse
  nextChar() {
    return this.change[this.parser.text.length];
  }

  // Last character parsed
  lastChar() {
    return this.change[this.parser.text.length - 1];
  }

  // Check if upcoming character matches pattern
  upcoming(pattern) {
    const match = this.change.substring(this.parser.text.length).match(pattern);
    return match && match.index === 0;
  }

  // Replacement text to execute changeset, including parsed statements
  replacement() {
    return [...this.statements.map(s => s.text), this.change].join('\n');
  }

  // Helper function while parsing
  // Replacement pushed to parser without assistance rules
  replaceChar(replacement, deleteRemainder = false) {
    // console.log(`replaceChar [${replacement}]`);
    // this.removeFromCursor(this.nextChar());
    // this.addToCursor(this.nextChar(), replacement);
    this.change =
      this.change.substring(0, this.parser.text.length)
      + replacement
      + (deleteRemainder ? '' : this.change.substring(this.parser.text.length + 1));
    this.parser.push(replacement);
  }

  // Helper function while parsing
  // Replacement pushed to parser without assistance rules
  replaceFromStart(replacement, deleteRemainder = false) {
    // console.log(`replaceFromStart [${this.change.substring(0, this.parser.text.length + 1).replace(/\n/g, '\\n')}]=>[${replacement.replace(/\n/g, '\\n')}]`);
    // this.addToCursor(this.parser.text, replacement);
    this.change =
      replacement
      + (deleteRemainder ? '' : this.change.substring(this.parser.text.length + 1));
    // Restart parsing from beginning of statement
    if (this.parser.text !== '' && this.parser.text.indexOf(replacement) !== 0) {
      this.currentQuads = [];
      this.parser = this.parser.reset(replacement);
    }
  }

  // Helper function while parsing
  // Replacement pushed to parser without assistance rules
  add(text) {
    // console.log(`add [${text}]`);
    // this.addToCursor('', text);
    this.change = this.change + text;
    this.parser.push(this.nextChar() + text);
  }

  parseAllInput(assistants) {
    while(this.parser.accepting && this.nextChar()) {
      // const next = this.nextChar();
      parseNextInput(this, assistants);
      // console.log(`parsed [${next.replace(/\n/g, '\\n')}] => [${this.parser.text.replace(/\n/g, '\\n')}] accepting=${this.parser.accepting}`);
    }
  }

  // Helper function while parsing
  completeStatement() {
    // console.log(`completeStatement [${this.parser.text.trim().replace(/\n/g, '\\n')}]`)
    this.statements.push(new Statement({
      startRow: this.statements.length > 0 ? this.statements[this.statements.length - 1].endRow + 1 : this.startRow,
      text: this.parser.text.trim(),
      quads: this.currentQuads,
    }));
    // Remove completed statement from change/parser
    this.change = this.change.substring(this.parser.text.length);
    // console.log(`new statement [${this.parser.text.replace(/\n/g, '\\n')}], remaining change [${this.change.replace(/\n/g, '\\n')}]`);
    this.parser = this.parser.reset('');
    this.currentQuads = [];
  }

  // Return affected range in Ace editor format
  aceDelta() {
    return {
      start: {
        row: this.startRow,
        column: 0,
      },
      end: {
        // Replace to the end
        row: this.endRow,
        column: this.endColumn,
      },
    }
  }

  addToCursor(oldText, newText) {
    const parserLines = this.parser.text.split('\n');
    const currentRow = (this.statements.length > 0 ? this.statements[this.statements.length - 1].endRow + 1 : this.startRow) + parserLines.length - 1;
    const currentColumn = parserLines[parserLines.length - 1].length;
    // Check if cursor is after the current parser position
    // console.log(`cursor: ${this.cursor.row}, ${this.cursor.column} - current: ${currentRow}, ${currentColumn}`);
    if (currentRow < this.cursor.row || currentRow === this.cursor.row && currentColumn <= this.cursor.column) {
      const old = Object.assign({}, this.cursor);
      const newLines = newText.split('\n');
      const oldLines = oldText.split('\n');
      this.cursor = {
        row: this.cursor.row + newLines.length - 1 - oldLines.length + 1,
        column: newLines.length > 1 ? newLines[newLines.length-1].length : (oldLines.length > 1 ? 0 : this.cursor.column - oldLines[0].length + newLines[0].length),
      };
      // console.log(`addToCursor ${old.row}, ${old.column} - ${this.cursor.row}, ${this.cursor.column}`);
    }
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
  if (changeset.charactersAfterCursor === changeset.change.length - changeset.parser.text.length) {
    // We are now at cursor position, save new cursor position based on already parsed text
    const parserLines = changeset.parser.text.split('\n');
    changeset.cursor = {
      row: (changeset.statements.length > 0 ? changeset.statements[changeset.statements.length - 1].endRow + 1 : changeset.startRow) + parserLines.length - 1,
      column: parserLines[parserLines.length - 1].length,
    };
    console.log(`cursor after (${changeset.cursor.row}, ${changeset.cursor.column})! [${changeset.parser.text.replace(/\n/g, '\\n')}] [${changeset.change.replace(/\n/g, '\\n')}]`);
  }
}

export const fromAceDelta = function(statements, parser, delta, cursor) {
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
    // console.log(`remove change=[${change.replace(/\n/g, '\\n')}] startRow=${startRow}`);
  }

  changeset = new Changeset({
    parser,
    original: now,
    wanted: change,
    startRow: startRow,
    inserting: delta.action === 'insert',
    cursor,
  });

  return changeset;
}
