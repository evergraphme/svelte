/*
  parser.text
  parser.text.length
  parser.expression.name
  parser.satisfied
*/

function get(parser, path, property = 'text') {
  const pathArray = path.split('.');
  let current = parser;
  for (let i = 0; current && i < pathArray.length; i++) {
    if (!current.wrapped) {
      return;
    }
    if (current.wrapped.expression && current.wrapped.expression.name === pathArray[i]) {
      current = current.wrapped;
    }
    else if (current.wrapped) {
      let found;
      for (let j = 0; !found && j < current.wrapped.length; j++) {
        if (current.wrapped[j].expression.name === pathArray[i]) {
          found = current = current.wrapped[j];
        }
      }
      if (! found) {
        return;
      }
    }
  }
  return current[property];
}

function getAll(parser, name, property = 'text') {
  let result = parser.expression.name === name ? [parser[property]] : [];
  if (parser.wrapped) {
    if (parser.wrapped.expression) {
      result.push(...getAll(parser.wrapped, name, property));
    }
    else {
      result.push(...parser.wrapped.map(p => getAll(p, name, property)).flat());
    }
  }
  return result;
}

export const indent = function(parser, actionable) {
  const char = parser.text[parser.text.length - 1];
  const subject = get(parser, 'statement.or.triples.sequence.subject');
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
  // Object just finihsed and the user typed a semi-colon
  else if (char === ';' && get(parser, 'statement.or.triples', 'satisfied')) {
    // Replace latest entry with added newline
    actionable.replace(';\n  ');
  }
  // Object just finihsed and the user typed a comma
  else if (char === ',' && lastObjectList && lastObjectList.endsWith(',')) {
    // Replace latest entry with added newline
    actionable.replace(',\n    ');
  }
  // Leading whitespace on line
  else if (char === ' ' && parser.text.length === 1) {
    // Undo
    actionable.undo();
  }
}
