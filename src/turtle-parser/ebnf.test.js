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
      const twelve = digit.test('12');
      expect(twelve.valid).toBe(false);
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

  test.todo('add more ebnf tests');
});
