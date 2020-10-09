import { shortcut } from './shortcut-assist';
import { turtle } from '../turtle-parser';

describe('statement', () => {
  test('finish statement with space', () => {
    let parser = turtle.turtleDoc.test(':me\n  :do :good');
    const accepted = parser.push(' ');
    const actionableMock = {replace: jest.fn(x => parser = parser.expression.test(':me\n  :do :good .\n'))};

    shortcut(parser, actionableMock);
    expect(actionableMock.replace.mock.calls.length).toBe(1);
    expect(actionableMock.replace.mock.calls[0][0]).toBe(' .\n');
    expect(parser.text).toBe(':me\n  :do :good .\n');
  });
});
