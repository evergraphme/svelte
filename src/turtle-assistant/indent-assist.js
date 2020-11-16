export const indentAfterSubject = function(changeset, next) {
  // Subject just finished and the user typed a whitespace
  if (/\s/.test(changeset.nextChar()) && changeset.parser.someAccepting('subject') && !changeset.parser.someAccepting('directive')) {
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

export const indentAfterDot = function(changeset, next) {
  if (changeset.upcoming(/\.\s/) && changeset.parser.someAccepting('object') && !changeset.parser.someAccepting('String')) {
    // Add space before dot to avoid confusing parser
    changeset.replaceChar(' .');
  }
  next();
  // Statement finished by entering the last dot
  if (changeset.lastChar() === '.' && changeset.parser.satisfied) {
    // Replace latest entry with indentation
    changeset.add('\n');
  }
}

export const indentAfterSemicolon = function(changeset, next) {
  // Object just finished and the user typed a semi-colon
  if (changeset.nextChar() === ';' && changeset.parser.someAccepting('object') && !changeset.parser.someAccepting('String')) {
    // Add indentation
    changeset.add('\n  ');
    return;
  }
  next();
}

export const indentAfterComma = function(changeset, next) {
  // Object just finished and the user typed a comma
  if (changeset.nextChar() === ',' && changeset.parser.someAccepting('object') && !changeset.parser.someAccepting('String')) {
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
  // Invalid whitespace blocked by parser
  // Indentation rules above take care of weird whitespace
  // The rest should be managable by only allowing a single space in all other places
  if (/\s/.test(changeset.nextChar())) {
    if (changeset.parser.text.length === 0) {
      // Remove leading whitespace
      changeset.replaceFromStart(
          changeset.parser.text.substring(0, changeset.parser.text.length));
      return;
    }
    if (/\s/.test(changeset.lastChar()) && changeset.parser.collect(p => p.comment).length === 0) {
      // Only one whitespace at a time (unless in a comment)
      changeset.replaceFromStart(
          changeset.parser.text.substring(0, changeset.parser.text.length));
      return;
    }
    if (changeset.upcoming(/\s+[;,]/) && changeset.parser.someAccepting('object')) {
      // No extra whitespace after objects (unless a dot is coming)
      changeset.replaceFromStart(
          changeset.parser.text.substring(0, changeset.parser.text.length));
      return;
    }
    if (!/ /.test(changeset.nextChar()) && changeset.parser.collect(p => p.comment).length === 0) {
      // Only space (unless in a comment)
      changeset.replaceChar(' ');
      return;
    }
  }
  next();
}

export const all = [
  indentAfterSubject,
  indentAfterPredicate,
  indentAfterDot,
  indentAfterSemicolon,
  indentAfterComma,
  blockWhitespace,
]
