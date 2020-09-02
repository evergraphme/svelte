<svelte:options tag="turtle-editor" />

<script>
  export let name = 'Kilroy';
</script>

<style>
  main {
    color: red;
  }
</style>

<main>
Hello {name}!
  <pre>
    <slot></slot>
  </pre>
</main>
