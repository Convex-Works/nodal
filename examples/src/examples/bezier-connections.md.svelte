<script lang="ts">
    import { DiagramController, DiagramNode, Anchor } from "@cnvx/nodal";
</script>

<DiagramController
    class="w-full h-96 border border-gray-300 rounded-lg bg-gray-50 justify-center items-center flex"
>
    <!-- Node with bezier curve connections -->
    <DiagramNode
        id="input"
        x={100}
        y={150}
        width={100}
        height={50}
        connect={{
            target: "output1",
            pathGen: "bezier",
            curvature: 0.5,
            sourceAnchor: Anchor.CENTER_RIGHT,
            targetAnchor: Anchor.CENTER_LEFT,
            class: "stroke-blue-500 stroke-2",
        }}
        class="bg-purple-500 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        Input
    </DiagramNode>

    <DiagramNode
        id="output1"
        x={350}
        y={100}
        width={100}
        height={50}
        class="bg-orange-500 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        Output A
    </DiagramNode>

    <DiagramNode
        id="center"
        x={250}
        y={250}
        width={80}
        height={80}
        connect={[
            {
                target: "output1",
                pathGen: "bezier",
                curvature: 0.3,
                sourceAnchor: Anchor.CENTER_TOP,
                targetAnchor: Anchor.CENTER_BOTTOM,
                class: "stroke-green-500 stroke-2",
            },
            {
                target: "output2",
                pathGen: "bezier",
                curvature: 0.4,
                sourceAnchor: Anchor.CENTER_RIGHT,
                targetAnchor: Anchor.CENTER_LEFT,
                class: "stroke-red-500 stroke-2",
            },
        ]}
        class="bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold"
    >
        Hub
    </DiagramNode>

    <DiagramNode
        id="output2"
        x={450}
        y={250}
        width={100}
        height={50}
        class="bg-teal-500 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        Output B
    </DiagramNode>
</DiagramController>
