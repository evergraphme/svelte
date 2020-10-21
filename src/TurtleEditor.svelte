<svelte:options tag="turtle-editor" />

<script>
  import { tick, onMount } from 'svelte';
  import { TurtleAssistant } from './turtle-assistant';
  const ace = require('ace-custom-element/dist/index.umd.js');
  require('ace-custom-element/dist/ace/ext-language_tools');
  require('ace-custom-element/dist/ace/theme-chrome');
  require('ace-custom-element/dist/ace/mode-turtle');
  const N3 = require('n3');
  const streamParser = new N3.StreamParser();

  let editorElement;
  export let content;

  function whenConnected() {
    if (!editorElement.isConnected) {
      setTimeout(whenConnected, 10);
    }
    else {
      const editor = editorElement.editor;
      const assistant = new TurtleAssistant({editor});
      editor.session.setUseWorker(false);
      editor.selection.clearSelection();
      editor.setOptions({
        // enableLiveAutocompletion: [{
        //   getCompletions: function(editor, session, pos, prefix, callback) {
        //     // console.log('complete me', prefix);
        //     callback(null, [
        //       {
        //           // caption: 'xyz',
        //           value: prefix + 'more',
        //           // score: 3,
        //           // meta: 'hello',
        //       },
        //     ]);
        //   }
        // }],
        fontSize: '14pt',
      });
      editor.insert(content);
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
>
</ace-editor>
  <!-- value="@base &lt;http://example.org/> .&#13;@prefix rdf: &lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#> .&#13;@prefix rdfs: &lt;http://www.w3.org/2000/01/rdf-schema#> .&#13;@prefix foaf: &lt;http://xmlns.com/foaf/0.1/> .&#13;@prefix rel: &lt;http://www.perceive.net/schemas/relationship/> .&#13;&#13;&lt;#green-goblin>&#13;    rel:enemyOf &lt;#spiderman> ;&#13;    a foaf:Person ;    # in the context of the Marvel universe&#13;    foaf:name &quot;Green Goblin&quot; .&#13;&#13;&lt;#spiderman>&#13;    rel:enemyOf &lt;#green-goblin> ;&#13;    a foaf:Person ;&#13;    foaf:name &quot;Spiderman&quot;, &quot;Человек-паук&quot;@ru ." -->
