<script lang="ts">
    import { onMount, type ComponentProps } from "svelte";
    import {
        DiagramNode,
        DiagramController,
        vector2,
        type DiagramNodeProps,
        type DiagramEdge,
    } from "@cnvx/nodal";

    const {
        ...rest
    }: Partial<Omit<ComponentProps<typeof DiagramController>, "children">> =
        $props();
    let diagramContainerWidth = $state(0);
    let diagramContainerHeight = $state(0);

    function relY(percentage: number) {
        return (percentage * diagramContainerHeight) / 100;
    }
    function relX(percentage: number) {
        return (percentage * diagramContainerWidth) / 100;
    }

    $inspect(diagramContainerWidth, diagramContainerHeight);
</script>

<div
    class="w-full h-[20vh] max-h-[500px] border relative"
    bind:clientWidth={diagramContainerWidth}
    bind:clientHeight={diagramContainerHeight}
>
    <!-- horizontal line -->
    <div
        class="h-0.5 w-full bg-blue-500 absolute top-[50%] left-[50%] -translate-[50%]"
    ></div>
    <div
        class="w-0.5 h-full bg-blue-500 absolute top-[50%] left-[50%] -translate-[50%]"
    ></div>

    <DiagramController
        width={diagramContainerWidth}
        height={diagramContainerHeight}
        figureAttributes={{ "aria-hidden": "false", inert: false }}
    >
        {@const withEdgeOptions = (target: string, sourceAnchorY: number) => ({
            target,
            class: "stroke-gray-400 stroke-1",
            sourceAnchor: vector2(0, sourceAnchorY),
            targetAnchor: vector2(0.5, 0.5),
            pathGen: "smoothstep" as const,
        })}

        <DiagramNode
            id={`kubernetes-api`}
            origin={vector2(0.5, 0.5)}
            x={relX(50)}
            y={relY(50)}
            height={40}
            width={40}
            connect={[
                withEdgeOptions("helm", 0.4),
                withEdgeOptions("wasm", 0.5),
                withEdgeOptions("container-image", 0.6),
            ]}
        >
            <div
                class="flex h-full w-full items-center justify-center rounded-sm bg-red-500 text-blue-700 shadow"
            >
                CENTER
            </div>
        </DiagramNode>

        <DiagramNode
            id={`prometheus`}
            x={relX(100)}
            y={relY(100)}
            origin={{ x: 1, y: 1 }}
            height={100}
            width={50}
            class="flex items-center justify-center rounded-lg border border-red-200 bg-red-100 p-1 text-blue-900 shadow-inner"
            connect={[
                withEdgeOptions("helm", 0.4),
                withEdgeOptions("wasm", 0.5),
                withEdgeOptions("container-image", 0.6),
            ]}
        >
            <div
                class="flex h-full w-full items-center justify-center rounded-sm bg-red-500 text-blue-800 shadow"
            ></div>
        </DiagramNode>

        <DiagramNode
            id={`registry`}
            x={relX(0)}
            y={relY(100)}
            origin={{ x: 0, y: 1 }}
            height={diagramContainerHeight}
            width={50}
            class="flex items-center justify-center rounded-lg border border-blue-200 bg-blue-100 p-1 text-blue-900 shadow-inner"
            connect={[
                withEdgeOptions("helm", 0.4),
                withEdgeOptions("wasm", 0.5),
                withEdgeOptions("container-image", 0.6),
            ]}
        >
            <div
                class="flex h-full w-full items-center justify-center rounded-sm bg-blue-50 text-blue-800 shadow"
            ></div>
        </DiagramNode>

        {@const NUM_CLUSTERS = 3}
        {#each Array.from({ length: NUM_CLUSTERS }, (_, i) => i) as i}
            {@const cluserSize = 40}
            <DiagramNode
                id={`cluster-${i}`}
                x={relX(45 + i * 15)}
                y={relY(0)}
                width={cluserSize}
                height={cluserSize}
                origin={vector2(0.5, 1.0)}
                class="flex items-center justify-center rounded-lg border"
                connect={{
                    source: "registry",
                    sourceAnchor: vector2(0.9, 0.4 + i * 0.1),
                    targetAnchor: vector2(0.5, 0.0),
                    pathGen: "smoothstep" as const,
                }}
            >
                <div role="button" tabindex={-1}>
                    <div class="size-4 bg-green-500" />
                </div>
            </DiagramNode>
        {/each}
    </DiagramController>
</div>
