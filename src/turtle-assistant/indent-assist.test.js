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
    expect(actionableMock.replace.mock.calls[0][0]).toBe(',\n    ');
  });

  test('indent after comma/new object, even after a semi-colon', () => {
    const parser = turtle.turtleDoc.test(':me :like :apples; :dislike :orange; :favor :bananas');
    const accepted = parser.push(',');
    const actionableMock = {replace: jest.fn()};

    indent(parser, actionableMock);
    expect(actionableMock.replace.mock.calls.length).toBe(1);
    expect(actionableMock.replace.mock.calls[0][0]).toBe(',\n    ');
  });

  // Seems leading whitespace is not accepted by parser, move this test elsewhere?
  test.todo('prohibit leading space on newline');
});
