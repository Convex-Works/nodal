<script lang="ts">
    import "../../app.css";

    let { children } = $props();
</script>

<div class="container mx-auto p-1">
    <div class="mt-4 flex justify-between">
        <a
            class="text-lg mb-5 bg-amber-100 px-4 py-1 text-amber-800 w-fit rounded block"
            href="/"
        >
            <span class="mr-2"> 🦔 </span>
            nodal
        </a>
        <div class="flex gap-4">
            <a href="https://github.com/Convex-Works/nodal"> Github </a>
            <a href="https://jsr.io/@cnvx/nodal"> JSR </a>
        </div>
    </div>

    {@render children()}
</div>
