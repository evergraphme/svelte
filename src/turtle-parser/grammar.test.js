import * as grammar from './grammar';

describe('grammar', () => {
  describe('PN_LOCAL_ESC', () => {
    test('valid', () => {
      const test = grammar.PN_LOCAL_ESC.test('\\!');
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
    });
  });

  describe('PN_CHARS_BASE', () => {
    test('valid', () => {
      const test = grammar.PN_CHARS_BASE.test('a');
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
      expect(test.length).toBe(1);
    });
  });

  describe('PN_PREFIX', () => {
    test('valid', () => {
      const test = grammar.PN_PREFIX.test('a');
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
      expect(test.length).toBe(1);
    });
  });

  describe('BlankNode', () => {
    test('valid', () => {
      const test = grammar.BlankNode.test('_:0b');
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
      expect(test.length).toBe(4);
    });
  });

  describe('PrefixedName', () => {
    test('valid', () => {
      const test = grammar.PrefixedName.test('a:a');
      // console.log(test);
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
    });
  });

  describe('iri', () => {
    test('valid', () => {
      const test = grammar.iri.test('<https://example.com/value>');
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
    });
  });

  describe('String', () => {
    test('valid', () => {
      const test = grammar.String.test('"hello"');
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
    });
  });

  describe('RDFLiteral', () => {
    test('valid', () => {
      const test = grammar.RDFLiteral.test('"hello"@en');
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
    });
  });

  describe('subject', () => {
    test('valid', () => {
      const test = grammar.subject.test('<https://example.com/me>');
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
    });
  });

  describe('verb', () => {
    test('valid', () => {
      const test = grammar.verb.test('a');
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
    });
  });

  describe('sparqlBase', () => {
    test('valid ws', () => {
      const test = grammar.sparqlBase.test('BASE  <urn:here>');
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
    });
  });

  describe('statement', () => {
    test('valid', () => {
      const test = grammar.statement.test('a:me a a:person .');
      expect(test.valid).toBe(true);
      expect(test.satisfied).toBe(true);
    });
  });
});
