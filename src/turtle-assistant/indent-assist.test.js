import * as indent from './indent-assist';
import { turtle } from '../turtle-parser';
import { Changeset } from './changeset';

describe('statement', () => {
  test('indent after subject', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me'),
      change: ' ',
    });
    indent.indentAfterSubject(changeset, () => {});
    expect(changeset.change).toBe(':me\n  ');
  });

  test('indent after dot/triples done', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :like :apples '),
      change: '.',
    });
    indent.indentAfterDot(changeset, () => { changeset.parser.push(changeset.nextChar()); });
    expect(changeset.change).toBe(':me\n  :like :apples .\n');
  });

  test('indent after semicolon/new predicate', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :like :apples'),
      change: ';',
    });
    indent.indentAfterSemicolon(changeset, () => { changeset.parser.push(changeset.nextChar()); });
    expect(changeset.change).toBe(':me\n  :like :apples;\n  ');
  });

  test('indent after comma/new object', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :like :apples'),
      change: ',',
    });
    indent.indentAfterComma(changeset, () => { changeset.parser.push(changeset.nextChar()); });
    expect(changeset.change).toBe(':me\n  :like\n    :apples,\n    ');
  });

  test('indent after comma/yet another object', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :like\n    :apples,\n    :oranges'),
      change: ',',
    });
    indent.indentAfterComma(changeset, () => { changeset.parser.push(changeset.nextChar()); });
    expect(changeset.change).toBe(':me\n  :like\n    :apples,\n    :oranges,\n    ');
  });

  test('indent after comma/new object, even after a semi-colon', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :like :apples;\n  :dislike :orange;\n  :favor :bananas'),
      change: ',',
    });
    indent.indentAfterComma(changeset, () => { changeset.parser.push(changeset.nextChar()); });
    expect(changeset.change).toBe(':me\n  :like :apples;\n  :dislike :orange;\n  :favor\n    :bananas,\n    ');
  });

  test('indent after comma/yet another object, even after a semi-colon', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :dislike :bananas;\n  :like\n    :apples,\n    :oranges'),
      change: ',',
    });
    indent.indentAfterComma(changeset, () => { changeset.parser.push(changeset.nextChar()); });
    expect(changeset.change).toBe(':me\n  :dislike :bananas;\n  :like\n    :apples,\n    :oranges,\n    ');
  });

  // Seems leading whitespace is not accepted by parser, move this test elsewhere?
  test.todo('prohibit leading space on newline');
});
