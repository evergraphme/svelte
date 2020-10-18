require('ace-custom-element/dist/index.umd.js');
import { TurtleAssistant } from './turtle-assistant';

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

describe('TurtleAssistant', () => {
  test('Indent after subject', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':');
    editor.insert(' '); // Indent after subject
    expect(assistant.parser.text).toBe(':\n  ');
  });

  test('Semi-colon after comma', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':'); // Subject
    editor.insert(' '); // Indent after subject
    editor.insert(':'); // Predicate
    editor.insert(' ');
    editor.insert(':'); // Object
    editor.insert(','); // Indent after comma
    editor.insert(':'); // Object
    editor.insert(';'); // Indent after semi-colon
    expect(editor.getValue()).toBe(':\n  :\n    :,\n    :;\n  ');
    expect(assistant.parser.text).toBe(':\n  :\n    :,\n    :;\n  ');
  });

  test('Paste statement', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':i :can :paste .');
    expect(editor.getValue()).toBe(':i\n  :can :paste .\n');
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(1);
    expect(assistant.statements[0].text).toBe(':i\n  :can :paste .');
  });

  test('Accept and clean up whitespace', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(' :i\n    :can\t:paste \n .');
    expect(editor.getValue()).toBe(':i\n  :can :paste .\n');
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(1);
    expect(assistant.statements[0].text).toBe(':i\n  :can :paste .');
  });

  test('Split statement in the middle', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':i\n  :can :paste .');
    editor.session.insert({row:1,column:8}, 'split  . :you :may :');
    expect(editor.getValue()).toBe(':i\n  :can :split .\n:you\n  :may :paste .\n');
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(2);
    expect(assistant.statements[0].text).toBe(':i\n  :can :split .');
    expect(assistant.statements[1].text).toBe(':you\n  :may :paste .');
  });

  test('Undo invalid paste', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':i\n  :can :paste .');
    editor.session.insert({row:0,column:2}, ' :toomuch');
    expect(editor.getValue()).toBe(':i\n  :can :paste .\n');
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(1);
    expect(assistant.statements[0].text).toBe(':i\n  :can :paste .');
  });

  test('Type in the middle of the current statement', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':i\n  :can :paste');
    editor.session.insert({row:1,column:2}, 'x');
    expect(editor.getValue()).toBe(':i\n  x:can :paste');
    expect(assistant.parser.text).toBe(':i\n  x:can :paste');
    expect(assistant.statements.length).toBe(0);
  });

  test('no extra whitespace for object lists', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':s\n  :p\n    :o1,\n    :o2 .');
    expect(editor.getValue()).toBe(':s\n  :p\n    :o1,\n    :o2 .\n');
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(1);
    expect(assistant.statements[0].text).toBe(':s\n  :p\n    :o1,\n    :o2 .');
  });

  test('Enter to complete statement', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':s :p :o\n');
    expect(editor.getValue()).toBe(':s\n  :p :o .\n');
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(1);
    expect(assistant.statements[0].text).toBe(':s\n  :p :o .');
  });

  test('Space once to add new object', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':s :p :o ');
    expect(editor.getValue()).toBe(':s\n  :p\n    :o,\n    ');
    expect(assistant.parser.text).toBe(':s\n  :p\n    :o,\n    ');
    expect(assistant.statements.length).toBe(0);
  });

  test('Space twice to add new predicate', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':s :p :o ');
    editor.insert(' ');
    expect(editor.getValue()).toBe(':s\n  :p :o;\n  ');
    expect(assistant.parser.text).toBe(':s\n  :p :o;\n  ');
    expect(assistant.statements.length).toBe(0);
  });

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
});
