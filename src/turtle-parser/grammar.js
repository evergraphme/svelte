// From https://www.w3.org/TR/turtle/#sec-grammar-grammar

export function turtleDoc() {
  // statement*
  return new Rule({
    name: 'turtleDoc',
    terminal: false,
    next: (instance) => { return zeroOrMore(statement()); },
  });
}
export function statement() {
  // directive | triples '.'
  return new Rule({
    name: 'statement',
    terminal: false,
    next: (instance) => { return sequence(or(directive(), triples()), string('.')); },
  });
}
export function directive() {
  // prefixID | base | sparqlPrefix | sparqlBase
  return new Rule({
    name: 'directive',
    terminal: false,
    next: (instance) => { return or(prefixID(), base(), sparqlPrefix(), sparqlBase()); },
  });
}
export function prefixID() {
  // '@prefix' PNAME_NS IRIREF '.'
  return new Rule({
    name: 'prefixID',
    terminal: false,
    next: (instance) => { return sequence(string('@prefix'), PNAME_NS(), IRIREF(), string('.')); },
  });
}
export function base() {
  // '@base' IRIREF '.'
  return new Rule({
    name: 'base',
    terminal: false,
    next: (instance) => { return sequence(string('@base'), IRIREF(), string('.')); },
  });
}
export function sparqlBase() {
  // "BASE" IRIREF
  return new Rule({
    name: 'sparqlBase',
    terminal: false,
    next: (instance) => { return sequence(string('BASE'), IRIREF()); },
  });
}
export function sparqlPrefix() {
  // "PREFIX" PNAME_NS IRIREF
  return new Rule({
    name: 'sparqlPrefix',
    terminal: false,
    next: (instance) => { return sequence(string('PREFIX'), IRIREF()); },
  });
}
export function triples() {
  // subject predicateObjectList | blankNodePropertyList predicateObjectList?
  return new Rule({
    name: 'triples',
    terminal: false,
    next: (instance) => { return or(sequence(subject(), predicateObjectList()), sequence(blankNodePropertyList(), optional(predicateObjectList()))); },
  });
}
export function predicateObjectList() {
  // verb objectList (';' (verb objectList)?)*
  return new Rule({
    name: 'predicateObjectList',
    terminal: false,
    next: (instance) => { return sequence(verb(), objectList(), zeroOrMore(sequence(string(';'), optional(sequence(verb(), objectList()))))); },
  });
}
export function objectList() {
  // object (',' object)*
  return new Rule({
    name: 'objectList',
    terminal: false,
    next: (instance) => { return sequence(object(), zeroOrMore(string(','), object())); },
  });
}
export function verb() {
  // predicate | 'a'
  return new Rule({
    name: 'verb',
    terminal: false,
    next: (instance) => { return or(predicate(), string('a')); },
  });
}
export function subject() {
  // iri | BlankNode | collection
  return new Rule({
    name: 'subject',
    terminal: false,
    next: (instance) => { return or(iri(), BlankNode(), collection()); },
  });
}
export function predicate() {
  // iri
  return new Rule({
    name: 'predicate',
    terminal: false,
    next: (instance) => { return iri(); },
  });
}
export function object() {
  // iri | BlankNode | collection | blankNodePropertyList | literal
  return new Rule({
    name: 'object',
    terminal: false,
    next: (instance) => { return or(iri(), BlankNode(), collection(), blankNodePropertyList(), literal()); },
  });
}
export function literal() {
  // RDFLiteral | NumericLiteral | BooleanLiteral
  return new Rule({
    name: 'literal',
    terminal: false,
    next: (instance) => { return or(RDFLiteral(), NumericLiteral(), BooleanLiteral()); },
  });
}
export function blankNodePropertyList() {
  // '[' predicateObjectList ']'
  return new Rule({
    name: 'blankNodePropertyList',
    terminal: false,
    next: (instance) => { return sequence(string('['), predicateObjectList(), string(']')); },
  });
}
export function collection() {
  // '(' object* ')'
  return new Rule({
    name: 'collection',
    terminal: false,
    next: (instance) => { return sequence(string('('), zeroOrMore(object()), string(')')); },
  });
}
export function NumericLiteral() {
  // INTEGER | DECIMAL | DOUBLE
  return new Rule({
    name: 'NumericLiteral',
    terminal: false,
    next: (instance) => { return or(INTEGER(), DECIMAL(), DOUBLE()); },
  });
}
export function RDFLiteral() {
  // String (LANGTAG | '^^' iri)?
  return new Rule({
    name: 'RDFLiteral',
    terminal: false,
    next: (instance) => { return sequence(String(), optional(or(LANGTAG(), sequence(string('^^'), iri())))); },
  });
}
export function BooleanLiteral() {
  // 'true' | 'false'
  return new Rule({
    name: 'BooleanLiteral',
    terminal: false,
    next: (instance) => { return or(string('true'), string('false')); },
  });
}
export function String() {
  // STRING_LITERAL_QUOTE | STRING_LITERAL_SINGLE_QUOTE | STRING_LITERAL_LONG_SINGLE_QUOTE | STRING_LITERAL_LONG_QUOTE
  return new Rule({
    name: 'String',
    terminal: false,
    next: (instance) => { return or(STRING_LITERAL_QUOTE(), STRING_LITERAL_SINGLE_QUOTE(), STRING_LITERAL_LONG_SINGLE_QUOTE(), STRING_LITERAL_LONG_QUOTE()); },
  });
}
export function iri() {
  // IRIREF | PrefixedName
  return new Rule({
    name: 'iri',
    terminal: false,
    next: (instance) => { return or(IRIREF(), PrefixedName()); },
  });
}
export function PrefixedName() {
  // PNAME_LN | PNAME_NS
  return new Rule({
    name: 'PrefixedName',
    terminal: false,
    next: (instance) => { return or(PNAME_LN(), PNAME_NS()); },
  });
}
export function BlankNode() {
  // BLANK_NODE_LABEL | ANON
  return new Rule({
    name: 'BlankNode',
    terminal: false,
    next: (instance) => { return or(BLANK_NODE_LABEL(), ANON()); },
  });
}


