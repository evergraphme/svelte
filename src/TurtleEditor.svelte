<svelte:options tag="turtle-editor" />

<script>
  import { createEventDispatcher, tick, onMount } from 'svelte';
  import { TurtleAssistant } from './turtle-assistant';
  const ace = require('ace-custom-element/dist/index.umd.js');
  require('ace-custom-element/dist/ace/ext-language_tools');
  require('ace-custom-element/dist/ace/theme-chrome');
  require('ace-custom-element/dist/ace/mode-turtle');
  const N3 = require('n3');

  const dispatch = createEventDispatcher();
  export let editorElement;
  // Buffer user calls before the web component is initialized
  let buffer;
  export let text = (x) => buffer = x;
  export let dataset = (x) => buffer = x;
  export let onloaded;

  function generatePrefixes(dataset) {
    let prefixes = [];
    function extractPrefix(term) {
      if (term.termType === 'NamedNode') {
        const m = term.value.match(/^(.+[/:#])[^/:#]*$/);
        if (m && m[1] && !prefixes.includes(m[1])) {
          prefixes.push(m[1]);
        }
      }
    }
    dataset.forEach(q => {
      extractPrefix(q.subject);
      extractPrefix(q.predicate);
      extractPrefix(q.object);
    });
    return prefixes.reduce((acc, cur, index) => {
      acc[`p${index}`] = cur;
      return acc;
    }, {});
  }

  function setText(editor, input) {
    if (typeof(input) === 'object') {
      // Expect a dataset
      const writer = new N3.Writer({ prefixes: generatePrefixes(input) });
      writer.addQuads(input.toArray());
      writer.end((error, result) => editor.setValue(result));
    }
    if (typeof(input) === 'string') {
      // Script tag used?
      let script;
      try {
        script = document.querySelector(input);
      }
      catch {
        // Ignore
      }
      if (script) {
        editor.setValue(script.text);
      }
      else {
        // Try inserting text as is
        editor.setValue(input);
      }
    }
  }

  function whenConnected() {
    if (!editorElement.isConnected) {
      setTimeout(whenConnected, 10);
    }
    else {
      const editor = editorElement.editor;
      const assistant = new TurtleAssistant({
        editor,
        changeHandler: (e) => { dispatch('change', e); }
      });
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
      // editor.session.selection.on('changeCursor', function(e) {
      //   console.log(e);
      // });

      // Insert turtle
      if (buffer) {
        setText(editor, buffer);
      }
      else if (typeof(text) !== 'function') {
        setText(editor, text);
      }

      // Get or set content as a RDF/JS dataset
      dataset = (input) => {
        if (input) {
          return setText(editor, input)
        }
        return assistant.dataset();
      }
      // Get or set content as turtle/text
      text = (input) => {
        if (input) {
          setText(editor, input)
        }
        return editor.getValue();
      }

      if (onloaded) {
        onloaded(this);
      }
    }
  }

  onMount(async () => {
    whenConnected();
  });
</script>

<style media="screen">
  #editor {
    /*height: 100%;*/
  }
</style>

<ace-editor
  id="editor"
  part="editor"
  theme="ace/theme/chrome"
  mode="ace/mode/turtle"
  bind:this={editorElement}
>
</ace-editor>
