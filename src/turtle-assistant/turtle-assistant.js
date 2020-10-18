import { Changeset, parseNextInput, fromAceDelta } from './changeset';
import { Statement } from './statement';
import { turtle } from '../turtle-parser';
import { all as indentationRules } from './indent-assist';
import { all as shortcutRules } from './shortcut-assist';
const ace = require('ace-custom-element/dist/index.umd.js');

const assistants = shortcutRules.concat(indentationRules);

/*
  Provides structured assistance when editing turtle,
  modifying the text as you type.

  State:
  * Editor - link to the Ace editor
    (position => {row, column} - zero-based)
    (range => {start:position, end:position})
    * clearSelection()
    * focus()
    * getCursorPosition() => position
    * getValue() => all text
    * insert(text)
    * moveCursorTo(row, column)
    (session)
      * getLength() => no of rows
      * getLine(row) => line text
      * getLines(firstRow, lastRow)
      * insert({row, column}, text)
      * remove(range)
      * replace(range, text)
      * undoChanges(deltas, dontSelect)
  * Parser - link to turtle parser of the _current_ statement
  * Statements - list of finished statements with reference to text positions
*/
export class TurtleAssistant {
  constructor({editor}) {
    this.editor = editor;
    // this._assistedInput = false;
    this.parser = turtle.turtleDoc.test('');
    this.statements = [];

    this.editor.session.on('change', this._change.bind(this));
    if (window) {
      window.assistant = this;
      window.Range = Range;
    }
  }

  undo() {
    // console.log(`undo [${this._delta.lines.join('\\n')}]`)
    this._assistedInput = true;
    this.editor.session.undoChanges([this._delta], false);
    this._assistedInput = false;
  }

  // Since we want to do all assisted changes in one single edit
  // bundle them all into one text + optional range of text to be replaced
  // Range row is relative to current statement, not the whole document
  replace(replacement, aceRange) {
    // console.log(`replacing with [${replacement.replace(/\n/g, '\\n')}]`, aceRange);
    this._assistedInput = true;
    this.editor.session.undoChanges([this._delta], false);
    if (aceRange) {
      this.editor.session.replace(aceRange, replacement);
      // Todo: Update parser and possibly statement list to reflect replacement
      // Consider multiple changes by assistants, e.g. prefix-addition + indentation
      // Consider changes that cross multiple statements, e.g. goes outside parser text buffer
      this.parser = this.parser.expression.test(this.editor.getValue());
    }
    else {
      this.editor.insert(replacement);
      // Trusts that delta is a single character input
      // Todo: use this._delta to cope with multiple characters
      // Consider changes that cross multiple statements, e.g. goes outside parser text buffer
      this.parser = this.parser.expression.test(this.editor.getValue());
    }
    this._assistedInput = false;
  }

  _change(delta) {
    this._delta = delta;
    // console.log(delta, `[${this.parser.text.replace(/\n/g, '\\n')}]`, this._assistedInput, this.statements.length);
    if (this._assistedInput) {
      // Assisted input, e.g. indentation rules, should pass through
      return;
    }

    const changeset = fromAceDelta(this.statements, this.parser, delta);

    while(changeset.parser.accepting && changeset.nextChar()) {
      const nextChar = changeset.nextChar();
      parseNextInput(changeset, assistants);
      // console.log(`processed [${nextChar}] => [${changeset.parser.text.replace(/\n/g, '\\n')}]`);
    }
    if (!changeset.parser.accepting) {
      // console.log('not accepted by parser, undoed');
      this.undo(delta);
      return;
    }
    if (changeset.originalChange !== changeset.change) {
      const newText = [...changeset.statements.map(s => s.text), changeset.change].join('\n');
      // Replace text in editor
      const currentStatementRow = (this.statements.length > 0 ? this.statements[this.statements.length - 1].endRow + 1 : 0);
      const endColumn = this.parser.text.lastIndexOf('\n') >= 0
        ? this.parser.text.length - this.parser.text.lastIndexOf('\n')
        : this.parser.text.length;
      const endRow = currentStatementRow + this.parser.text.split('\n').length - 1;
      // console.log(`changed [${changeset.originalChange.replace(/\n/g, '\\n')}] to [${newText.replace(/\n/g, '\\n')}]\n`
      //   + `parser:[${this.parser.text.replace(/\n/g, '\\n')}] length=${this.parser.text.length} lastnewline=${this.parser.text.lastIndexOf('\n')}`
      //   + ` statementcount:${this.statements.length} currentStatementRow:${currentStatementRow} endRow:${endRow} endColumn:${endColumn}`);
      this.replace(
        newText,
        {
          start: {
            row: changeset.startRow,
            column: 0,
          },
          end: {
            // Replace to the end
            row: endRow,
            column: endColumn,
          },
        }
      );
      this.statements = this.statements.filter(s => s.endRow < changeset.startRow).concat(changeset.statements);
    }
    this.parser = changeset.parser;
  }
}
