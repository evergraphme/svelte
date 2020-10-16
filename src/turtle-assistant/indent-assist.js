export const indentAfterSubject = function(changeset, next) {
  // Subject just finished and the user typed a whitespace
  if (/\s/.test(changeset.nextChar()) && changeset.parser.someAccepting('subject')) {
    // Replace latest entry with indentation
    changeset.replaceChar('\n  ');
    return;
  }
  next();
}

export const indentAfterPredicate = function(changeset, next) {
  // Subject just finished and the user typed a whitespace
  if (/\s/.test(changeset.nextChar()) && changeset.parser.someAccepting('verb')) {
    // Replace latest entry with indentation
    changeset.replaceChar(' ');
    return;
  }
  next();
}

export const indentAfterObject = function(changeset, next) {
  // Subject just finished and the user typed a whitespace
  if (/\s/.test(changeset.nextChar()) && changeset.parser.someAccepting('object')) {
    // Replace latest entry with indentation
    changeset.replaceChar(' ');
    return;
  }
  next();
}

export const indentAfterDot = function(changeset, next) {
  next();
  // Statement finished by entering the last dot
  if (changeset.lastChar() === '.' && changeset.parser.satisfied) {
    // Replace latest entry with indentation
    changeset.add('\n');
  }
}

export const indentAfterSemicolon = function(changeset, next) {
  // Object just finished and the user typed a semi-colon
  if (changeset.nextChar() === ';' && changeset.parser.someAccepting('object')) {
    // Add indentation
    changeset.add('\n  ');
    return;
  }
  next();
}

export const indentAfterComma = function(changeset, next) {
  // Object just finished and the user typed a comma
  if (changeset.nextChar() === ',' && changeset.parser.someAccepting('object')) {
    if (changeset.parser.collect(p => p.accepting && p.fullName().endsWith('.sequence.object')).length > 0) {
      // This is not the first object, just add indentation
      changeset.add('\n    ');
    }
    else {
      // This is the first object, move object to new line and add indentation
      const object = changeset.parser.collect(p => p.accepting && p.expression.name === 'object')[0];
      changeset.replaceFromStart(
        changeset.parser.text.substring(0, changeset.parser.text.length - object.text.length - 1)
        + `\n    ${object.text},\n    `);
    }
    return;
  }
  next();
}

export const blockWhitespace = function(changeset, next) {
  if (
    /\s/.test(changeset.nextChar())
    && !changeset.parser.someAccepting('verb')
    && !changeset.parser.someAccepting('object')
  ) {
    changeset.replaceFromStart(
        changeset.parser.text.substring(0, changeset.parser.text.length));
    return;
  }
  next();
}

export const all = [
  indentAfterSubject,
  indentAfterPredicate,
  indentAfterObject,
  indentAfterDot,
  indentAfterSemicolon,
  indentAfterComma,
  blockWhitespace,
]
