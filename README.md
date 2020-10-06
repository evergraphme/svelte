# Evergraph Turtle Editor

This is a work in progress towards a web component for editing turtle (RDF) documents easier than before.

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
