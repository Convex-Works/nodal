<script lang="ts">
    import { DiagramController, DiagramNode, vector2 } from "@cnvx/nodal";
    import type { ComponentProps } from "svelte";

    const RECS = [vector2(2, 2), vector2(4, 4), vector2(3, 3)];

    const { STORAGE, CONTROL_PANEL, COMPUTE, MULTI, INACTIVE } = {
        STORAGE: {
            id: "storage" as const,
            class: "fill-blue-800 stroke-white/80 stroke-1.5",
        },
        CONTROL_PANEL: {
            id: "control-panel" as const,
            class: "fill-gray-400/80 stroke-white/80 stroke-1.5",
        },
        COMPUTE: {
            id: "compute" as const,
            class: "fill-gray-900 stroke-white/80 stroke-1.5",
        },
        MULTI: {
            id: "multi" as const,
            class: "fill-emerald-500 stroke-white/80 stroke-1.5",
        },
        INACTIVE: {
            id: "inactive" as const,
            class: "fill-gray-300/50 stroke-white/80 stroke-1.5",
        },
    };

    const LAYERS = [
        [
            [STORAGE, STORAGE, STORAGE, STORAGE], //
            [STORAGE, STORAGE, STORAGE, STORAGE],
            [STORAGE, STORAGE, INACTIVE, STORAGE],
            [STORAGE, STORAGE, STORAGE, STORAGE], //
        ],
        [
            [MULTI, MULTI, MULTI, MULTI], //
            [MULTI, MULTI, MULTI, MULTI],
            [MULTI, MULTI, MULTI, MULTI],
            [MULTI, MULTI, INACTIVE, MULTI], //
        ],
        [
            [null, null, null, null, null], //
            [null, null, null, null, null],
            [null, CONTROL_PANEL, CONTROL_PANEL, null, null],
            [null, CONTROL_PANEL, CONTROL_PANEL, null, null], //
            [null, null, null, null, null], //
        ],
        [
            [COMPUTE, COMPUTE, COMPUTE, COMPUTE, COMPUTE], //
            [COMPUTE, INACTIVE, COMPUTE, COMPUTE, COMPUTE],
            [COMPUTE, INACTIVE, COMPUTE, COMPUTE, COMPUTE],
            [COMPUTE, COMPUTE, COMPUTE, COMPUTE, COMPUTE], //
            [COMPUTE, COMPUTE, COMPUTE, COMPUTE, COMPUTE], //
        ],
    ];

    const calcZindex = (
        rowIndex: number,
        colIndex: number,
        layerIndex: number,
    ) => {
        return -(rowIndex * 1);
        // return -rowIndex - colIndex - layerIndex;
    };

    // <!-- "stroke-gray-900 fill-gray-200 stroke-2" -->
</script>

{#snippet isometricCube(props: ComponentProps<typeof DiagramNode>)}
    {@const isometricRatio = 122 / 102}
    {@const classes = "stroke-gray-900 fill-gray-200 stroke-2"}
    <DiagramNode width={50} height={50 * isometricRatio} {...props}>
        <svg
            width="50"
            height={50 * isometricRatio}
            viewBox="0 0 102 122"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M51 61L1 31V91L51 121V61Z"
                class={Array.isArray(classes) ? classes[0] : classes}
                stroke-linejoin="round"
            />
            <path
                d="M51 61L101 31V91L51 121V61Z"
                class={Array.isArray(classes) ? classes[1] : classes}
                stroke-linejoin="round"
            />
            <path
                d="M51 61L1 31L51 1L101 31L51 61Z"
                class={Array.isArray(classes) ? classes[2] : classes}
                stroke-linejoin="round"
            />
        </svg>
    </DiagramNode>
{/snippet}

<DiagramController eagerLoad scaleToFit>
    <!-- {#if false} -->
    {#each LAYERS as layer, layerIndex}
        <!-- {#each Array.from({ length: rec.y }, (_, i) => i) as y, i} -->
        {#each layer as row, rowIndex}
            {#each row as node, colIndex}
                {#if node}
                    {@render isometricCube({
                        id: `node-${rowIndex}-${colIndex}-${layerIndex}`,
                        // zIndex: calcZindex(rowIndex, colIndex, layerIndex),
                        style: `z-index: ${calcZindex(rowIndex, colIndex, layerIndex)}`,
                        x: colIndex * 30 + layerIndex * 120,
                        y: rowIndex * 40 + colIndex * 20 - layerIndex * 50,
                        connect:
                            node.id != "inactive"
                                ? LAYERS[layerIndex - 1]?.flatMap(
                                      (row, rowIndex) =>
                                          row.flatMap((node, colIndex) =>
                                              node?.id != "inactive"
                                                  ? {
                                                        target: `node-${rowIndex}-${colIndex}-${layerIndex - 1}`,
                                                        zIndex: calcZindex(
                                                            rowIndex,
                                                            colIndex,
                                                            layerIndex,
                                                        ),
                                                        // sourceAnchor: { x: 1, y: 0.5 },
                                                        // destAnchor: { x: 1, y: 0.5 },
                                                        // snippet: pulsingEdge,
                                                        // snippetExtraArg: node
                                                    }
                                                  : [],
                                          ),
                                  )
                                : [],
                    })}
                {/if}
            {/each}
        {/each}
    {/each}
</DiagramController>
