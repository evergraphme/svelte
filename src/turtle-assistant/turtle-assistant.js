import { Changeset, parseNextInput, fromAceDelta } from './changeset';
import { Statement } from './statement';
import { turtle } from '../turtle-parser';
import { assistants } from '.';
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
      this.parser = this.parser.expression.test(this.editor.getValue());
    }
    else {
      this.editor.insert(replacement);
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
    changeset.parseAllInput(assistants);
    if (!changeset.parser.accepting) {
      // console.log('not accepted by parser, undoed');
      this.undo(delta);
      return;
    }
    if (changeset.originalChange !== changeset.change) {
      this.replace(changeset.replacement(), changeset.aceDelta());
      this.statements = this.statements.filter(s => s.endRow < changeset.startRow).concat(changeset.statements);
    }
    this.parser = changeset.parser;
  }
}
