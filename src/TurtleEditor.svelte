<svelte:options tag="turtle-editor" />

<script>
  import { tick, onMount } from 'svelte';
  const ace = require('ace-custom-element/dist/index.umd.js');
  require('ace-custom-element/dist/ace/ext-language_tools');
  require('ace-custom-element/dist/ace/theme-chrome');
  require('ace-custom-element/dist/ace/mode-turtle');

  let editorElement;

  function whenConnected() {
    if (!editorElement.isConnected) {
      setTimeout(whenConnected, 10);
    }
    else {
      const editor = editorElement.editor;
      editor.session.setUseWorker(false);
      editor.selection.clearSelection();
      editor.setOptions({enableLiveAutocompletion: [{
        getCompletions: function(editor, session, pos, prefix, callback) {
          console.log('complete me', prefix);
          callback(null, [
            {
                // caption: 'xyz',
                value: prefix + 'more',
                // score: 3,
                // meta: 'hello',
            },
          ]);
        }
      }]});

      editor.session.on('change', function(delta) {
      // delta.start, delta.end, delta.lines, delta.action
        // console.log(delta);
        if (delta.action === 'insert' && delta.lines[0] === 'x') {
          editor.undo();
          editor.insert(' .\n');
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
  value="@base &lt;http://example.org/> .&#13;@prefix rdf: &lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#> .&#13;@prefix rdfs: &lt;http://www.w3.org/2000/01/rdf-schema#> .&#13;@prefix foaf: &lt;http://xmlns.com/foaf/0.1/> .&#13;@prefix rel: &lt;http://www.perceive.net/schemas/relationship/> .&#13;&#13;&lt;#green-goblin>&#13;    rel:enemyOf &lt;#spiderman> ;&#13;    a foaf:Person ;    # in the context of the Marvel universe&#13;    foaf:name &quot;Green Goblin&quot; .&#13;&#13;&lt;#spiderman>&#13;    rel:enemyOf &lt;#green-goblin> ;&#13;    a foaf:Person ;&#13;    foaf:name &quot;Spiderman&quot;, &quot;Человек-паук&quot;@ru ."></ace-editor>
