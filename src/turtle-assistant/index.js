import { turtle } from '../turtle-parser';
import { indent } from './indent-assist';
const ace = require('ace-custom-element/dist/index.umd.js');

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
    console.log(`replacing [${this._delta.lines[0]}] with [${replacement.replaceAll('\n', '\\n')}]`)
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
    const change = delta.lines.join('\n');
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
      const accepted = this.parser.push(change);
      if (!accepted) {
        // Undo input not accepted by parser
        console.log('not accepted by parser, undoed');
        this.undo(delta);
        // Reset parser, it is broken after not accepting a char
        this.parser = this.parser.expression.test(this.parser.text);
        return;
      }
      indent(this.parser, this);
      // Parse a single statement at a time
      if (this.parser.satisfied) {
        // push statement to stack
        // remove trailing slash that we trust indentation to have added
        this.statements.push(this.parser.text.slice(0, -1));
        this.parser = this.parser.expression.test('');
      }
    }
    else if (delta.action === 'remove') {
      if (this.parser.text.length > 0) {
        // Reset parser, it does not support stepping backwards
        this.parser = this.parser.expression.test(this.parser.text.slice(0, -1));
      }
      else {
        // Pop the previous statement
        this.parser = this.parser.expression.test(this.statements.pop());
      }
    }
    // editor.insert("Something cool");
    // editor.selection.getCursor();
    // editor.session.replace(new ace.Range(0, 0, 1, 1), "new text");
    // editor.session.remove(new ace.Range(0, 0, 1, 1));
    // editor.session.insert({row:1,column:2}, "new text");
    // editor.undo();
  }
}
