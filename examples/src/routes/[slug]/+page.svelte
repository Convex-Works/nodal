<script lang="ts">
    const { data } = $props();
</script>

<svelte:head>
    <!-- <title>{data.meta.title}</title> -->
    <meta property="og:type" content="article" />
    <!-- <meta property="og:title" content={data.meta.title} /> -->
</svelte:head>


<hgroup class="mb-4">
    <h1 class="text-2xl">{data.meta?.title}</h1>
    <p> { data.meta?.description} </p>
</hgroup>

<div class="my-4">
    <data.content />
</div>

<div class="bg-gray-900 text-gray-50 rounded p-5">
    <pre><code>{data.code}</code></pre>
</div>
