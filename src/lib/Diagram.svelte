<script lang="ts" module>
    import { onMount, setContext, type Snippet } from "svelte";
    import { SvelteMap } from "svelte/reactivity";
    import {
        eq,
        getBezierPath,
        getSmoothStepPath,
        normaliseAngle,
        Side,
        sideForAngle,
        vector2,
        type Vector2,
        Anchor,
        browser,
        dev,
    } from "./diagram-lib.js";

    export interface DiagramNodeDef {
        id: string;
        x: number;
        y: number;
        width?: number;
        height?: number;

        // this will make the node and all of its connections only client side
        clientOnly?: boolean;
    }

    type PathGenParams =
        | {
              pathGen?: "bezier";
              curvature?: number;
              offset?: Vector2;
          }
        | {
              pathGen: "smoothstep";
              borderRadius?: number;
              center?: Vector2;
          };

    export type DiagramEdgeParams = {
        // target: string;
        snippet?: Snippet<[edge: DiagramEdgeDef, path: string, extra: any]>;
        snippetExtraArg?: any;

        sourceAnchor?: Vector2;
        targetAnchor?: Vector2;

        class?: string;
        style?: string;
        zIndex?: number;
    } & PathGenParams;

    export type DiagramEdgeDef = {
        source: string;
        target: string;
    } & DiagramEdgeParams;

    export type DiagramProps = {
        nodes: SvelteMap<string, DiagramNodeDef>;
        edges: SvelteMap<string, DiagramEdgeDef>;
        children: Snippet;
    };

    // const getNodeOrigin = (node: DiagramNode) => node.origin ?? vector2(0.0, 0.5);
    // export const getNodeOrigin = (node: DiagramNode) => node.origin ?? vector2(0.5, 0.5);
    // export const getNodeOrigin = (node: DiagramNode) => vector2(0.0, 0.0);

    const getNodeSize = (node: DiagramNodeDef) => ({
        x: node.width ?? 0,
        y: node.height ?? 0,
    });
</script>

