# Evergraph Turtle Editor

This is a work in progress towards a web component for editing turtle (RDF) documents easier than before. The evergraph prefix comes from my dream of breaking down the barriers between information - both data and logic - produced and consumed across the globe.

Try it out at https://evergraphme.github.io/turtle-editor/

# Input assistance

The editor will try to assist input to increase input speed, ensure validity and improve readability.

## Indentation

The editor will indent as you type to follow the following indentation pattern. Extraneous whitespace will be ignored/removed.

```
subject
  predicate object ;
  predicate
    object,
    object .
```
