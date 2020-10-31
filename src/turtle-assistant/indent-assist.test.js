import * as indent from './indent-assist';
import { turtle } from '../turtle-parser';
import { Changeset, parseNextInput } from './changeset';
import { assistants } from '.';

describe('statement', () => {
  test('indent after subject', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me'),
      input: ' ',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.change).toBe(':me\n  ');
  });

  test('indent after dot/triples done', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :like :apples '),
      input: '.',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.replacement()).toBe(':me\n  :like :apples .\n');
  });

  test('indent after semicolon/new predicate', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :like :apples'),
      input: ';',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.change).toBe(':me\n  :like :apples;\n  ');
  });

  test('indent after comma/new object', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :like :apples'),
      input: ',',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.change).toBe(':me\n  :like\n    :apples,\n    ');
  });

  test('indent after comma/yet another object', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :like\n    :apples,\n    :oranges'),
      input: ',',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.change).toBe(':me\n  :like\n    :apples,\n    :oranges,\n    ');
  });

  test('indent after comma/new object, even after a semi-colon', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :like :apples;\n  :dislike :orange;\n  :favor :bananas'),
      input: ',',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.change).toBe(':me\n  :like :apples;\n  :dislike :orange;\n  :favor\n    :bananas,\n    ');
  });

  test('indent after comma/yet another object, even after a semi-colon', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':me\n  :dislike :bananas;\n  :like\n    :apples,\n    :oranges'),
      input: ',',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.change).toBe(':me\n  :dislike :bananas;\n  :like\n    :apples,\n    :oranges,\n    ');
  });

  test('indent after comma/new object, even with a space between', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(''),
      input: ': : : , :',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.change).toBe(':\n  :\n    :,\n    :');
  });

  test('disallow whitespace unless accepted by indentation rules', () => {
    // processed [ ] => [:i\n   ] <= 3 spaces!!
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(':ws\n  '),
      input: ' \n\t',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.parser.text).toBe(':ws\n  ');
    expect(changeset.change).toBe(':ws\n  ');
  });

  test('disallow leading whitespace but accept further input', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(''),
      input: ' \n\t',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.parser.text).toBe('');
    expect(changeset.parser.accepting).toBe(true);
    expect(changeset.change).toBe('');
  });

  test('cope with dot ending without space', () => {
    const changeset = new Changeset({
      parser: turtle.turtleDoc.test(''),
      input: ': : :a. :',
    });
    changeset.parseAllInput(assistants);
    expect(changeset.parser.accepting).toBe(true);
    expect(changeset.replacement()).toBe(':\n  : :a .\n:');
  });
});
