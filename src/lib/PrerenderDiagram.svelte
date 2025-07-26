<script lang="ts">
    import { setContext } from "svelte";
    import type { DiagramProps } from "./Diagram.svelte";
    import { vector2 } from "./diagram-lib.js";

    let { nodes, edges, children }: DiagramProps = $props();

    setContext("nodeMap", () => nodes);
    setContext("edgeMap", () => edges);
    setContext("dimensions", () => ({
        min: vector2(0, 0),
        max: vector2(0, 0),
    }));
    setContext("prerendering", true);
</script>

<template>
    {@render children()}
</template>

<svelte:boundary>
    {@const _ = setContext("prerendering", false)}
</svelte:boundary>
