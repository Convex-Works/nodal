<script lang="ts">
    import "../../app.css";
    import type { PageProps } from "./$types.js";

    const { data }: PageProps = $props();
    console.log({ data });
</script>

<p>
    A Svelte 5 library for creating interactive node diagrams with customizable
    connections and layouts
</p>

<h1 class="text-2xl mt-10 mb-4">Examples</h1>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each Object.values(data.examples!) as example}
        <div>
            <a href={example.href} class="block mb-2">
                <span class="text-blue-500 hover:underline">{example.name}</span
                >
            </a>

            <example.content />
        </div>
    {/each}
</div>
