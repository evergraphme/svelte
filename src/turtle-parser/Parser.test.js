import { turtle } from '.';

describe('Parser', () => {
  test('Comment', () => {
      expect(turtle.turtleDoc.test('#comment\n<http://example.com>').value()).toBe('http://example.com');
  });

  describe('Map tokens to RDF terms', () => {
    // https://www.w3.org/TR/turtle/#sec-parsing-terms

    // IRIREF
    // The characters between "<" and ">" are taken,
    // with the numeric escape sequences unescaped,
    // to form the unicode string of the IRI.
    // Relative IRI resolution is performed per Section 6.3.
    test('IRIREF', () => {
      expect(turtle.IRIREF.test('<http://example.com>').value()).toBe('http://example.com');
      expect(turtle.IRIREF.test('<http://ex\\u0061mple.com>').value()).toBe('http://example.com');
      expect(turtle.IRIREF.test('<http://ex\\U00000061mple.com>').value()).toBe('http://example.com');
    });
    test('Relative IRIREF', () => {
      const doc = turtle.turtleDoc.test('@base <http://example.com/> . <erik> ');
      const IRIREF = doc.collect(p => p.expression.name === 'IRIREF')[1].value();
      expect(IRIREF).toBe('http://example.com/erik');
    });
    test('PNAME_NS in prefix context', () => {
      const doc = turtle.prefixID.test('@prefix x: <http://example.com/> .');
      const PNAME_NS = doc.collect(p => p.expression.name === 'PNAME_NS')[0].value();
      expect(PNAME_NS).toBe('x');
    });
    test('PNAME_NS in PrefixedName context', () => {
      const doc = turtle.turtleDoc.test('@prefix x: <http://example.com/> . x: ');
      // Subject is the second occurence of a PNAME_NS
      const PNAME_NS = doc.collect(p => p.expression.name === 'PNAME_NS')[1].value();
      expect(PNAME_NS).toBe('http://example.com/');
    });
    test('PNAME_LN', () => {
      const doc = turtle.turtleDoc.test('@prefix x: <http://example.com/> . x:erik ');
      // Subject is the first occurence of a PNAME_LN
      const PNAME_LN = doc.collect(p => p.expression.name === 'PNAME_LN')[0].value();
      expect(PNAME_LN).toBe('http://example.com/erik');
    });
    test('STRING_LITERAL_SINGLE_QUOTE', () => {
      expect(turtle.STRING_LITERAL_SINGLE_QUOTE.test("'\\u0061bc\\''").value()).toBe("abc'");
    });
    test('STRING_LITERAL_QUOTE', () => {
      expect(turtle.STRING_LITERAL_QUOTE.test('"\\u0061bc\\""').value()).toBe('abc"');
    });
    test.skip('STRING_LITERAL_LONG_SINGLE_QUOTE', () => {
      // Parser cannot deal with long quotes at the moment
      expect(turtle.STRING_LITERAL_LONG_SINGLE_QUOTE.test("'''\\u0061b'c'''").value()).toBe("ab'c");
    });
    test.skip('STRING_LITERAL_LONG_QUOTE', () => {
      // Parser cannot deal with long quotes at the moment
      expect(turtle.STRING_LITERAL_LONG_QUOTE.test('"""\\u0061b"c"""').value()).toBe('ab"c');
    });
    test('LANGTAG', () => {
      expect(turtle.LANGTAG.test('@en').value()).toBe('en');
    });
    test('RDFLiteral IRIREF', () => {
      const literal = turtle.RDFLiteral.test('"erik"^^<http://example.com/>').value();
      expect(literal.termType).toBe('Literal');
      expect(literal.value).toBe('erik');
      expect(literal.datatype.termType).toBe('NamedNode');
      expect(literal.datatype.value).toBe('http://example.com/');
    });
    test('RDFLiteral PrefixedName', () => {
      const doc = turtle.turtleDoc.test('@prefix x: <http://example.com/> . x: x: "erik"^^x: ');
      const literal = doc.collect(p => p.expression.name === 'RDFLiteral')[0].value();
      expect(literal.termType).toBe('Literal');
      expect(literal.value).toBe('erik');
      expect(literal.datatype.termType).toBe('NamedNode');
      expect(literal.datatype.value).toBe('http://example.com/');
    });
    test('RDFLiteral LANGTAG', () => {
      const literal = turtle.RDFLiteral.test('"erik"@en').value();
      expect(literal.termType).toBe('Literal');
      expect(literal.value).toBe('erik');
      expect(literal.language).toBe('en');
    });
    test('INTEGER', () => {
      const literal = turtle.INTEGER.test('13').value();
      expect(literal.termType).toBe('Literal');
      expect(literal.value).toBe('13');
      expect(literal.datatype.termType).toBe('NamedNode');
      expect(literal.datatype.value).toBe('http://www.w3.org/2001/XMLSchema#integer');
    });
    test('DECIMAL', () => {
      const literal = turtle.DECIMAL.test('3.14').value();
      expect(literal.termType).toBe('Literal');
      expect(literal.value).toBe('3.14');
      expect(literal.datatype.termType).toBe('NamedNode');
      expect(literal.datatype.value).toBe('http://www.w3.org/2001/XMLSchema#decimal');
    });
    test('DOUBLE', () => {
      const literal = turtle.DOUBLE.test('7e2').value();
      expect(literal.termType).toBe('Literal');
      expect(literal.value).toBe('7e2');
      expect(literal.datatype.termType).toBe('NamedNode');
      expect(literal.datatype.value).toBe('http://www.w3.org/2001/XMLSchema#double');
    });
    test('BooleanLiteral', () => {
      const literal = turtle.BooleanLiteral.test('true').value();
      expect(literal.termType).toBe('Literal');
      expect(literal.value).toBe('true');
      expect(literal.datatype.termType).toBe('NamedNode');
      expect(literal.datatype.value).toBe('http://www.w3.org/2001/XMLSchema#boolean');
    });
    test.todo('BLANK_NODE_LABEL');
    test.todo('ANON');
    test.todo('blankNodePropertyList');
    test.todo('collection');
  })
});
