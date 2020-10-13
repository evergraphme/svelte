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
});
