import { Changeset, parseNextInput, fromAceDelta } from './changeset';
import { Statement } from './statement';
import { turtle } from '../turtle-parser';
import { assistants } from '.';
const ace = require('ace-custom-element/dist/index.umd.js');
const rdf = require("rdf-ext");

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
  constructor({editor, changeHandler}) {
    this.editor = editor;
    this.changeHandler = changeHandler;
    // this._assistedInput = false;
    this.parser = turtle.turtleDoc.test('');
    this.statements = [];
    this.currentQuads = [];

    this.editor.session.on('change', this._change.bind(this));
    window.assistant = this;
  }

  // Return all current quads wrapped in a dataset
  dataset() {
    return rdf.dataset(
      this
      .statements
      .map(s => s.quads)
      .concat(this.currentQuads)
      .flat());
  }

  undo() {
    // console.log(`undo [${this._delta.lines.join('\\n')}]`)
    this._assistedInput = true;
    const originalCursor = this.editor.getCursorPosition();
    this.editor.session.undoChanges([this._delta], false);
    console.log(`undo (${originalCursor.row}, ${originalCursor.column}) => (${this.editor.getCursorPosition().row}, ${this.editor.getCursorPosition().column})`)
    this._assistedInput = false;
  }

  // Since we want to do all assisted changes in one single edit
  // bundle them all into one text + optional range of text to be replaced
  // Range row is relative to current statement, not the whole document
  replace(replacement, aceRange) {
    // console.log(`replacing with [${replacement.replace(/\n/g, '\\n')}]`, aceRange);
    this._assistedInput = true;
    const originalCursor = this.editor.getCursorPosition();
    this.editor.session.undoChanges([this._delta], false);
    if (aceRange) {
      this.editor.session.replace(aceRange, replacement);
      // Not sure why the below was needed? Safeguard? Messes a bit with logging/notifications
      // this.parser = this.parser.reset(this.editor.getValue());
    }
    else {
      this.editor.insert(replacement);
      // Not sure why the below was needed? Safeguard? Messes a bit with logging/notifications
      // this.parser = this.parser.reset(this.editor.getValue());
    }
    console.log(`replace (${originalCursor.row}, ${originalCursor.column}) => (${this.editor.getCursorPosition().row}, ${this.editor.getCursorPosition().column})`)
    this._assistedInput = false;
  }

  _change(delta) {
    this._delta = delta;
    console.log(delta, `[${this.parser.text.replace(/\n/g, '\\n')}]`, this._assistedInput, this.statements.length);
    if (this._assistedInput) {
      // Assisted input, e.g. indentation rules, should pass through
      return;
    }

    // Original cursor = before delta has been applied
    const originalCursor = this.editor.getCursorPosition();
    console.log(`originalCursor: (${originalCursor.row}, ${originalCursor.column})`);
    const changeset = fromAceDelta(this.statements, this.parser, delta, originalCursor);
    changeset.parseAllInput(assistants);
    if (!changeset.parser.accepting) {
      // console.log('not accepted by parser, undoed', changeset.parser.toString());
      this.undo(delta);
      return;
    }
    if (changeset.originalChange !== changeset.change) {
      this.replace(changeset.replacement(), changeset.aceDelta());
    }
    const replacedQuads = this.statements.filter(s => s.startRow >= changeset.startRow).map(s => s.quads).concat(this.currentQuads).flat();
    const changeQuads = changeset.statements.map(s => s.quads).concat(changeset.currentQuads).flat();
    const removedQuads = replacedQuads.filter(q1 => !changeQuads.some(q2 => q1.equals(q2)));
    const newQuads = changeQuads.filter(q1 => !replacedQuads.some(q2 => q1.equals(q2)));
    this.statements = this.statements.filter(s => s.endRow < changeset.startRow).concat(changeset.statements);
    this.currentQuads = changeset.currentQuads;
    this.parser = changeset.parser;
    if (this.changeHandler && (newQuads.length > 0 || removedQuads.length > 0)) {
      this.changeHandler({
        added: newQuads,
        removed: removedQuads,
      });
    }
    console.log(`(${originalCursor.row}, ${originalCursor.column}) => (${this.editor.getCursorPosition().row}, ${this.editor.getCursorPosition().column}) => (${changeset.cursor.row}, ${changeset.cursor.column})`);
    // this.editor.moveCursorTo(changeset.cursor.row, changeset.cursor.column);
    // this.editor.moveCursorTo(originalCursor.row, originalCursor.column);
    const x = this.editor;
    setTimeout(() => x.moveCursorTo(changeset.cursor.row, changeset.cursor.column));
    setTimeout(() => console.log(`now what (${x.getCursorPosition().row}, ${x.getCursorPosition().column})`), 500);
  }
}
