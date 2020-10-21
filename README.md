# Evergraph Turtle Editor

This is a work in progress towards a web component for editing turtle (RDF) documents easier than before. The evergraph prefix comes from my dream of breaking down the barriers between information - both data and logic - produced and consumed across the globe.

Try it out at https://evergraphme.github.io/turtle-editor/

# Usage

```html
<html>
  <head>
    <title>Turtle Editor Example</title>
    <script type="text/javascript" src="https://evergraphme.github.io/turtle-editor/bundle.js"></script>
  </head>

  <body>
    <turtle-editor content="
@base &lt;http://example.org/> .
@prefix rdf: &lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: &lt;http://www.w3.org/2000/01/rdf-schema#> .
@prefix foaf: &lt;http://xmlns.com/foaf/0.1/> .
@prefix rel: &lt;http://www.perceive.net/schemas/relationship/> .

&lt;#green-goblin>
    rel:enemyOf &lt;#spiderman> ;
    a foaf:Person ;
    foaf:name 'Green Goblin' .

    &lt;#spiderman>
    rel:enemyOf &lt;#green-goblin> ;
    a foaf:Person ;
    foaf:name 'Spiderman', 'Человек-паук'@ru .
"/>
  </body>
</html>
```

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
## Shortcuts

* After an object, type enter to complete the statement (add ` .\n`)
* After an object, type space once to add another object (add `,\n    `)
* After an object, type space twice to add another predicate (add `;\n  `)
* Backspace after one of the above removes all the text and moves the cursor back to just after the object

# Alternatives

* https://perfectkb.github.io/yate/
