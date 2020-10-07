import { turtle } from '../turtle-parser';
import { indent } from './indent-assist';

export class TurtleAssistant {
  constructor({editor}) {
    this.editor = editor;
    // this._assistedInput = false;
    this.parser = turtle.turtleDoc.test('');
    this.statements = [];

    this.editor.session.on('change', this._change.bind(this));
  }

  undo() {
    console.log(`undo [${this._delta.lines.join('\\n')}]`)
    this._assistedInput = true;
    this.editor.session.undoChanges([this._delta], false);
  }

  replace(replacement) {
    console.log(`replacing [${this._delta.lines[0]}] with [${replacement.replace('\n', '\\n')}]`)
    this._assistedInput = true;
    this.editor.session.undoChanges([this._delta], false);
    this._assistedInput = true;
    this.editor.insert(replacement);
    this.parser = this.parser.expression.test(this.parser.text.slice(0, -1) + replacement);
  }

  _change(delta) {
    this._delta = delta;
    const change = delta.lines.join('\n');
    console.log(delta, this.parser.text.replace('\n', '\\n'), this._assistedInput);
    if (this._assistedInput) {
      // Assisted input, e.g. indentation rules, should pass through
      this._assistedInput = undefined;
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
