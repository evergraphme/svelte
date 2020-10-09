export const shortcut = function(parser, assistant) {
  const char = parser.text[parser.text.length - 1];

  // Object just finished and the user typed a space (finish with dot automatically)
  if (char === ' ' && parser.justCompleted('object')) {
    // Replace latest entry with added newline
    assistant.replace(' .\n');
  }
}
