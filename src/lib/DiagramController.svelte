<script lang="ts">
    import { SvelteMap } from "svelte/reactivity";
    import Diagram, {
        type DiagramNodeDef,
        type DiagramEdgeDef,
    } from "./Diagram.svelte";
    import { onMount, setContext, type Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import PrerenderDiagram from "./PrerenderDiagram.svelte";

    type PassthroughDiagramControllerProps = ({
        eagerLoad?: boolean;
        rootMargin?: string;
        figureAttributes?: HTMLAttributes<HTMLElement>;
    } & (
        | {
              scaleToFit?: boolean;
              width?: never;
              height?: never;
          }
        | {
              scaleToFit?: never;
              width: number;
              height: number;
          }
    )) &
        Omit<HTMLAttributes<HTMLDivElement>, "width" | "height">;

    let {
        children,
        eagerLoad = false,
        scaleToFit,
        width,
        height,
        rootMargin = "100px", // start a bit before it enters the viewport
        figureAttributes = { inert: true, "aria-hidden": true },
        ...rest
    }: PassthroughDiagramControllerProps & { children: Snippet } = $props();

    const nodes = new SvelteMap<string, DiagramNodeDef>();
    const layers = new SvelteMap<number, Record<string, DiagramNodeDef>>();
    setContext("layerNodeMap", () => layers);
    const edges = new SvelteMap<string, DiagramEdgeDef>();

    let containerEl: HTMLDivElement | undefined = $state();

    // If we're SSR (not browser), or eagerLoad is false, render immediately.
    // Otherwise wait until after load + idle + intersection.
    let shouldRender = $derived(!eagerLoad);

    const initialTime = performance.now();

    onMount(() => {
        if (!eagerLoad || !containerEl) return;

        let io: IntersectionObserver | null = null;

        const idle = (fn: () => void) => {
            const ric = (window as any).requestIdleCallback as
                | ((cb: () => void) => number)
                | undefined;
            if (ric) ric(fn);
            else setTimeout(fn, 0);
        };

        const startObserving = () => {
            // In case the element is already visible at this moment
            io = new IntersectionObserver(
                (entries) => {
                    if (entries.some((e) => e.isIntersecting)) {
                        shouldRender = true;
                        io?.disconnect();
                        io = null;
                    }
                },
                { root: null, rootMargin, threshold: 0 },
            );
            io.observe(containerEl!);
        };

        if (document.readyState === "complete") {
            idle(startObserving);
        } else {
            // Wait until the whole document (including images) has loaded
            window.addEventListener("load", () => idle(startObserving), {
                once: true,
            });
        }

        return () => {
            io?.disconnect();
            io = null;
        };
    });
</script>

{#if shouldRender}
    <!-- first pass: register all the nodes and edges -->
    <PrerenderDiagram {nodes} {edges} {children} {figureAttributes} />

    <!-- second pass: render with computed positions -->
    <div {...rest}>
        <Diagram
            {nodes}
            {edges}
            {scaleToFit}
            {width}
            {height}
            {figureAttributes}
        >
            {@render children()}
        </Diagram>
    </div>
{:else}
    <!-- Lightweight placeholder / container used for intersection observation. -->
    <div bind:this={containerEl} {...rest} style="min-height: 1px;"></div>
{/if}

<!--
<svelte:boundary>
	{@const _ = console.log('Finished rendering diagram in', performance.now() - initialTime, 'ms')}
</svelte:boundary>
-->
