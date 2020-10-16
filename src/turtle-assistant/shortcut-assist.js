export const finishStatementWithSpace = function(changeset, next) {
  // Object just finished and the user typed a space (finish with dot automatically)
  // Only do this on the last character entered to avoid messing up pasted text chunks
  if (
    /\s/.test(changeset.nextChar())
    && changeset.change.length === changeset.parser.text.length + 1
    && changeset.parser.someAccepting('object')
  ) {
    // Replace latest entry with added newline
    changeset.replaceChar(' .\n');
    return;
  }
  next();
}

export const all = [
  finishStatementWithSpace,
]
