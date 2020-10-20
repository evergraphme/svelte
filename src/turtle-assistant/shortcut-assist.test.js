require('ace-custom-element/dist/index.umd.js');
import { TurtleAssistant } from './turtle-assistant';
import * as shortcut from './shortcut-assist';
import { turtle } from '../turtle-parser';
import { Changeset } from './changeset';
import { assistants } from '.';

describe('statement', () => {
  test('Enter to complete statement', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(''),
      input: ':s :p :o\n',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.replacement()).toBe(':s\n  :p :o .\n');
    expect(changeset.parser.text).toBe('');
    expect(changeset.statements.length).toBe(1);
    expect(changeset.statements[0].text).toBe(':s\n  :p :o .');
  });

  test('Space once to add new object', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(''),
      input: ':s :p :o ',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.replacement()).toBe(':s\n  :p\n    :o,\n    ');
    expect(changeset.parser.text).toBe(':s\n  :p\n    :o,\n    ');
    expect(changeset.statements.length).toBe(0);
  });

  test('Space twice to add new predicate', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(''),
      input: ':s :p :o ',
    });
    changeset.parseAllInput(assistants);
    const changeset2 = new Changeset({
      parser: changeset.parser,
      input: ' ',
    });
    changeset2.parseAllInput(assistants);
    expect(changeset2.replacement()).toBe(':s\n  :p :o;\n  ');
    expect(changeset2.parser.text).toBe(':s\n  :p :o;\n  ');
    expect(changeset2.statements.length).toBe(0);
  });

  test('Whitespace to complete prefix/base statement', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(''),
      input: '@prefix : <>\t',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.replacement()).toBe('@prefix : <> .\n');
    expect(changeset.parser.text).toBe('');
    expect(changeset.statements.length).toBe(1);
    expect(changeset.statements[0].text).toBe('@prefix : <> .');
  });

  describe('Shortcuts with editor testing', () => {
    beforeEach(done => {
      const element = document.createElement('ace-editor');
      element.setAttribute('id', 'ace');
      element.addEventListener('ready', () => {
        done();
      });
      document.body.appendChild(element);
    });

    afterEach(() => {
      const element = document.getElementById('ace');
      element.parentNode.removeChild(element);
    })

    test('Backspace to delete end of last statement', () => {
      const element = document.getElementById('ace');
      const editor = element.editor;
      const assistant = new TurtleAssistant({editor});
      editor.insert(':s\n  :p :o .\n');
      editor.session.remove({start: {row: 1, column: 9}, end: {row: 2, column: 0}});
      expect(editor.getValue()).toBe(':s\n  :p :o');
      expect(assistant.parser.text).toBe(':s\n  :p :o');
      expect(assistant.statements.length).toBe(0);
    });

    test('Backspace to move back from new predicate position', () => {
      const element = document.getElementById('ace');
      const editor = element.editor;
      const assistant = new TurtleAssistant({editor});
      editor.insert(':s\n  :p :o;\n  ');
      editor.session.remove({start: {row: 2, column: 1}, end: {row: 2, column: 2}});
      expect(editor.getValue()).toBe(':s\n  :p\n    :o,\n    ');
      expect(assistant.parser.text).toBe(':s\n  :p\n    :o,\n    ');
      expect(assistant.statements.length).toBe(0);
    });

    test('Backspace to move back from new object position', () => {
      const element = document.getElementById('ace');
      const editor = element.editor;
      const assistant = new TurtleAssistant({editor});
      editor.insert(':s :p :o '); // Trigger shortcut to move to new object position
      expect(editor.getValue()).toBe(':s\n  :p\n    :o,\n    ');
      editor.session.remove({start: {row: 3, column: 3}, end: {row: 3, column: 4}});
      expect(editor.getValue()).toBe(':s\n  :p :o');
      expect(assistant.parser.text).toBe(':s\n  :p :o');
      expect(assistant.statements.length).toBe(0);
    });

    test('Backspace to delete end of last directive statement', () => {
      const element = document.getElementById('ace');
      const editor = element.editor;
      const assistant = new TurtleAssistant({editor});
      editor.insert('@base <> .\n');
      editor.session.remove({start: {row: 0, column: 10}, end: {row: 1, column: 0}});
      expect(editor.getValue()).toBe('@base <>');
      expect(assistant.parser.text).toBe('@base <>');
      expect(assistant.statements.length).toBe(0);
    });
  })
});
