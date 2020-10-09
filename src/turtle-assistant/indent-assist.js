/*
  parser.text
  parser.text.length
  parser.expression.name
  parser.satisfied
*/

function get(parser, path, property) {
  const pathArray = path.split('.');
  let current = parser;
  for (let i = 0; current && i < pathArray.length; i++) {
    if (!current.children) {
      return;
    }
    if (current.children.expression && current.children.expression.name === pathArray[i]) {
      current = current.children;
    }
    else if (current.children) {
      let found;
      for (let j = 0; !found && j < current.children.length; j++) {
        if (current.children[j].expression.name === pathArray[i]) {
          found = current = current.children[j];
        }
      }
      if (! found) {
        return;
      }
    }
  }
  return property ? current[property] : current;
}

function getAll(parser, name, property) {
  let result = parser.expression.name === name ? property ? [parser[property]] : [parser] : [];
  if (parser.children) {
    if (parser.children.expression) {
      result.push(...getAll(parser.children, name, property));
    }
    else {
      result.push(...parser.children.map(p => getAll(p, name, property)).flat());
    }
  }
  return result;
}

export const indent = function(parser, actionable) {
  const char = parser.text[parser.text.length - 1];
  const subject = get(parser, 'statement.or.triples.sequence.subject', 'text');
  const objectLists = getAll(parser, 'objectList');
  const lastObjectList = objectLists[objectLists.length - 1];
  // Subject just finished and the user typed a whitespace
  if (char === ' ' && parser.text.length === subject.length + 1) {
    // Replace latest entry with indentation
    actionable.replace('\n  ');
  }
  // Statement finished by entering the last dot
  else if (char === '.' && parser.satisfied) {
    // Replace latest entry with added newline
    actionable.replace('.\n');
  }
  // Object just finished and the user typed a space (finish with dot automatically)
  else if (char === ' ' && get(parser, 'statement.or.triples', 'satisfied')) {
    // Replace latest entry with added newline
    actionable.replace(' .\n');
  }
  // Object just finished and the user typed a semi-colon
  else if (char === ';' && get(parser, 'statement.or.triples', 'satisfied')) {
    // Replace latest entry with added newline
    actionable.replace(';\n  ');
  }
  // (first) Object just finished and the user typed a comma
  // Last satisfied contains: objectList.object
  // Accepting ends with: objectList.zeroOrMore.sequence.object
  else if (char === ','
    && parser.collect(p => p.accepting && p.fullName().endsWith('.objectList.zeroOrMore.sequence.object')).length > 0
    && parser.collect(p => p.expression.terminal === false && p.valid && p.satisfied).pop().fullName().indexOf('objectList.object') > 0
  ) {
    // First object, move it to new row
    // Get pos and length of object
    // objectList.length - predicateObjectList gives predicate length
    const startColumn = 2 + get(parser, 'statement.or.triples.sequence.predicateObjectList.verb', 'text').length;
    const object = get(lastObjectList, 'object', 'text');
    const currentLineIndex = parser.text.split('\n').length - 1;
    actionable.replace(`\n    ${object},\n    `, {
      start: {
        row: currentLineIndex,
        column: startColumn,
      },
      end: {
        row: currentLineIndex,
        column: startColumn + object.length + 1,
      },
    });
  }
  // (not first) Object just finished and the user typed a comma
  // Accepting ends with: objectList.zeroOrMore.sequence.object
  else if (char === ','
    && parser.collect(p => p.accepting && p.fullName().endsWith('.objectList.zeroOrMore.sequence.object')).length > 0
  ) {
    // Not first object, just indent
    actionable.replace(',\n    ');
  }
  // Leading whitespace on line
  else if (char === ' ' && parser.text.length === 1) {
    // Undo
    actionable.undo();
  }
}
