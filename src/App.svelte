<svelte:options tag="turtle-editor" />

<script>
  export let name = 'Kilroy';
</script>

<main>
Hello {name}!
</main>
<pre>
  <slot></slot>
</pre>