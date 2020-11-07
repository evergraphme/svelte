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

  test('prefixID statement', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert('@prefix : <> .');
    expect(editor.getValue()).toBe('@prefix : <> .\n');
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(1);
    expect(assistant.statements[0].text).toBe('@prefix : <> .');
  });

  test('sparqlPrefix statement', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert('PREFIX : <>');
    expect(editor.getValue()).toBe('PREFIX : <>\n');
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(1);
    expect(assistant.statements[0].text).toBe('PREFIX : <>');
  });

  test('base statement', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert('@base <> .');
    expect(editor.getValue()).toBe('@base <> .\n');
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(1);
    expect(assistant.statements[0].text).toBe('@base <> .');
  });

  test('sparqlBase statement', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert('BASE <>');
    expect(editor.getValue()).toBe('BASE <>\n');
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(1);
    expect(assistant.statements[0].text).toBe('BASE <>');
  });

  test('deleting a full statement', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(': : : .\n');
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(1);
    editor.session.remove({start: {row: 0, column: 0}, end: {row: 2, column: 0}});
    expect(assistant.parser.text).toBe('');
    expect(assistant.statements.length).toBe(0);
  });

  test('cursor should remain in place when typing invalid input', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':\n  : : .\n:');
    editor.moveCursorTo(1, 0);
    editor.insert('!');
    expect(editor.getValue()).toBe(':\n  : : .\n:');
    expect(editor.getCursorPosition()).toEqual({row: 1, column: 0});
    editor.moveCursorTo(2, 0);
    editor.insert('!');
    expect(editor.getValue()).toBe(':\n  : : .\n:');
    expect(editor.getCursorPosition()).toEqual({row: 2, column: 0});
  });

  test('cursor should remain in place when typing in previous statements', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':\n  : : .\n:');
    editor.moveCursorTo(0, 1);
    editor.insert('a');
    expect(editor.getValue()).toBe(':a\n  : : .\n:');
    expect(editor.getCursorPosition()).toEqual({row: 0, column: 2});
  });
});
