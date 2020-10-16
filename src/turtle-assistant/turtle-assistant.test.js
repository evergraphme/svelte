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

  test('Complete statement with space', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':'); // Subject
    editor.insert(' '); // Indent after subject
    editor.insert(':'); // Predicate
    editor.insert(' ');
    editor.insert(':'); // Object
    editor.insert(' '); // Complete statement with space
    expect(editor.getValue()).toBe(':\n  : : .\n');
    expect(assistant.parser.text).toBe('');
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
});
