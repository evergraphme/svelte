import * as ebnf from './ebnf';

describe('ebnf', () => {
  describe('characterClass', () => {
    test('valid digit', () => {
      const digit = ebnf.characterClass(/[0-9]/);
      const two = digit.test('2');
      expect(two.valid).toBe(true);
      expect(two.satisfied).toBe(true);
      expect(two.length).toBe(1);
    });

    test('invalid digit', () => {
      const digit = ebnf.characterClass(/[0-9]/);
      const a = digit.test('a');
      expect(a.valid).toBe(false);
      expect(a.length).toBe(0);
    });

    test('more than one character', () => {
      const digit = ebnf.characterClass(/[0-9]/);
      const twelve = digit.test('1');
      // Valid, but last push returns false
      const accepted = twelve.push('2');
      expect(twelve.valid).toBe(true);
      expect(twelve.satisfied).toBe(true);
      expect(twelve.length).toBe(1);
      expect(accepted).toBe(false);
    });
  });

  describe('string', () => {
    test('valid', () => {
      const text = ebnf.string('Kilroy');
      const kilroy = text.test('Kilroy');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(6);
    });

    test('valid beginning', () => {
      const text = ebnf.string('Kilroy');
      const kilroy = text.test('Kil');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(false);
      expect(kilroy.length).toBe(3);
    });

    test('invalid', () => {
      const text = ebnf.string('Kilroy');
      const kilroy = text.test('Kiloy');
      expect(kilroy.valid).toBe(false);
      expect(kilroy.length).toBe(3);
    });

    test('too long', () => {
      const text = ebnf.string('Kilroy');
      const kilroy = text.test('Kilroy');
      // Valid, but last push returns false
      const accepted = kilroy.push('2');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(6);
      expect(accepted).toBe(false);
    });
  });

  describe('optional', () => {
    test('valid exists', () => {
      const optional = ebnf.optional(ebnf.string('Kilroy'));
      const kilroy = optional.test('Kilroy');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(6);
    });

    test('valid beginning', () => {
      const optional = ebnf.optional(ebnf.string('Kilroy'));
      const kilroy = optional.test('Kil');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(false);
      expect(kilroy.length).toBe(3);
    });

    test('valid empty', () => {
      const optional = ebnf.optional(ebnf.string('Kilroy'));
      const kilroy = optional.test('');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(0);
    });

    test('valid emptied', () => {
      const optional = ebnf.optional(ebnf.string('Kilroy'));
      const kilroy = optional.test('Kiloy');
      // When match fails, optional reverts to valid of length 0
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(0);
    });
  });

  describe('sequence', () => {
    test('valid', () => {
      const sequence = ebnf.sequence([ebnf.string('abc'), ebnf.string('xyz'), ebnf.string('123')]);
      const kilroy = sequence.test('abcxyz123');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(9);
    });

    test('valid beginning', () => {
      const sequence = ebnf.sequence([ebnf.string('abc'), ebnf.string('xyz'), ebnf.string('123')]);
      const kilroy = sequence.test('abcx');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(false);
      expect(kilroy.length).toBe(4);
    });

    test('valid with optional', () => {
      const sequence = ebnf.sequence([ebnf.string('abc'), ebnf.optional(ebnf.string('xyz')), ebnf.string('123')]);
      const kilroy = sequence.test('abc123');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(6);
    });

    test('invalid', () => {
      const sequence = ebnf.sequence([ebnf.string('abc'), ebnf.string('xyz'), ebnf.string('123')]);
      const kilroy = sequence.test('abcabc123');
      expect(kilroy.valid).toBe(false);
    });

    test('too long', () => {
      const sequence = ebnf.sequence([ebnf.string('abc'), ebnf.string('xyz'), ebnf.string('123')]);
      const kilroy = sequence.test('abcxyz123');
      // Valid, but last push returns false
      const accepted = kilroy.push('2');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(9);
      expect(accepted).toBe(false);
    });
  });

  describe('or', () => {
    test('valid', () => {
      const or = ebnf.or([ebnf.string('abc'), ebnf.string('xyz'), ebnf.string('123')]);
      const kilroy = or.test('xyz');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(3);
    });

    test('valid beginning', () => {
      const or = ebnf.or([ebnf.string('abc'), ebnf.string('xyz'), ebnf.string('123')]);
      const kilroy = or.test('12');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(false);
      expect(kilroy.length).toBe(2);
    });

    test('valid with optional', () => {
      const or = ebnf.or([ebnf.string('abc'), ebnf.optional(ebnf.string('xyz')), ebnf.string('123')]);
      const kilroy = or.test('no');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(0);
    });

    test('invalid', () => {
      const or = ebnf.or([ebnf.string('abc'), ebnf.string('xyz'), ebnf.string('123')]);
      const kilroy = or.test('no');
      expect(kilroy.valid).toBe(false);
    });

    test('too long', () => {
      const or = ebnf.or([ebnf.string('abc'), ebnf.string('xyz'), ebnf.string('123')]);
      const kilroy = or.test('abc');
      // Valid, but last push returns false
      const accepted = kilroy.push('2');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(3);
      expect(accepted).toBe(false);
    });
  });

  describe('oneOrMore', () => {
    test('valid single', () => {
      const oneOrMore = ebnf.oneOrMore(ebnf.string('Kilroy'));
      const kilroy = oneOrMore.test('Kilroy');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(6);
    });

    test('valid two', () => {
      const oneOrMore = ebnf.oneOrMore(ebnf.string('Kilroy'));
      const kilroy = oneOrMore.test('KilroyKilroy');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(12);
    });

    test('valid beginning', () => {
      const oneOrMore = ebnf.oneOrMore(ebnf.string('Kilroy'));
      const kilroy = oneOrMore.test('KilroyKil');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(false);
      expect(kilroy.length).toBe(9);
    });

    test('invalid', () => {
      const oneOrMore = ebnf.oneOrMore(ebnf.string('Kilroy'));
      const kilroy = oneOrMore.test('Kiloy');
      expect(kilroy.valid).toBe(false);
    });

    test('too long', () => {
      const oneOrMore = ebnf.oneOrMore(ebnf.string('Kilroy'));
      const kilroy = oneOrMore.test('Kilroy');
      // Valid, but last push returns false
      const accepted = kilroy.push('2');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(6);
      expect(accepted).toBe(false);
    });
  });

  describe('zeroOrMore', () => {
    test('valid empty', () => {
      const zeroOrMore = ebnf.zeroOrMore(ebnf.string('Kilroy'));
      const kilroy = zeroOrMore.test('');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(0);
    });

    test('valid single', () => {
      const zeroOrMore = ebnf.zeroOrMore(ebnf.string('Kilroy'));
      const kilroy = zeroOrMore.test('Kilroy');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(6);
    });

    test('valid two', () => {
      const zeroOrMore = ebnf.zeroOrMore(ebnf.string('Kilroy'));
      const kilroy = zeroOrMore.test('KilroyKilroy');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(12);
    });

    test('valid beginning', () => {
      const zeroOrMore = ebnf.zeroOrMore(ebnf.string('Kilroy'));
      const kilroy = zeroOrMore.test('KilroyKil');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(false);
      expect(kilroy.length).toBe(9);
    });

    test('invalid', () => {
      const zeroOrMore = ebnf.zeroOrMore(ebnf.string('Kilroy'));
      const kilroy = zeroOrMore.test('Kiloy');
      expect(kilroy.valid).toBe(false);
    });

    test('too long', () => {
      const zeroOrMore = ebnf.zeroOrMore(ebnf.string('Kilroy'));
      const kilroy = zeroOrMore.test('Kilroy');
      // Valid, but last push returns false
      const accepted = kilroy.push('2');
      expect(kilroy.valid).toBe(true);
      expect(kilroy.satisfied).toBe(true);
      expect(kilroy.length).toBe(6);
      expect(accepted).toBe(false);
    });
  });

  test.todo('comments');
});
