import { Changeset, fromAceDelta } from './changeset';
import { Statement } from './statement';
import { turtle } from '../turtle-parser';

const insertX = {
  action: 'insert',
  start: {
    row: 0,
    column: 2,
  },
  end: {
    row: 0,
    column: 3,
  },
  lines: [
    'x',
  ]
};
const insertXY = {
  action: 'insert',
  start: {
    row: 0,
    column: 2,
  },
  end: {
    row: 1,
    column: 1,
  },
  lines: [
    'x',
    'y',
  ]
};

describe('fromAceDelta', () => {
  test('Add a single character', () => {
    const statements = [];
    const parser = turtle.turtleDoc.test('ab');
    const changeset = fromAceDelta(statements, parser, insertX);
    expect(changeset.change).toBe('abx');
  });

  test('Insert a single character in the middle', () => {
    const statements = [];
    const parser = turtle.turtleDoc.test('abcd');
    const changeset = fromAceDelta(statements, parser, insertX);
    expect(changeset.change).toBe('abxcd');
  });

  test('Remove a single character in the middle', () => {
    const statements = [];
    const parser = turtle.turtleDoc.test('abcd');
    const changeset = fromAceDelta(statements, parser, Object.assign({}, insertX, {action: 'remove'}));
    expect(changeset.change).toBe('abd');
  });

  test('Insert several characters in the middle', () => {
    const statements = [];
    const parser = turtle.turtleDoc.test('abcd');
    const changeset = fromAceDelta(statements, parser, insertXY);
    expect(changeset.change).toBe('abx\nycd');
  });

  test('Remove several characters in the middle', () => {
    const statements = [];
    const parser = turtle.turtleDoc.test('a:x\n  y:b');
    const changeset = fromAceDelta(statements, parser, {
      action: 'remove',
      start: {
        row: 0,
        column: 1,
      },
      end: {
        row: 1,
        column: 4,
      },
      lines: [
        ':x',
        '  y:',
      ]
    });
    expect(changeset.change).toBe('ab');
  });
});