export function IRIREF() {
  // '<' ([^#x00-#x20<>"{}|^`\] | UCHAR)* '>' /* #x00=NULL #01-#x1F=control codes #x20=space */
  return new Rule({
    name: 'IRIREF',
    terminal: true,
    next: (instance) => { return sequence(string('<'), zeroOrMore(or(characterClass(/[^\x00-\x20<>"{}|^`\\]/), UCHAR())), string('>')); },
  });
}
export function PNAME_NS() {
  // PN_PREFIX? ':'
  return new Rule({
    name: 'PNAME_NS',
    terminal: true,
    next: (instance) => { return sequence(optional(PN_PREFIX()), string(':')); },
  });
}
export function PNAME_LN() {
  // PNAME_NS PN_LOCAL
  return new Rule({
    name: 'PNAME_LN',
    terminal: true,
    next: (instance) => { return sequence(PNAME_NS(), PN_LOCAL()); },
  });
}
export function BLANK_NODE_LABEL() {
  // '_:' (PN_CHARS_U | [0-9]) ((PN_CHARS | '.')* PN_CHARS)?
  return new Rule({
    name: 'BLANK_NODE_LABEL',
    terminal: true,
    next: (instance) => { return sequence('_:', or(PN_CHARS_U(), characterClass(/[0-9]/)), optional(sequence(zeroOrMore(or(PN_CHARS(), string('.')), PN_CHARS()))); },
  });
}
export function LANGTAG() {
  // '@' [a-zA-Z]+ ('-' [a-zA-Z0-9]+)*
  return new Rule({
    name: 'LANGTAG',
    terminal: true,
    next: (instance) => { return sequence(string('@'), oneOrMore(characterClass(/[a-zA-Z]/)), zeroOrMore(sequence(string('-'), oneOrMore(characterClass(/[a-zA-Z0-9]/))); },
  });
}
export function INTEGER() {
  // [+-]? [0-9]+
  return new Rule({
    name: 'INTEGER',
    terminal: true,
    next: (instance) => { return sequence(optional(characterClass(/[+-]/)), oneOrMore(characterClass(/[0-9]/))); },
  });
}
export function DECIMAL() {
  // [+-]? [0-9]* '.' [0-9]+
  return new Rule({
    name: 'DECIMAL',
    terminal: true,
    next: (instance) => { return sequence(optional(characterClass(/[+-]/)), oneOrMore(characterClass(/[0-9]/)), string('.'), oneOrMore(characterClass(/[0-9]/))); },
  });
}
export function DOUBLE() {
  // [+-]? ([0-9]+ '.' [0-9]* EXPONENT | '.' [0-9]+ EXPONENT | [0-9]+ EXPONENT)
  return new Rule({
    name: 'DOUBLE',
    terminal: true,
    next: (instance) => { return sequence([+-]?, or(sequence(oneOrMore(characterClass(/[0-9]/)), string('.'), zeroOrMore(characterClass(/[0-9]/)), EXPONENT()), sequence(string('.'), oneOrMore(characterClass(/[0-9]/)), EXPONENT()), sequence(oneOrMore(characterClass(/[0-9]/)), EXPONENT()))); },
  });
}
export function EXPONENT() {
  // [eE] [+-]? [0-9]+
  return new Rule({
    name: 'EXPONENT',
    terminal: true,
    next: (instance) => { return sequence(characterClass(/[eE]/), optional(characterClass(/[+-]/)), oneOrMore(characterClass(/[0-9]/))); },
  });
}
export function STRING_LITERAL_QUOTE() {
  // '"' ([^#x22#x5C#xA#xD] | ECHAR | UCHAR)* '"' /* #x22=" #x5C=\ #xA=new line #xD=carriage return */
  return new Rule({
    name: 'STRING_LITERAL_QUOTE',
    terminal: true,
    next: (instance) => { return sequence(string('"'), zeroOrMore(or(characterClass(/[^\x22\x5C\xA\xD]/), ECHAR(), UCHAR()), string('"')); },
  });
}
export function STRING_LITERAL_SINGLE_QUOTE() {
  // "'" ([^#x27#x5C#xA#xD] | ECHAR | UCHAR)* "'" /* #x27=' #x5C=\ #xA=new line #xD=carriage return */
  return new Rule({
    name: 'STRING_LITERAL_SINGLE_QUOTE',
    terminal: true,
    next: (instance) => { return sequence(string("'"), zeroOrMore(characterClass(/[^\x27\x5C\xA\xD]/), ECHAR(), UCHAR()), string("'")); },
  });
}
export function STRING_LITERAL_LONG_SINGLE_QUOTE() {
  // "'''" (("'" | "''")? ([^'\] | ECHAR | UCHAR))* "'''"
  return new Rule({
    name: 'STRING_LITERAL_LONG_SINGLE_QUOTE',
    terminal: true,
    next: (instance) => { return sequence(string("'''"), zeroOrMore(sequence(optional(or(string("'"), string("''"))), or(characterClass(/[^'\\]/), ECHAR(), UCHAR()))), string("'''")); },
  });
}
export function STRING_LITERAL_LONG_QUOTE() {
  // '"""' (('"' | '""')? ([^"\] | ECHAR | UCHAR))* '"""'
  return new Rule({
    name: 'STRING_LITERAL_LONG_QUOTE',
    terminal: true,
    next: (instance) => { return sequence(string('"""'), zeroOrMore(sequence(optional(or(string('"'), string('""'))), or(characterClass(/[^"\\]/), ECHAR(), UCHAR()))), string('"""')); },
  });
}
export function UCHAR() {
  // '\u' HEX HEX HEX HEX | '\U' HEX HEX HEX HEX HEX HEX HEX HEX
  return new Rule({
    name: 'UCHAR',
    terminal: true,
    next: (instance) => { return or(sequence(string('\u'), HEX(), HEX(), HEX(), HEX()), sequence(string('\U'), HEX(), HEX(), HEX(), HEX(), HEX(), HEX(), HEX(), HEX())); },
  });
}
export function ECHAR() {
  // '\' [tbnrf"'\]
  return new Rule({
    name: 'ECHAR',
    terminal: true,
    next: (instance) => { return sequence(string('\\'), characterClass(/[tbnrf"'\\]/)); },
  });
}
export function WS() {
  // #x20 | #x9 | #xD | #xA /* #x20=space #x9=character tabulation #xD=carriage return #xA=new line */
  return new Rule({
    name: 'WS',
    terminal: true,
    next: (instance) => { return or(string('\x20'), string('\x09'), string('\x0D'), string('\x0A')); },
  });
}
export function ANON() {
  // '[' WS* ']'
  return new Rule({
    name: 'ANON',
    terminal: true,
    next: (instance) => { return sequence(string('['), zeroOrMore(WS()), string(']')); },
  });
}
export function PN_CHARS_BASE() {
  // [A-Z] | [a-z] | [#x00C0-#x00D6] | [#x00D8-#x00F6] | [#x00F8-#x02FF] | [#x0370-#x037D] | [#x037F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
  return new Rule({
    name: 'PN_CHARS_BASE',
    terminal: true,
    next: (instance) => { return or(characterClass(/[A-Z]/) , characterClass(/[a-z]/), characterClass([/\u00C0-\u00D6]/), characterClass([/\u00D8-\u00F6]/), characterClass([/\u00F8-\u02FF]/), characterClass([/\u0370-\u037D]/), characterClass([/\u037F-\u1FFF]/), characterClass([/\u200C-\u200D]/), characterClass([/\u2070-\u218F]/), characterClass([/\u2C00-\u2FEF]/), characterClass([/\u3001-\uD7FF]/), characterClass([/\uF900-\uFDCF]/), characterClass([/\uFDF0-\uFFFD]/)); },
  });
}
export function PN_CHARS_U() {
  // PN_CHARS_BASE | '_'
  return new Rule({
    name: 'PN_CHARS_U',
    terminal: true,
    next: (instance) => { return or(PN_CHARS_BASE(), string('_')); },
  });
}
export function PN_CHARS() {
  // PN_CHARS_U | '-' | [0-9] | #x00B7 | [#x0300-#x036F] | [#x203F-#x2040]
  return new Rule({
    name: 'PN_CHARS',
    terminal: true,
    next: (instance) => { return or(PN_CHARS_U(), string('-'), characterClass(/[0-9]/), string('\u00B7'), characterClass(/[\u0300-\u036F]/), characterClass(/[\u203F-\u2040]/)); },
  });
}
export function PN_PREFIX() {
  // PN_CHARS_BASE ((PN_CHARS | '.')* PN_CHARS)?
  return new Rule({
    name: 'PN_PREFIX',
    terminal: true,
    next: (instance) => { return sequence(PN_CHARS_BASE(), optional(sequence(zeroOrMore(or(PN_CHARS(), string('.')), PN_CHARS))); },
  });
}
export function PN_LOCAL() {
  // (PN_CHARS_U | ':' | [0-9] | PLX) ((PN_CHARS | '.' | ':' | PLX)* (PN_CHARS | ':' | PLX))?
  return new Rule({
    name: 'PN_LOCAL',
    terminal: true,
    next: (instance) => { return sequence(or(PN_CHARS_U(), string(':'), characterClass(/[0-9]/), PLX()), optional(sequence(zeroOrMore(or(PN_CHARS(), strign('.'), string(':'), PLX())), or(PN_CHARS(), string(':'), PLX())))); },
  });
}
export function PLX() {
  // PERCENT | PN_LOCAL_ESC
  return new Rule({
    name: 'PLX',
    terminal: true,
    next: (instance) => { return or(PERCENT(), PN_LOCAL_ESC()); },
  });
}
export function PERCENT() {
  // '%' HEX HEX
  return new Rule({
    name: 'PERCENT',
    terminal: true,
    next: (instance) => { return sequence(string('%'), HEX(), HEX()); },
  });
}
export function HEX() {
  // [0-9] | [A-F] | [a-f]
  return new Rule({
    name: 'HEX',
    terminal: true,
    next: (instance) => { return characterClass(/[0-9A-Fa-f]/); },
  });
}
export function PN_LOCAL_ESC() {
  // '\' ('_' | '~' | '.' | '-' | '!' | '$' | '&' | "'" | '(' | ')' | '*' | '+' | ',' | ';' | '=' | '/' | '?' | '#' | '@' | '%')
  return new Rule({
    name: 'PN_LOCAL_ESC',
    terminal: true,
    next: (instance) => { return sequence(string('\\'), characterClass(/[_~.-!$&'()*+,;=/?#@%]/)); },
  });
}
