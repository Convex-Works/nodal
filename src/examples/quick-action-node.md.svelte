<script lang="ts">
    import { createNodal, connectTo, vector2 } from "@cnvx/nodal";
</script>

<div
    class="relative mt-7 flex w-full flex-row items-center justify-between gap-4 px-4"
    {@attach createNodal()}
>
    <div
        id="rpo"
        class="flex flex-col items-center gap-2 z-10 bg-white p-3"
        {@attach connectTo({
            target: "#incident",
            targetAnchor: vector2(0, 0),
        })}
    >
        <p class="text-lg font-medium">RPO</p>
        <p class="text-muted-foreground text-sm">Recovery Point Objective</p>
    </div>

    <div
        id="incident"
        class="z-10 flex flex-col items-center gap-2 rounded-sm border border-red-500/20 bg-red-500/20 p-3"
        {@attach connectTo("#rto")}
    >
        <p class="text-md font-medium text-red-500">Incident</p>
    </div>

    <div
        class="flex flex-col items-center gap-2 z-10 bg-white p-3 mt-45"
        id="rto"
        {@attach connectTo({ target: ".boing", targetAnchor: vector2(0.5, 1) })}
    >
        <p class="text-lg font-medium">RTO</p>
        <p class="text-muted-foreground text-sm">Recovery Time Objective</p>
    </div>

    {#each Array.from({ length: 20 }, (_, i) => i) as _}
        <div class="size-4 bg-red-500 boing" />
    {/each}
</div>
