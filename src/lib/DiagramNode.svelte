<script lang="ts">
    import {
        getContext,
        onMount,
        tick,
        type ComponentProps,
        type Snippet,
    } from "svelte";
    import type {
        DiagramNodeDef,
        DiagramEdgeParams,
        DiagramEdgeDef,
    } from "./Diagram.svelte";
    import type { SvelteMap } from "svelte/reactivity";
    import type { HTMLAttributes } from "svelte/elements";
    import { vector2, type Vector2 } from "./diagram-lib.js";

    // type IndividualConnectActionParam = string | Omit<DiagramEdge, 'source'>;
    type IndividualConnectActionParam =
        | string
        | (DiagramEdgeParams & { target: string });
    type IndividualConnectSourceActionParam =
        | string
        | (DiagramEdgeParams & { source: string });
    type DiagramNodeConnectParam =
        | IndividualConnectActionParam
        | IndividualConnectActionParam[];
    type DiagramNodeConnectSourceParam =
        | IndividualConnectSourceActionParam
        | IndividualConnectSourceActionParam[];

    export type DiagramNodeProps = {
        children?: Snippet;
        connect?: DiagramNodeConnectParam;
        connectSource?: DiagramNodeConnectSourceParam;
        autosize?: boolean;
        origin?: Vector2;
    } & Omit<DiagramNodeDef, "snippet"> &
        HTMLAttributes<HTMLDivElement>;

    let {
        children,
        connect,
        connectSource: connectFrom,
        id,
        x,
        y,
        width,
        height,
        autosize,
        clientOnly,
        origin,
        class: className,
        style: inlineStyles,
        ...rest
    }: DiagramNodeProps = $props();

    const nodeMap = (
        getContext("nodeMap") as () => SvelteMap<string, DiagramNodeDef>
    )();
    const edgeMap = (
        getContext("edgeMap") as () => SvelteMap<string, DiagramEdgeDef>
    )();
    let dimensions = (
        getContext("dimensions") as () =>
            | { min: Vector2; max: Vector2 }
            | undefined
    )();

    if (!origin && (width || height) && !autosize) {
        origin = vector2(0.5, 0.5);
    }

    let absolutePosition = $derived({
        x: x - (origin?.x ?? 0.5) * (width ?? 0),
        y: y - (origin?.y ?? 0.5) * (height ?? 0),
    });

    // const nodeDef: DiagramNode = $derived({ id, x, y, width, height, clientOnly, snippet: children });
    const nodeDef: DiagramNodeDef = $derived({
        id,
        x: absolutePosition.x,
        y: absolutePosition.y,
        width,
        height,
        clientOnly: clientOnly || autosize,
        snippet: children,
    });

    const prerender = $state.snapshot(!!getContext("prerendering"));
    console.log("Prerendering? ", prerender);

    // console.log('set', nodeDef.id, nodeDef);

    // const source = elementNodeMap.get(element);
    // if (!source) {
    // 	return console.warn(`Could not find source element for`, element);
    // }

    let mounted = $state(false);

    const previousEdgeIds = new Set();

    // TODO: this should be done only if clientWidth is needed
    let clientWidth: number = $state(0);
    let clientHeight: number = $state(0);

    // if (origin) {
    // 	nodeDef.x -= (origin?.x ?? 0) * $state.snapshot(nodeDef.width ?? 0);
    // 	nodeDef.y -= (origin?.y ?? 0) * $state.snapshot(nodeDef.height ?? 0);
    // }

    if (autosize) {
        onMount(() => {
            width = clientWidth;
            height = clientHeight;
        });
    }

    onMount(async () => {
        if (nodeDef.clientOnly) {
            await tick();
            mounted = true;
        }
    });

    function updateEdgeFrom(
        param: IndividualConnectSourceActionParam,
        index: number = 0,
    ) {
        const getEdgeId = (source: string, i: number) =>
            `${source}:${nodeDef.id}:(${i})`;
        // const edgeId = getEdgeId();
        if (typeof param == "string") {
            const source = param;

            const edgeId = getEdgeId(source, index);
            previousEdgeIds.add(edgeId);

            edgeMap.set(edgeId, { target: nodeDef.id, source });
        } else {
            const edgeId = getEdgeId(param.source, index);
            previousEdgeIds.add(edgeId);

            (param as DiagramEdgeDef).target = nodeDef.id;
            edgeMap.set(edgeId, param as DiagramEdgeDef);
        }
    }

    function updateEdge(
        param: IndividualConnectActionParam,
        index: number = 0,
    ) {
        const getEdgeId = (target: string, i: number) =>
            `${nodeDef.id}:${target}:(${i})`;
        // const edgeId = getEdgeId();
        if (typeof param == "string") {
            const target = param;

            const edgeId = getEdgeId(target, index);
            previousEdgeIds.add(edgeId);

            edgeMap.set(edgeId, { source: nodeDef.id, target });
        } else {
            const edgeId = getEdgeId(param.target, index);
            previousEdgeIds.add(edgeId);

            (param as DiagramEdgeDef).source = nodeDef.id;
            edgeMap.set(edgeId, param as DiagramEdgeDef);
        }
    }

    if (connect) {
        if (!Array.isArray(connect)) {
            updateEdge(connect);
        } else {
            connect.forEach(updateEdge);
        }
    }

    if (connectFrom) {
        if (!Array.isArray(connectFrom)) {
            updateEdgeFrom(connectFrom);
        } else {
            connectFrom.forEach(updateEdgeFrom);
        }
    }

    let left = $derived(nodeDef.x - (dimensions?.min.x ?? 0));
    let top = $derived(nodeDef.y - (dimensions?.min.y ?? 0));

    nodeMap.set(nodeDef.id, nodeDef);
    $effect(() => {
        nodeMap.set(nodeDef.id, nodeDef);
    });

    // $inspect(
    // 	'mounted render diagramNode',
    // 	nodeDef.id,
    // 	left,
    // 	top,
    // 	nodeDef.width,
    // 	nodeDef.height,
    // 	dimensions
    // );
</script>

<div
    class={className?.toString() || ""}
    style={`position:absolute;
${!origin ? "transform:translate(-50%, -50%)" : ""};
top:${top}px;left:${left}px;${nodeDef.clientOnly && !mounted ? "opacity:0" : ""} ${inlineStyles || ""}`}
    style:width={nodeDef.width ? nodeDef.width + "px" : "auto"}
    style:height={nodeDef.height ? nodeDef.height + "px" : "auto"}
    {...rest}
>
    {#if autosize}
        <div
            class="nodal-autosize"
            style="position:absolute;top:0;right:0;left:0;bottom:0;z-index:-50;"
            bind:clientWidth
            bind:clientHeight
        ></div>
    {/if}
    <!-- <div class="absolute top-0 left-0 w-full h-full bg-red-500"> {nodeDef.clientOnly} {mounted}</div> -->
    {@render children?.()}
</div>
