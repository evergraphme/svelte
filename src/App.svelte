<svelte:options tag="turtle-editor" />

<script>
  export let name = 'Kilroy';
</script>

<style>
  main {
    color: red;
  }
  .box {
    color: blue;
  }
</style>

<main>
Hello {name}!
<div class="box">
  <slot>
    <em>no content was provided</em>    
  </slot>
</div>
</main>
