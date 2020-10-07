<svelte:options tag="turtle-editor" />

<script>
  import { tick, onMount } from 'svelte';
  import { indent } from './turtle-assistant/indent-assist';
  import { turtle } from './turtle-parser';
  const ace = require('ace-custom-element/dist/index.umd.js');
  require('ace-custom-element/dist/ace/ext-language_tools');
  require('ace-custom-element/dist/ace/theme-chrome');
  require('ace-custom-element/dist/ace/mode-turtle');
  const N3 = require('n3');
  const streamParser = new N3.StreamParser();

  let editorElement;

  function whenConnected() {
    if (!editorElement.isConnected) {
      setTimeout(whenConnected, 10);
    }
    else {
      let parser = turtle.turtleDoc.test('');
      const editor = editorElement.editor;
      let assistedInput; // Used to detect assisted text changes
      editor.session.setUseWorker(false);
      editor.selection.clearSelection();
      editor.setOptions({
        enableLiveAutocompletion: [{
          getCompletions: function(editor, session, pos, prefix, callback) {
            // console.log('complete me', prefix);
            callback(null, [
              {
                  // caption: 'xyz',
                  value: prefix + 'more',
                  // score: 3,
                  // meta: 'hello',
              },
            ]);
          }
        }],
        fontSize: '14pt',
      });

      editor.session.on('change', function(delta) {
      // delta.start, delta.end, delta.lines, delta.action
        console.log(delta, assistedInput && assistedInput.replace('\n', '\\n'));
        if (assistedInput && assistedInput === delta.lines.join('\n')) {
          // Assisted input, e.g. indentation rules, should pass through
          // console.log('assisted input');
          assistedInput = undefined;
          return;
        }
        if (delta.lines.length !== 1 || delta.lines[0].length !== 1) {
          // We only handle single-character input for now due to parser limitation
          console.log('non-single-character-input undoed');
          assistedInput = delta.lines.join('\n');
          editor.session.undoChanges([delta], false);
          return;
        }
        const char = delta.lines[0];
        if (delta.action === 'insert') {
          const accepted = parser.push(char);
          if (!accepted) {
            // Undo input not accepted by parser
            console.log('not accepted by parser, undoed');
            assistedInput = char;
            editor.session.undoChanges([delta], false);
            return;
          }
          indent(parser, {
            undo: () => {
              console.log('undo assist');
              editor.session.undoChanges([delta], false);
            },
            replace: (replacement) => {
              console.log(`replacing [${char}] with [${replacement.replace('\n', '\\n')}]`)
              assistedInput = char;
              editor.session.undoChanges([delta], false);
              console.log('rreplace undo donne');
              assistedInput = replacement;
              editor.insert(replacement);
              console.log('rreplace isnert donne');
            },
          });
          // Parse a single statement at a time
          if (parser.satisfied) {
            parser = parser.expression.test('');
          }
        }
        // editor.insert("Something cool");
        // editor.selection.getCursor();
        // editor.session.replace(new ace.Range(0, 0, 1, 1), "new text");
        // editor.session.remove(new ace.Range(0, 0, 1, 1));
        // editor.session.insert({row:1,column:2}, "new text");
        // editor.undo();
      });

      // editor.session.selection.on('changeCursor', function(e) {
      //   console.log(e);
      // });
    }
  }

  onMount(async () => {
    whenConnected();
  });
</script>

<style media="screen">
  #editor {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: auto;
  }
</style>

<ace-editor
  id="editor"
  theme="ace/theme/chrome"
  mode="ace/mode/turtle"
  bind:this={editorElement}
></ace-editor>
  <!-- value="@base &lt;http://example.org/> .&#13;@prefix rdf: &lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#> .&#13;@prefix rdfs: &lt;http://www.w3.org/2000/01/rdf-schema#> .&#13;@prefix foaf: &lt;http://xmlns.com/foaf/0.1/> .&#13;@prefix rel: &lt;http://www.perceive.net/schemas/relationship/> .&#13;&#13;&lt;#green-goblin>&#13;    rel:enemyOf &lt;#spiderman> ;&#13;    a foaf:Person ;    # in the context of the Marvel universe&#13;    foaf:name &quot;Green Goblin&quot; .&#13;&#13;&lt;#spiderman>&#13;    rel:enemyOf &lt;#green-goblin> ;&#13;    a foaf:Person ;&#13;    foaf:name &quot;Spiderman&quot;, &quot;Человек-паук&quot;@ru ." -->
