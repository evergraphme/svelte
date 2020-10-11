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
    editor.insert(' ');
    expect(assistant.parser.text).toBe(':\n  ');
  });

  test('Complete statement with space', () => {
    const element = document.getElementById('ace');
    const editor = element.editor;
    const assistant = new TurtleAssistant({editor});
    editor.insert(':');
    editor.insert(' ');
    editor.insert(':');
    editor.insert(' ');
    editor.insert(':');
    editor.insert(' ');
    expect(editor.getValue()).toBe(':\n  : : .\n');
    expect(assistant.parser.text).toBe('');
  });
});