<script lang="ts">
    let { nodes, edges, children }: DiagramProps = $props();
    export function generateCurvePath(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        edge: DiagramEdgeDef,
    ): string {
        const {
            sourceAnchor: source = Anchor.CENTER_CENTER,
            targetAnchor: dest = Anchor.CENTER_CENTER,
        } = edge;

        function anchorToRads({ x, y }: Vector2) {
            // vector from the node’s centre (0.5, 0.5)
            const dx = x - 0.5; // + right
            const dy = 0.5 - y; // + up   (flip screen-y for math coords)
            const raw = Math.atan2(dy, dx); // signed angle
            return normaliseAngle(raw);
        }

        // CRUCIAL TO INVEST THE Y DIRECTION SINCE IT GOES FROM
        // NEGATIVE TO POSITIVE!!!!!!!!!!!!!
        const leaveAngle = Math.atan2(y1 - y2, x2 - x1);
        const arriveAngle = leaveAngle + Math.PI;

        const sourcePosition = eq(source, Anchor.CENTER_CENTER)
            ? sideForAngle(leaveAngle)
            : sideForAngle(anchorToRads(source));

        const targetPosition = eq(dest, Anchor.CENTER_CENTER)
            ? sideForAngle(arriveAngle)
            : sideForAngle(anchorToRads(dest));

        const props = {
            sourceX: x1,
            sourceY: y1,
            sourcePosition: sourcePosition,

            targetX: x2,
            targetY: y2,
            targetPosition: targetPosition,
        };

        edge.pathGen ??= "bezier";
        if (edge.pathGen == "bezier") {
            return getBezierPath({
                ...props,
                curvature: edge.curvature ?? 0.25,
            })[0];
        } else if (edge.pathGen == "smoothstep") {
            const pathgenParams = {
                borderRadius: edge?.borderRadius ?? 15,
                center: edge?.center,
            };

            // calculate the absolute center from the relative center
            let centerX = undefined,
                centerY = undefined;

            if (pathgenParams.center) {
                centerX = x1 + pathgenParams.center.x * (x2 - x1);
                centerY = y1 + pathgenParams.center.y * (y2 - y1);
            }

            return getSmoothStepPath({
                ...props,
                borderRadius: pathgenParams.borderRadius,
                centerX,
                centerY,
            })[0];
        }

        throw new Error("unreachable");
    }

    function calculateDimensions(_nodes: typeof nodes) {
        // console.time("dim");
        let newMin = vector2(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        let newMax = vector2(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

        for (let node of _nodes.values()) {
            // if (!browser && node.clientOnly) continue;

            const size = getNodeSize(node);
            // const origin = getNodeOrigin(node);

            const left = node.x;
            const top = node.y;

            const right = left + size.x;
            const bottom = top + size.y;

            newMin = vector2(Math.min(newMin.x, left), Math.min(newMin.y, top));
            newMax = vector2(
                Math.max(newMax.x, right),
                Math.max(newMax.y, bottom),
            );
        }

        // console.timeEnd("dim");
        return { min: newMin, max: newMax };
    }

    // const dimensions = $derived(calculateDimensions(nodes));
    // let dimensions = $derived(calculateDimensions(nodes));
    let dimensions = $state(calculateDimensions(nodes));
    $effect(() => {
        const newDimensions = calculateDimensions(nodes);
        dimensions.min = newDimensions.min;
        dimensions.max = newDimensions.max;
    });
    // let dimensions = calculateDimensions(nodes);
    // onMount(() => (dimensions = calculateDimensions(nodes)));

    setContext("nodeMap", () => nodes);
    setContext("edgeMap", () => edges);
    setContext("dimensions", () => dimensions);
    setContext("prerendering", false);

    let width = $derived(Math.max(dimensions.max.x - dimensions.min.x, 1));
    let height = $derived(Math.max(dimensions.max.y - dimensions.min.y, 1));

    function generateEdgePath(edge: DiagramEdgeDef) {
        const sourceNode = nodes.get(edge.source)!;
        const targetNode = nodes.get(edge.target)!;

        const sourceAnchor = getNodeAnchor(
            sourceNode,
            edge.sourceAnchor ?? Anchor.CENTER_CENTER,
        );
        const targetAnchor = getNodeAnchor(
            targetNode,
            edge.targetAnchor ?? Anchor.CENTER_CENTER,
        );

        return generateCurvePath(
            sourceAnchor.left,
            sourceAnchor.top,
            targetAnchor.left,
            targetAnchor.top,
            edge,
        );
    }

    function getNodeAnchor(node: DiagramNodeDef, anchor: Vector2) {
        const size = getNodeSize(node);

        // if (!browser && !eq(anchor, Anchor.CENTER_CENTER) && eq(size, vector2(0, 0))) {
        // 	throw new Error(
        // 		`To use anchor other than CENTER,CENTER please set the width and height of the node explicitly or set autosize to true for the node\n\nNode '${node.id}' does not have explicity width or height and thus cannot be connected with a relative anchor`
        // 	);
        // }

        const left = node.x - dimensions.min.x + anchor.x * size.x;
        const top = node.y - dimensions.min.y + anchor.y * size.y;

        return { left, top };
    }

    // TODO: desperate need for refactoring
    let edgesByZIndexPlane = $derived(
        Array.from(edges.values()).reduce((acc, edge) => {
            const zIndex = edge.zIndex ?? 0;
            if (!acc.has(zIndex)) {
                acc.set(zIndex, []);
            }
            acc.get(zIndex)!.push(edge);
            return acc;
        }, new Map<number, DiagramEdgeDef[]>()),
    );

    // let depthMap = new SvelteMap<number, [DiagramEdge[], DiagramNode[]]>();
    // $effect(() => {
    // 	if (nodes || edges) {
    // 		depthMap.clear();
    // 		for (const node of nodes.values()) {
    // 		  // depthMap.has(node.zIndex)
    // 		}
    // 	}
    // });

    onMount(() => {
        dimensions = calculateDimensions(nodes);
    });
</script>

{#snippet defaultEdge(edge: DiagramEdgeDef, edgePath: string)}
    <path
        d={edgePath}
        fill="none"
        stroke="currentColor"
        class={edge.class}
        vector-effect="non-scaling-stroke"
        stroke-linecap="round"
        stroke-linejoin="round"
        shape-rendering="smooth"
        style={edge.style}
    />
{/snippet}

<figure
    aria-label="Diagram"
    aria-hidden={!dev}
    inert={!dev}
    role="img"
    style="position:relative;width:{width}px;height:{height}px;overflow:show;user-select:none;"
>
    <!-- <svg class="absolute top-0 right-0 bottom-0 left-0 z-0 h-full w-full overflow-visible"> -->
    <!-- {#each edges.values() as edge, i}
		{@const sourceNode = nodes.get(edge.source)}
		{@const targetNode = nodes.get(edge.target)}

		{#if sourceNode && targetNode && !(!browser && (sourceNode.clientOnly || targetNode.clientOnly))}
			<svg
				class="absolute top-0 right-0 bottom-0 left-0 h-full w-full overflow-visible"
				style="z-index:{edge.zIndex ?? 0};"
			>
				{@render (edge.snippet ? edge.snippet : defaultEdge)(
					edge,
					generateEdgePath(edge),
					edge.snippetExtraArg
				)}
			</svg>
		{/if}
	{/each} -->
    <!-- </svg> -->

    {#each edgesByZIndexPlane as [zIndex, edges]}
        <svg
            shape-rendering="crispEdges"
            style="z-index:{zIndex};position:absolute;top:0;right:0;bottom:0;left:0;height:100%;width:100%;overflow:visible;"
        >
            {#each edges as edge}
                {@const sourceNode = nodes.get(edge.source)}
                {@const targetNode = nodes.get(edge.target)}
                {#if sourceNode && targetNode && !(!browser && (sourceNode.clientOnly || targetNode.clientOnly))}
                    {@render (edge.snippet ? edge.snippet : defaultEdge)(
                        edge,
                        generateEdgePath(edge),
                        edge.snippetExtraArg,
                    )}
                {/if}
            {/each}
        </svg>
    {/each}

    {@render children()}
</figure>
