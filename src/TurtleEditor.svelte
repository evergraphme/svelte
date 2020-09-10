<svelte:options tag="turtle-editor" />

<script>
  import { onMount } from 'svelte';
  const ace = require('ace-custom-element/dist/index.umd.js');
  // const ace = require('../../vendors/ajaxorg/ace/ace');
  // ace.config.setModuleUrl('ace/mode/javascript', require('../../vendors/ajaxorg/ace/mode-javascript.js'))
  // ace.config.setModuleUrl('ace/theme/monokai', require('../../vendors/ajaxorg/ace/theme-monokai.js'))
  // import 'ace-builds/src-noconflict/ace/mode-turtle';
  // require('../../vendors/ajaxorg/ace/mode-turtle');
  // import 'ace-builds/src-noconflict/ace/ext-language_tools';
  // const ext = require('../../vendors/ajaxorg/ace/ext-language_tools');
  // require('../../vendors/ajaxorg/ace/theme-monokai');

  let editorElement;

  onMount(async () => {
    const editor = ace.edit(editorElement);
    editor.setTheme("ace/theme/monokai");
    // editor.session.setMode("ace/mode/turtle");
    editor.session.setUseWorker(false);
    // editor.setOptions({enableLiveAutocompletion: [{
    //   getCompletions: function(editor, session, pos, prefix, callback) {
    //     console.log('complete me', prefix);
    //     callback(null, [
    //       {
    //           // caption: 'xyz',
    //           value: prefix + 'more',
    //           // score: 3,
    //           // meta: 'hello',
    //       },
    //     ]);
    //   }
    // }]});

    editor.session.on('change', function(delta) {
    // delta.start, delta.end, delta.lines, delta.action
      console.log(delta);
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

<ace-editor id="editor" theme="ace/theme/monokai" value="console.log('hello world');"></ace-editor>
