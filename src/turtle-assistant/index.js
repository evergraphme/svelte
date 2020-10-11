import { Changeset, parseNextInput } from './changeset';
import { Statement } from './statement';
import { turtle } from '../turtle-parser';
import { all as indentationRules } from './indent-assist';
import { all as shortcutRules } from './shortcut-assist';
const ace = require('ace-custom-element/dist/index.umd.js');

const assistants = indentationRules.concat(shortcutRules);

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
    console.log(`undo [${this._delta.lines.join('\\n')}]`)
    this._assistedInput = true;
    this.editor.session.undoChanges([this._delta], false);
    this._assistedInput = false;
  }

  // Since we want to do all assisted changes in one single edit
  // bundle them all into one text + optional range of text to be replaced
  // Range row is relative to current statement, not the whole document
  replace(replacement, aceRange) {
    console.log(`replacing ... with [${replacement.replaceAll('\n', '\\n')}]`)
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

  currentStatementStartRow() {
    return this.statements.map(s => s.rowCount).reduce((acc, cur) => {
      return acc + cur;
    }, 0);
  }

  _change(delta) {
    this._delta = delta;
    const change = delta.lines.join('\n');
    let changeset;
    // console.log(delta, this.parser.text.replaceAll('\n', '\\n'), this._assistedInput);
    if (this._assistedInput) {
      // Assisted input, e.g. indentation rules, should pass through
      return;
    }
    if (change.length !== 1) {
      // We only handle single-character input for now due to parser limitation
      console.log('non-single-character-input undoed');
      this.undo(delta);
      // Reset parser, it is broken after not accepting a char
      this.parser = this.parser.expression.test(this.parser.text);
      return;
    }
    if (delta.action === 'insert') {
      changeset = new Changeset({
        parser: this.parser,
        input: change,
        startRow: this.currentStatementStartRow(),
      });
    }
    else if (delta.action === 'remove') {
      if (this.parser.text.length > 0) {
        // Reset parser, it does not support stepping backwards
        // this.parser = this.parser.expression.test(this.parser.text.slice(0, -1));
        changeset = new Changeset({
          parser: this.parser.expression.test(this.parser.text.slice(0, -1)),
          wanted: this.parser.text.slice(0, -1),
          startRow: this.currentStatementStartRow(),
        });
      }
      else {
        // Pop the previous statement
        console.log('todo: cannot pass statement lines just yet');
        this.undo(delta);
        return;
        // this.parser = this.parser.expression.test(this.statements.pop());
      }
    }

    while(changeset.parser.accepting && changeset.nextChar()) {
      parseNextInput(changeset, assistants);
    }
    if (!changeset.parser.accepting) {
      console.log('not accepted by parser, undoed');
      this.undo(delta);
      return;
    }
    if (changeset.originalChange !== changeset.change) {
      const newText = [...changeset.statements.map(s => s.text), changeset.change].join('\n');
      console.log(`changed [${changeset.originalChange.replaceAll('\n', '\\n')}] to [${newText.replaceAll('\n', '\\n')}]`)
      // Replace text in editor
      this.replace(
        newText,
        {
          start: {
            row: changeset.startRow,
            column: 0,
          },
          end: {
            row: delta.start.row,
            column: delta.start.column,
          },
        }
      );
      // Todo: Might need to remove statements that were part of the changeset
      if (changeset.statements.length > 0) {
        this.statements = this.statements.concat(changeset.statements);
      }
    }
    this.parser = changeset.parser;
    // editor.insert("Something cool");
    // editor.selection.getCursor();
    // editor.session.replace(new ace.Range(0, 0, 1, 1), "new text");
    // editor.session.remove(new ace.Range(0, 0, 1, 1));
    // editor.session.insert({row:1,column:2}, "new text");
    // editor.undo();
  }
}
