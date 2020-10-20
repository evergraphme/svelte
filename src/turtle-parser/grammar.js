// From https://www.w3.org/TR/turtle/#sec-grammar-grammar
import { Expression } from './Expression';
import * as ebnf from './ebnf';

export const PN_LOCAL_ESC = new Expression({
  name: 'PN_LOCAL_ESC',
  terminal: true,
  // '\' ('_' | '~' | '.' | '-' | '!' | '$' | '&' | "'" | '(' | ')' | '*' | '+' | ',' | ';' | '=' | '/' | '?' | '#' | '@' | '%')
  lazy_expression: () => ebnf.sequence([ebnf.string('\\'), ebnf.characterClass(/[_~.\-!$&'()*+,;=/?#@%]/)]),
});
export const HEX = new Expression({
  // [0-9] | [A-F] | [a-f]
  name: 'HEX',
  terminal: true,
  lazy_expression: () => ebnf.characterClass(/[0-9A-Fa-f]/),
});
export const PERCENT = new Expression({
  // '%' HEX HEX
  name: 'PERCENT',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.string('%'), HEX, HEX]),
});
export const PLX = new Expression({
  // PERCENT | PN_LOCAL_ESC
  name: 'PLX',
  terminal: true,
  lazy_expression: () => ebnf.or([PERCENT, PN_LOCAL_ESC]),
});
export const PN_CHARS_BASE = new Expression({
  // [A-Z] | [a-z] | [#x00C0-#x00D6] | [#x00D8-#x00F6] | [#x00F8-#x02FF] | [#x0370-#x037D] | [#x037F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
  name: 'PN_CHARS_BASE',
  terminal: true,
  lazy_expression: () =>
    ebnf.or([
      ebnf.characterClass(/[A-Z]/),
      ebnf.characterClass(/[a-z]/),
      ebnf.characterClass(/[\u00C0-\u00D6]/),
      ebnf.characterClass(/[\u00D8-\u00F6]/),
      ebnf.characterClass(/[\u00F8-\u02FF]/),
      ebnf.characterClass(/[\u0370-\u037D]/),
      ebnf.characterClass(/[\u037F-\u1FFF]/),
      ebnf.characterClass(/[\u200C-\u200D]/),
      ebnf.characterClass(/[\u2070-\u218F]/),
      ebnf.characterClass(/[\u2C00-\u2FEF]/),
      ebnf.characterClass(/[\u3001-\uD7FF]/),
      ebnf.characterClass(/[\uF900-\uFDCF]/),
      ebnf.characterClass(/[\uFDF0-\uFFFD]/)]),
});
export const PN_CHARS_U = new Expression({
  // PN_CHARS_BASE | '_'
  name: 'PN_CHARS_U',
  terminal: true,
  lazy_expression: () => ebnf.or([PN_CHARS_BASE, ebnf.string('_')]),
});
export const PN_CHARS = new Expression({
  // PN_CHARS_U | '-' | [0-9] | #x00B7 | [#x0300-#x036F] | [#x203F-#x2040]
  name: 'PN_CHARS',
  terminal: true,
  lazy_expression: () => ebnf.or([PN_CHARS_U, ebnf.string('-'), ebnf.characterClass(/[0-9]/), ebnf.string('\u00B7'), ebnf.characterClass(/[\u0300-\u036F]/), ebnf.characterClass(/[\u203F-\u2040]/)]),
});
export const PN_LOCAL = new Expression({
  // (PN_CHARS_U | ':' | [0-9] | PLX) ((PN_CHARS | '.' | ':' | PLX)* (PN_CHARS | ':' | PLX))?
  name: 'PN_LOCAL',
  terminal: true,
  lazy_expression: () => ebnf.sequence([
    ebnf.or([
      PN_CHARS_U,
      ebnf.string(':'),
      ebnf.characterClass(/[0-9]/),
      PLX]),
    ebnf.optional(
      ebnf.sequence([
        ebnf.zeroOrMore(
          ebnf.or([
            PN_CHARS,
            ebnf.string('.'),
            ebnf.string(':'),
            PLX])),
        ebnf.or([
          PN_CHARS,
          ebnf.string(':'),
          PLX])]))]),
});
export const PN_PREFIX = new Expression({
  // PN_CHARS_BASE ((PN_CHARS | '.')* PN_CHARS)?
  name: 'PN_PREFIX',
  terminal: true,
  lazy_expression: () =>
    ebnf.sequence([
      PN_CHARS_BASE,
      ebnf.optional(
        ebnf.sequence([
          ebnf.zeroOrMore(
            ebnf.or([
              PN_CHARS,
              ebnf.string('.')])),
          PN_CHARS]))]),
});
export const WS = new Expression({
  // #x20 | #x9 | #xD | #xA /* #x20=space #x9=character tabulation #xD=carriage return #xA=new line */
  name: 'WS',
  terminal: true,
  lazy_expression: () => ebnf.or([ebnf.string('\x20'), ebnf.string('\x09'), ebnf.string('\x0D'), ebnf.string('\x0A')]),
});
export const ANON = new Expression({
  // '[' WS* ']'
  name: 'ANON',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.string('['), ebnf.zeroOrMore(WS), ebnf.string(']')]),
});
export const ECHAR = new Expression({
  // '\' [tbnrf"'\]
  name: 'ECHAR',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.string('\\'), ebnf.characterClass(/[tbnrf"'\\]/)]),
});
export const UCHAR = new Expression({
  // '\u' HEX HEX HEX HEX | '\U' HEX HEX HEX HEX HEX HEX HEX HEX
  name: 'UCHAR',
  terminal: true,
  lazy_expression: () => ebnf.or([ebnf.sequence([ebnf.string('\\u'), HEX, HEX, HEX, HEX]), ebnf.sequence([ebnf.string('\\U'), HEX, HEX, HEX, HEX, HEX, HEX, HEX, HEX])]),
});
export const STRING_LITERAL_LONG_QUOTE = new Expression({
  // '"""' (('"' | '""')? ([^"\] | ECHAR | UCHAR))* '"""'
  name: 'STRING_LITERAL_LONG_QUOTE',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.string('"""'), ebnf.zeroOrMore(ebnf.sequence([ebnf.optional(ebnf.or([ebnf.string('"'), ebnf.string('""')])), ebnf.or([ebnf.characterClass(/[^"\\]/), ECHAR, UCHAR])])), ebnf.string('"""')]),
});
export const STRING_LITERAL_LONG_SINGLE_QUOTE = new Expression({
  // "'''" (("'" | "''")? ([^'\] | ECHAR | UCHAR))* "'''"
  name: 'STRING_LITERAL_LONG_SINGLE_QUOTE',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.string("'''"), ebnf.zeroOrMore(ebnf.sequence([ebnf.optional(ebnf.or([ebnf.string("'"), ebnf.string("''")])), ebnf.or([ebnf.characterClass(/[^'\\]/), ECHAR, UCHAR])])), ebnf.string("'''")]),
});
export const STRING_LITERAL_SINGLE_QUOTE = new Expression({
  // "'" ([^#x27#x5C#xA#xD] | ECHAR | UCHAR)* "'" /* #x27=' #x5C=\ #xA=new line #xD=carriage return */
  name: 'STRING_LITERAL_SINGLE_QUOTE',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.string("'"), ebnf.zeroOrMore(ebnf.characterClass(/[^\x27\x5C\xA\xD]/), ECHAR, UCHAR), ebnf.string("'")]),
});
export const STRING_LITERAL_QUOTE = new Expression({
  // '"' ([^#x22#x5C#xA#xD] | ECHAR | UCHAR)* '"' /* #x22=" #x5C=\ #xA=new line #xD=carriage return */
  name: 'STRING_LITERAL_QUOTE',
  terminal: true,
  lazy_expression: () =>
    ebnf.sequence([
      ebnf.string('"'),
      ebnf.zeroOrMore(
        ebnf.or([
          ebnf.characterClass(/[^\x22\x5C\x0A\x0D]/),
          ECHAR,
          UCHAR])),
      ebnf.string('"')]),
});
export const EXPONENT = new Expression({
  // [eE] [+-]? [0-9]+
  name: 'EXPONENT',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.characterClass(/[eE]/), ebnf.optional(ebnf.characterClass(/[+-]/)), ebnf.oneOrMore(ebnf.characterClass(/[0-9]/))]),
});
export const DOUBLE = new Expression({
  // [+-]? ([0-9]+ '.' [0-9]* EXPONENT | '.' [0-9]+ EXPONENT | [0-9]+ EXPONENT)
  name: 'DOUBLE',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.optional(ebnf.characterClass(/[+-]/)), ebnf.or([ebnf.sequence([ebnf.oneOrMore(ebnf.characterClass(/[0-9]/)), ebnf.string('.'), ebnf.zeroOrMore(ebnf.characterClass(/[0-9]/)), EXPONENT]), ebnf.sequence([ebnf.string('.'), ebnf.oneOrMore(ebnf.characterClass(/[0-9]/)), EXPONENT]), ebnf.sequence([ebnf.oneOrMore(ebnf.characterClass(/[0-9]/)), EXPONENT])])]),
});
export const DECIMAL = new Expression({
  // [+-]? [0-9]* '.' [0-9]+
  name: 'DECIMAL',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.optional(ebnf.characterClass(/[+-]/)), ebnf.oneOrMore(ebnf.characterClass(/[0-9]/)), ebnf.string('.'), ebnf.oneOrMore(ebnf.characterClass(/[0-9]/))]),
});
export const INTEGER = new Expression({
  // [+-]? [0-9]+
  name: 'INTEGER',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.optional(ebnf.characterClass(/[+-]/)), ebnf.oneOrMore(ebnf.characterClass(/[0-9]/))]),
});
export const LANGTAG = new Expression({
  // '@' [a-zA-Z]+ ('-' [a-zA-Z0-9]+)*
  name: 'LANGTAG',
  terminal: true,
  lazy_expression: () =>
    ebnf.sequence([
      ebnf.string('@'),
      ebnf.oneOrMore(
        ebnf.characterClass(/[a-zA-Z]/)),
      ebnf.zeroOrMore(
        ebnf.sequence([
          ebnf.string('-'),
          ebnf.oneOrMore(
            ebnf.characterClass(/[a-zA-Z0-9]/))]))]),
});
export const BLANK_NODE_LABEL = new Expression({
  // '_:' (PN_CHARS_U | [0-9]) ((PN_CHARS | '.')* PN_CHARS)?
  name: 'BLANK_NODE_LABEL',
  terminal: true,
  lazy_expression: () =>
    ebnf.sequence([
      ebnf.string('_:'),
      ebnf.or([
        PN_CHARS_U,
        ebnf.characterClass(/[0-9]/)]),
      ebnf.optional(
        ebnf.sequence([
          ebnf.zeroOrMore(
            ebnf.or([
              PN_CHARS,
              ebnf.string('.')])),
          PN_CHARS]))]),
});
export const PNAME_NS = new Expression({
  // PN_PREFIX? ':'
  name: 'PNAME_NS',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.optional(PN_PREFIX), ebnf.string(':')]),
});
export const PNAME_LN = new Expression({
  // PNAME_NS PN_LOCAL
  name: 'PNAME_LN',
  terminal: true,
  lazy_expression: () => ebnf.sequence([PNAME_NS, PN_LOCAL]),
});
export const IRIREF = new Expression({
  // '<' ([^#x00-#x20<>"{}|^`\] | UCHAR)* '>' /* #x00=NULL #01-#x1F=control codes #x20=space */
  name: 'IRIREF',
  terminal: true,
  lazy_expression: () => ebnf.sequence([ebnf.string('<'), ebnf.zeroOrMore(ebnf.or([ebnf.characterClass(/[^\x00-\x20<>"{}|^`\\]/), UCHAR])), ebnf.string('>')]),
});




export const BlankNode = new Expression({
  // BLANK_NODE_LABEL | ANON
  name: 'BlankNode',
  terminal: false,
  lazy_expression: () => ebnf.or([BLANK_NODE_LABEL, ANON]),
});
export const PrefixedName = new Expression({
  // PNAME_LN | PNAME_NS
  name: 'PrefixedName',
  terminal: false,
  lazy_expression: () => ebnf.or([PNAME_LN, PNAME_NS]),
});
export const iri = new Expression({
  // IRIREF | PrefixedName
  name: 'iri',
  terminal: false,
  lazy_expression: () => ebnf.or([IRIREF, PrefixedName]),
});
export const String = new Expression({
  // STRING_LITERAL_QUOTE | STRING_LITERAL_SINGLE_QUOTE | STRING_LITERAL_LONG_SINGLE_QUOTE | STRING_LITERAL_LONG_QUOTE
  name: 'String',
  terminal: false,
  lazy_expression: () => ebnf.or([STRING_LITERAL_QUOTE, STRING_LITERAL_SINGLE_QUOTE, STRING_LITERAL_LONG_SINGLE_QUOTE, STRING_LITERAL_LONG_QUOTE]),
});
export const BooleanLiteral = new Expression({
  // 'true' | 'false'
  name: 'BooleanLiteral',
  terminal: false,
  lazy_expression: () => ebnf.or([ebnf.string('true'), ebnf.string('false')]),
});
export const RDFLiteral = new Expression({
  // String (LANGTAG | '^^' iri)?
  name: 'RDFLiteral',
  terminal: false,
  lazy_expression: () => ebnf.sequence([String, ebnf.optional(ebnf.or([LANGTAG, ebnf.sequence([ebnf.string('^^'), iri])]))]),
});
export const NumericLiteral = new Expression({
  // INTEGER | DECIMAL | DOUBLE
  name: 'NumericLiteral',
  terminal: false,
  lazy_expression: () => ebnf.or([INTEGER, DECIMAL, DOUBLE]),
});
export const literal = new Expression({
  // RDFLiteral | NumericLiteral | BooleanLiteral
  name: 'literal',
  terminal: false,
  lazy_expression: () => ebnf.or([RDFLiteral, NumericLiteral, BooleanLiteral]),
});
export const object = new Expression({
  // iri | BlankNode | collection | blankNodePropertyList | literal
  name: 'object',
  terminal: false,
  lazy_expression: () => ebnf.or([iri, BlankNode, collection, blankNodePropertyList, literal]),
});
export const collection = new Expression({
  // '(' object* ')'
  name: 'collection',
  terminal: false,
  lazy_expression: () => ebnf.wsequence([ebnf.string('('), ebnf.zeroOrMore(object), ebnf.string(')')]),
});
export const predicate = new Expression({
  // iri
  name: 'predicate',
  terminal: false,
  lazy_expression: () => iri,
});
export const subject = new Expression({
  // iri | BlankNode | collection
  name: 'subject',
  terminal: false,
  lazy_expression: () => ebnf.or([iri, BlankNode, collection]),
});
export const verb = new Expression({
  // predicate | 'a'
  name: 'verb',
  terminal: false,
  lazy_expression: () => ebnf.or([predicate, ebnf.string('a')]),
});
export const objectList = new Expression({
  // object (',' object)*
  name: 'objectList',
  terminal: false,
  lazy_expression: () => ebnf.wsequence([object, ebnf.zeroOrMore(ebnf.wsequence([ebnf.string(','), object]))]),
});
export const predicateObjectList = new Expression({
  // verb objectList (';' (verb objectList)?)*
  name: 'predicateObjectList',
  terminal: false,
  lazy_expression: () => ebnf.wsequence([verb, objectList, ebnf.zeroOrMore(ebnf.wsequence([ebnf.string(';'), ebnf.optional(ebnf.wsequence([verb, objectList]))]))]),
});
export const blankNodePropertyList = new Expression({
  // '[' predicateObjectList ']'
  name: 'blankNodePropertyList',
  terminal: false,
  lazy_expression: () => ebnf.wsequence([ebnf.string('['), predicateObjectList, ebnf.string(']')]),
});
export const triples = new Expression({
  // subject predicateObjectList | blankNodePropertyList predicateObjectList?
  name: 'triples',
  terminal: false,
  lazy_expression: () => ebnf.or([ebnf.wsequence([subject, predicateObjectList]), ebnf.wsequence([blankNodePropertyList, ebnf.optional(predicateObjectList)])]),
});
export const sparqlPrefix = new Expression({
  // "PREFIX" PNAME_NS IRIREF
  name: 'sparqlPrefix',
  terminal: false,
  lazy_expression: () => ebnf.wsequence([ebnf.caseInsensitiveString('PREFIX'), PNAME_NS, IRIREF]),
});
export const sparqlBase = new Expression({
  // "BASE" IRIREF
  name: 'sparqlBase',
  terminal: false,
  lazy_expression: () => ebnf.wsequence([ebnf.caseInsensitiveString('BASE'), IRIREF]),
});
export const base = new Expression({
  // '@base' IRIREF '.'
  name: 'base',
  terminal: false,
  lazy_expression: () => ebnf.wsequence([ebnf.string('@base'), IRIREF, ebnf.string('.')]),
});
export const prefixID = new Expression({
  // '@prefix' PNAME_NS IRIREF '.'
  name: 'prefixID',
  terminal: false,
  lazy_expression: () => ebnf.wsequence([ebnf.string('@prefix'), PNAME_NS, IRIREF, ebnf.string('.')]),
});
export const directive = new Expression({
  // prefixID | base | sparqlPrefix | sparqlBase
  name: 'directive',
  terminal: false,
  lazy_expression: () => ebnf.or([prefixID, base, sparqlPrefix, sparqlBase]),
});
export const statement = new Expression({
  // directive | triples '.'
  name: 'statement',
  terminal: false,
  lazy_expression: () => ebnf.or([directive, ebnf.wsequence([triples, ebnf.string('.')])]),
});
export const turtleDoc = new Expression({
  // statement*
  name: 'turtleDoc',
  terminal: false,
  lazy_expression: () => ebnf.zeroOrMore(statement),
});
