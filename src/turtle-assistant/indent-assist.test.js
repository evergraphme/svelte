import { indent } from './indent-assist';
import { turtle } from '../turtle-parser';

describe('statement', () => {
  test('indent after subject', () => {
    const parser = turtle.turtleDoc.test(':me');
    const accepted = parser.push(' ');
    const actionableMock = {replace: jest.fn()};

    indent(parser, actionableMock);
    expect(actionableMock.replace.mock.calls.length).toBe(1);
    expect(actionableMock.replace.mock.calls[0][0]).toBe('\n  ');
  });

  test('indent after dot/triples done', () => {
    const parser = turtle.turtleDoc.test(':me\n  :like :apples ');
    const accepted = parser.push('.');
    const actionableMock = {replace: jest.fn()};

    indent(parser, actionableMock);
    expect(actionableMock.replace.mock.calls.length).toBe(1);
    expect(actionableMock.replace.mock.calls[0][0]).toBe('.\n');
  });

  test('indent after semicolon/new predicate', () => {
    const parser = turtle.turtleDoc.test(':me\n  :like :apples ');
    const accepted = parser.push(';');
    const actionableMock = {replace: jest.fn()};

    indent(parser, actionableMock);
    expect(actionableMock.replace.mock.calls.length).toBe(1);
    expect(actionableMock.replace.mock.calls[0][0]).toBe(';\n  ');
  });

  test('indent after comma/new object', () => {
    const parser = turtle.turtleDoc.test(':me\n  :like :apples');
    const accepted = parser.push(',');
    const actionableMock = {replace: jest.fn()};

    indent(parser, actionableMock);
    expect(actionableMock.replace.mock.calls.length).toBe(1);
    expect(actionableMock.replace.mock.calls[0][0]).toBe('\n    :apples,\n    ');
    // Should replace " :apples"
    expect(actionableMock.replace.mock.calls[0][1]).toEqual({
      start: {
        row: 1,
        column: 7,
      },
      end: {
        row: 1,
        column: 15,
      }
    });
  });

  test('indent after comma/yet another object', () => {
    const parser = turtle.turtleDoc.test(':me\n  :like\n    :apples,\n    :oranges');
    const accepted = parser.push(',');
    const actionableMock = {replace: jest.fn()};

    indent(parser, actionableMock);
    expect(actionableMock.replace.mock.calls.length).toBe(1);
    expect(actionableMock.replace.mock.calls[0][0]).toBe(',\n    ');
  });

  test('indent after comma/new object, even after a semi-colon', () => {
    const parser = turtle.turtleDoc.test(':me\n  :like :apples;\n  :dislike :orange;\n  :favor :bananas');
    const accepted = parser.push(',');
    const actionableMock = {replace: jest.fn()};

    indent(parser, actionableMock);
    expect(actionableMock.replace.mock.calls.length).toBe(1);
    expect(actionableMock.replace.mock.calls[0][0]).toBe('\n    :bananas,\n    ');
    // Should replace " :bananas"
    expect(actionableMock.replace.mock.calls[0][1]).toEqual({
      start: {
        row: 3,
        column: 7,
      },
      end: {
        row: 3,
        column: 16,
      }
    });
  });

  test('indent after comma/yet another object, even after a semi-colon', () => {
    const parser = turtle.turtleDoc.test(':me\n  :dislike :bananas;\n  :like\n    :apples,\n    :oranges');
    const accepted = parser.push(',');
    const actionableMock = {replace: jest.fn()};

    indent(parser, actionableMock);
    expect(actionableMock.replace.mock.calls.length).toBe(1);
    expect(actionableMock.replace.mock.calls[0][0]).toBe(',\n    ');
  });

  // Seems leading whitespace is not accepted by parser, move this test elsewhere?
  test.todo('prohibit leading space on newline');
});
