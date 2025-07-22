<script lang="ts">
  import "../app.css"
    import type { PageProps } from "./$types";

    const {
      data
    }: PageProps = $props();
    console.log('data', data.examples)
    // const examples = import.meta.glob("../examples/*.svx", {
    //     eager: true,
    // });
</script>

<p>
    A Svelte 5 library for creating interactive node diagrams with customizable connections and layouts
</p>

<h1 class="text-2xl mt-10 mb-4"> Examples </h1>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each data.examples as { href, name, path }}
        <div>

        <a {href} class="block mb-2">
            <span class="text-blue-500 hover:underline">{name}</span>
        </a>
        {#await import(path) then example}
            {@render example.default()}
        {:catch error}
            <p class="text-red-500">Error loading example: {error.message}</p>
        {/await}
        </div>
    {/each}

</div>
