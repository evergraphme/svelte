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
});
