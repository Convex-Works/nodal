<script lang="ts" module>
    import BaseEdge from "./BaseEdge.svelte";
    import { SvelteMap } from "svelte/reactivity";
    import {
        eq,
        getBezierPath,
        getSmoothStepPath,
        normaliseAngle,
        sideForAngle,
        type Vector2,
        Anchor,
    } from "./diagram-lib.js";
    import type { HTMLAttributes } from "svelte/elements";
    import type { Writable } from "svelte/store";

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

    export type SurfaceEdgeParams = {
        component?: typeof BaseEdge;
        sourceAnchor?: Vector2;
        targetAnchor?: Vector2;
        svgPathAttributes?: HTMLAttributes<SVGPathElement>;
    } & PathGenParams;

    export type SurfaceEdge = {
        source: string | HTMLElement | string[] | HTMLElement[];
        target: string | HTMLElement | string[] | HTMLElement[];
    } & SurfaceEdgeParams;
</script>

<script lang="ts">
    const {
        hostElement,
        edges: _edges,
        svgAttributes,
        width: _width,
        height: _height,
    }: {
        hostElement: Element;
        edges: SvelteMap<string, SurfaceEdge>;
        width?: Writable<number>;
        height?: Writable<number>;
        svgAttributes?: HTMLAttributes<SVGElement>;
    } = $props();

    export const width = _width;
    export const height = _height;
    export const edges = _edges;

    function generateCurvePath(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        edge: SurfaceEdge,
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

        // CRUCIAL TO INVERT THE Y DIRECTION SINCE IT GOES FROM
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

    function* joinIterables<T>(...lists: Iterable<T>[]) {
        for (const list of lists) yield* list;
    }

    function resolveItem(
        item: string | HTMLElement,
        host: ParentNode,
    ): Iterable<HTMLElement> {
        return typeof item === "string"
            ? (host.querySelectorAll<HTMLElement>(
                  item,
              ) as NodeListOf<HTMLElement>)
            : [item];
    }

    export function getNodes(
        input: string | HTMLElement | string[] | HTMLElement[],
    ): HTMLElement[] {
        const parts: Iterable<HTMLElement>[] = Array.isArray(input)
            ? input.map((i) => resolveItem(i, hostElement))
            : [resolveItem(input, hostElement)];

        return Array.from(joinIterables(...parts));
    }

    function generateEdgePath(edge: SurfaceEdge) {
        const sourceNodes = getNodes(edge.source);
        const targetNodes = getNodes(edge.target);

        const paths: string[] = [];

        sourceNodes.forEach((source) => {
            targetNodes.forEach((target) => {
                if (source === target) {
                    console.error(
                        `Source and target are the same element: ${edge.source}`,
                    );
                    return;
                }

                const sourceAnchor = getNodeAnchor(
                    source,
                    edge.sourceAnchor ?? Anchor.CENTER_CENTER,
                );
                const targetAnchor = getNodeAnchor(
                    target,
                    edge.targetAnchor ?? Anchor.CENTER_CENTER,
                );
                paths.push(
                    generateCurvePath(
                        sourceAnchor.left,
                        sourceAnchor.top,
                        targetAnchor.left,
                        targetAnchor.top,
                        edge,
                    ),
                );
            });
        });
        // if (!(sourceNode instanceof HTMLElement)) {
        //     console.error(`Source node not found: ${edge.source}`);
        //     return "";
        // }

        // if (!(targetNode instanceof HTMLElement)) {
        //     console.error(`Target node not found: ${edge.target}`);
        //     return "";
        // }

        return paths;
    }

    function getNodeAnchor(node: HTMLElement, anchor: Vector2) {
        return {
            left: node.offsetLeft + anchor.x * node.clientWidth,
            top: node.offsetTop + anchor.y * node.clientHeight,
        };
    }
</script>

<svg
    shape-rendering="crispEdges"
    style="position:absolute;top:0;right:0;bottom:0;left:0;height:100%;width:100%;overflow:visible;z-index:-1;"
    {...svgAttributes}
>
    {#each edges.values() as edge}
        {#each generateEdgePath(edge) as path}
            {@const EdgeComponent = edge.component ?? BaseEdge}
            <EdgeComponent {path} {edge} />
            <!-- {@render (edge.snippet ? edge.snippet : defaultEdge)(
                edge,
                path,
                edge.snippetExtraArg,
            )} -->
        {/each}
    {/each}
</svg>
