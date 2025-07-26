<script lang="ts">
    import { getContext, onMount, tick, type Snippet } from "svelte";
    import type {
        DiagramNodeDef,
        DiagramEdgeParams,
        DiagramEdgeDef,
    } from "./Diagram.svelte";
    import type { SvelteMap } from "svelte/reactivity";
    import type { HTMLAttributes } from "svelte/elements";
    import { vector2, type Vector2 } from "./diagram-lib.js";

    type IndividualConnectActionParam =
        | string
        | (DiagramEdgeParams & { target: string })
        | (DiagramEdgeParams & { source: string });

    type DiagramNodeConnectParam =
        | IndividualConnectActionParam
        | IndividualConnectActionParam[];

    export type DiagramNodeProps = {
        children?: Snippet;
        connect?: DiagramNodeConnectParam;
        autosize?: boolean;
        origin?: Vector2;
    } & Omit<DiagramNodeDef, "snippet"> &
        HTMLAttributes<HTMLDivElement>;

    let {
        children,
        connect,
        // connectSource: connectFrom,
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

    const nodeDef: DiagramNodeDef = $derived({
        id,
        x: absolutePosition.x,
        y: absolutePosition.y,
        width,
        height,
        clientOnly: clientOnly || autosize,
        snippet: children,
    });

    let mounted = $state(false);
    const previousEdgeIds = new Set();

    // TODO: this should be done only if clientWidth is needed
    let clientWidth: number = $state(0);
    let clientHeight: number = $state(0);

    // if (origin) {
    // 	nodeDef.x -= (origin?.x ?? 0) * $state.snapshot(nodeDef.width ?? 0);
    // 	nodeDef.y -= (origin?.y ?? 0) * $state.snapshot(nodeDef.height ?? 0);
    // }

    onMount(async () => {
        if (autosize) {
            width = clientWidth;
            height = clientHeight;
        }

        if (nodeDef.clientOnly) {
            await tick();
            mounted = true;
        }
    });

    function updateEdge(
        param: IndividualConnectActionParam,
        index: number = 0,
    ) {
        const selfId = nodeDef.id;
        const getEdgeId = ({
            source,
            target,
            index,
        }: {
            source: string;
            target: string;
            index: number;
        }) => `${source}:${target}:(${index})`;

        if (typeof param == "string") {
            const target = param;

            const edgeId = getEdgeId({ source: selfId, target, index });
            previousEdgeIds.add(edgeId);

            edgeMap.set(edgeId, { source: nodeDef.id, target });
        } else if ("target" in param) {
            // const edgeId = getEdgeId(param.target, index);
            const edgeId = getEdgeId({
                source: selfId,
                target: param.target,
                index,
            });
            previousEdgeIds.add(edgeId);
            (param as DiagramEdgeDef).source = nodeDef.id;
            edgeMap.set(edgeId, param as DiagramEdgeDef);
        } else if ("source" in param) {
            const edgeId = getEdgeId({
                source: param.source,
                target: selfId,
                index,
            });
            previousEdgeIds.add(edgeId);
            (param as DiagramEdgeDef).target = selfId;
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
