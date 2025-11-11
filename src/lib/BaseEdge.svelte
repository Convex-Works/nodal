<script lang="ts" module>
    import type { SurfaceEdge } from "./Surface.svelte";

    export interface NodalEdgeProps {
        edge: SurfaceEdge;
        path: string;
    }
</script>

<script lang="ts">
    const { edge, path }: NodalEdgeProps = $props();
</script>

<path
    d={path}
    fill="none"
    stroke-width="2"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    shape-rendering="smooth"
    vector-effect="non-scaling-stroke"
    {...edge.svgPathAttributes || {}}
/>
