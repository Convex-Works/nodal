<script lang="ts">
    import { DiagramController, DiagramNode, Anchor } from "@cnvx/nodal";
</script>

<DiagramController
    class="w-full h-96 border border-gray-300 rounded-lg bg-gray-50 justify-center items-center flex"
    scaleToFit
>
    <DiagramNode
        id="start"
        x={100}
        y={100}
        width={120}
        height={60}
        connect="process"
        class="bg-blue-500 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        Start Process
    </DiagramNode>

    <DiagramNode
        id="process"
        x={300}
        y={100}
        width={120}
        height={60}
        connect="end"
        class="bg-green-500 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        Processing
    </DiagramNode>

    <DiagramNode
        id="end"
        x={500}
        y={100}
        width={120}
        height={60}
        class="bg-red-500 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        End
    </DiagramNode>
</DiagramController>
