<script lang="ts">
    import { onMount, type ComponentProps } from "svelte";
    import {
        DiagramNode,
        DiagramController,
        vector2,
        type DiagramNodeProps,
        type DiagramEdge,
    } from "@cnvx/nodal";

    let diagramContainerWidth = $state(0);
    let diagramContainerHeight = $state(0);

    $inspect(diagramContainerWidth, diagramContainerHeight);

    let containerEl: HTMLDivElement;

    let containerWidth = $state(500);
    let containerHeight = $state(500);

    function relY(percentage: number) {
        return (percentage * containerHeight) / 100;
    }
    function relX(percentage: number) {
        return (percentage * containerWidth) / 100;
    }
    // increase width with +/-
    onMount(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "=") {
                containerWidth += 50;
            } else if (e.key === "-") {
                containerWidth -= 50;
            } else if (e.key === "]") {
                containerHeight += 50;
            } else if (e.key === "[") {
                containerHeight -= 50;
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });
</script>

<div>
    <div
        bind:this={containerEl}
        style:width={`${containerWidth}px`}
        style:height={`${containerHeight}px`}
        class="border h-84"
    >
        <DiagramController
            class="bg-red-100 h-full"
            figureAttributes={{ class: "border" }}
            width={containerWidth}
            height={containerHeight}
        >
            <DiagramNode
                id="edge-1"
                height={50}
                width={50}
                x={0}
                y={0}
                class="bg-red-500 size-50"
                origin={vector2(0, 0)}
            />
            <DiagramNode
                id="edge-2"
                height={50}
                width={50}
                origin={vector2(0.5, 0.5)}
                x={relX(50)}
                y={relY(50)}
                class="bg-red-500 size-50"
            />

            <DiagramNode
                id={`kubernetes-api`}
                x={relX(100)}
                y={relY(100)}
                origin={vector2(1, 1)}
                height={50}
                width={200}
                class="flex items-center justify-center rounded-lg border border-blue-200 bg-blue-100 p-1 text-blue-900 shadow-inner"
                connect={["edge-1", "edge-2"]}
            >
                <div
                    class="flex h-full w-full items-center justify-center rounded-sm bg-blue-50 text-blue-700 shadow"
                ></div>
            </DiagramNode>
        </DiagramController>
    </div>
</div>
