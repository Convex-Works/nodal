<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import Diagram, { type DiagramNode, type DiagramEdge } from './Diagram.svelte';
	import { createRawSnippet, flushSync, onMount, setContext, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import PrerenderDiagram from './PrerenderDiagram.svelte';

	let {
		children,
		...rest
	}: {
		children: Snippet;
	} & HTMLAttributes<HTMLDivElement> = $props();

	const nodes = new SvelteMap<string, DiagramNode>();

	const edges = new SvelteMap<string, DiagramEdge>();

	// let initialDiagramContainer: HTMLElement;

	// onMount(() => {
	// 	initialDiagramContainer.remove();
	// });

	const initialTime = performance.now();
</script>

<!-- first time to register all the nodes and edges -->
<PrerenderDiagram {nodes} {edges} {children} />

<!-- second time to actually render it after we calculate all the relative positions and total widths and heights -->
<!-- this is necessary because we need to calculate the relative positions of the nodes and edges -->
<!-- TODO: Investigate how to do this properly with hydrate and mount and render https://svelte.dev/docs/svelte/imperative-component-api#hydrate -->
<div {...rest}>
	<Diagram {nodes} {edges}>
		{@render children()}
	</Diagram>
</div>
<!-- 
<svelte:boundary>
	{@const _ = console.log('Finished rendering diagram in', performance.now() - initialTime, 'ms')}
</svelte:boundary> -->
