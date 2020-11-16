const remainder = function(changeset) {
  return changeset.change.substring(changeset.parser.text.length);
}

export const finishStatementWithNewline = function(changeset, next) {
  // Object just finished and the user typed enter (finish with dot automatically)
  // Only do this on the last character entered to avoid messing up pasted text chunks
  if (
    (/^\n$/.test(remainder(changeset))
      || /^\s$/.test(remainder(changeset))
      && changeset.lastChar() === '.')
    && changeset.inserting
    && changeset.parser.someAccepting('object')
    && !changeset.parser.someAccepting('String')
  ) {
    // console.debug(`finishStatementWithNewline [${remainder(changeset)}]`);
    // Replace latest entry with dot and indentation
    if (changeset.lastChar() === '.') {
      changeset.replaceFromStart(
        changeset.parser.text.substring(0, changeset.parser.text.length - 1)
        + ' .\n', true);
    }
    else {
      changeset.replaceChar(' .\n');
    }
    return;
  }
  next();
}

export const spaceOnceForNewObject = function(changeset, next) {
  // Object just finished and the user typed a space
  // Only do this on the last character entered to avoid messing up pasted text chunks
  if (
    /^[\s,]+$/.test(remainder(changeset))
    && changeset.inserting
    // /[ \t]/.test(changeset.nextChar())
    // && changeset.change.length === changeset.parser.text.length + 1
    && changeset.parser.someAccepting('object')
    && !changeset.parser.someAccepting('String')
  ) {
    // console.debug(`spaceOnceForNewObject [${remainder(changeset)}]`);
    if (changeset.parser.collect(p => p.accepting && p.fullName().endsWith('.sequence.object')).length > 0) {
      // This is not the first object, just add indentation
      changeset.replaceChar(',\n    ', true);
    }
    else {
      // This is the first object, move object to new line and add indentation
      const object = changeset.parser.collect(p => p.accepting && p.expression.name === 'object')[0];
      changeset.replaceFromStart(
        changeset.parser.text.substring(0, changeset.parser.text.length - object.text.length - 1)
        + `\n    ${object.text},\n    `, true);
    }
    return;
  }
  next();
}

export const spaceTwiceForNewPredicate = function(changeset, next) {
  // Object just finished and the user typed a space twice (add new predicate)
  // Only do this on the last character entered to avoid messing up pasted text chunks
  if (
    /^[\s;]+$/.test(remainder(changeset))
    && changeset.inserting
    // /[ \t]/.test(changeset.nextChar())
    // && changeset.change.length === changeset.parser.text.length + 1
    // accepting but empty: objectList.zeroOrMore.sequence.object
    && changeset.parser.collect(p => p.accepting && p.fullName().endsWith('objectList.zeroOrMore.sequence.object') && p.text.length === 0).length > 0
    && !changeset.parser.someAccepting('String')
  ) {
    // console.debug(`spaceTwiceForNewPredicate [${remainder(changeset)}]`);
    // Replace latest entry with semi-colon and indentation
    changeset.replaceFromStart(changeset.parser.text.replace(/\n *([^\s,]+),\n *$/, ' $1;\n  ', true));
    return;
  }
  next();
}

export const finishDirectiveStatementWithWhitespace = function(changeset, next) {
  // IRIREF just finished and the user typed whitespace (finish with dot automatically)
  // Only do this on the last character entered to avoid messing up pasted text chunks
  if (
    /^\s$/.test(remainder(changeset))
    && changeset.inserting
    && changeset.parser.someAccepting('IRIREF')
    && changeset.parser.someAccepting('directive')
  ) {
    // console.debug(`finishStatementWithNewline [${remainder(changeset)}]`);
    // Replace latest entry with dot and indentation
    changeset.replaceChar(' .\n');
    return;
  }
  next();
}

export const backspaceToDeleteEndOfStatement = function(changeset, next) {
  // User deleted some text and only whitespace and dot remains of statement
  // Delete whitespace and dot to match shortcut to end statement
  if (
    /^[\s.]+$/.test(remainder(changeset))
    && !changeset.inserting
    && changeset.parser.someAccepting('object')
  ) {
    // console.debug(`backspaceToDeleteEndOfStatement [${remainder(changeset)}]`);
    // Replace latest entry with semi-colon and indentation
    changeset.replaceFromStart(changeset.parser.text, true);
    return;
  }
  next();
}

export const backspaceToMoveBackFromNewPredicate = function(changeset, next) {
  // User deleted some text and only whitespace and dot remains of statement
  // Delete whitespace and dot to match shortcut to end statement
  if (
    /^[\s;]+$/.test(remainder(changeset))
    && !changeset.inserting
    && changeset.parser.someAccepting('object')
  ) {
    // console.debug(`backspaceToMoveBackFromNewPredicate [${remainder(changeset)}] parsertext[${changeset.parser.text}]`);
    // Replace latest entry with semi-colon and indentation
    const object = changeset.parser.collect(p => p.accepting && p.expression.name === 'object')[0];
    changeset.replaceFromStart(
      changeset.parser.text.substring(0, changeset.parser.text.length - object.text.length - 1)
      + `\n    ${object.text},\n    `, true);
    return;
  }
  next();
}
    // editor.insert(':s\n  :p :o;\n  ');
    // editor.session.remove({start: {row: 2, column: 1}, end: {row: 2, column: 2}});
    // expect(editor.getValue()).toBe(':s\n  :p\n    :o,\n    ');

export const backspaceToMoveBackFromNewObject = function(changeset, next) {
  // User deleted some text and only whitespace and dot remains of statement
  // Delete whitespace and dot to match shortcut to end statement
  if (
    /^[\s,]+$/.test(remainder(changeset))
    && !changeset.inserting
    && changeset.parser.someAccepting('object')
  ) {
    // console.debug(`backspaceToDeleteEndOfStatement [${remainder(changeset)}]`);
    // Replace latest entry with semi-colon and indentation
    changeset.replaceFromStart(changeset.parser.text, true);
    return;
  }
  next();
}

export const backspaceToDeleteEndOfDirectiveStatement = function(changeset, next) {
  // User deleted some text and only whitespace and dot remains of statement
  // Delete whitespace and dot to match shortcut to end statement
  if (
    /^[\s.]+$/.test(remainder(changeset))
    && !changeset.inserting
    && changeset.parser.someAccepting('directive')
  ) {
    // console.debug(`backspaceToDeleteEndOfStatement [${remainder(changeset)}]`);
    // Replace latest entry with semi-colon and indentation
    changeset.replaceFromStart(changeset.parser.text, true);
    return;
  }
  next();
}

export const all = [
  finishStatementWithNewline,
  spaceOnceForNewObject,
  spaceTwiceForNewPredicate,
  finishDirectiveStatementWithWhitespace,
  backspaceToDeleteEndOfStatement,
  backspaceToMoveBackFromNewPredicate,
  backspaceToMoveBackFromNewObject,
  backspaceToDeleteEndOfDirectiveStatement,
]
