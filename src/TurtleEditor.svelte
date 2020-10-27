<svelte:options tag="turtle-editor" />

<script>
  import { createEventDispatcher, tick, onMount } from 'svelte';
  import { TurtleAssistant } from './turtle-assistant';
  const ace = require('ace-custom-element/dist/index.umd.js');
  require('ace-custom-element/dist/ace/ext-language_tools');
  require('ace-custom-element/dist/ace/theme-chrome');
  require('ace-custom-element/dist/ace/mode-turtle');

  const dispatch = createEventDispatcher();
  export let editorElement;
  export let content;
  export let dataset;

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
      dataset = () => { return assistant.dataset(); }
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
