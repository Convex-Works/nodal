<script lang="ts">
    import { DiagramController, DiagramNode, Anchor } from "@cnvx/nodal";
</script>

<DiagramController
    class="w-full h-96 border border-gray-300 rounded-lg bg-gray-50 justify-center items-center flex"
>
    <!-- Smooth step connections for more structured layouts -->
    <DiagramNode
        id="database"
        x={100}
        y={180}
        width={120}
        height={60}
        connect={{
            target: "api",
            pathGen: "smoothstep",
            borderRadius: 10,
            sourceAnchor: Anchor.CENTER_RIGHT,
            targetAnchor: Anchor.CENTER_LEFT,
            class: "stroke-blue-600 stroke-2",
        }}
        class="bg-gray-700 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        Database
    </DiagramNode>

    <DiagramNode
        id="api"
        x={300}
        y={180}
        width={100}
        height={60}
        connect={[
            {
                target: "frontend",
                pathGen: "smoothstep",
                borderRadius: 15,
                sourceAnchor: Anchor.CENTER_TOP,
                targetAnchor: Anchor.CENTER_BOTTOM,
                class: "stroke-green-600 stroke-2",
            },
            {
                target: "mobile",
                pathGen: "smoothstep",
                borderRadius: 8,
                sourceAnchor: Anchor.CENTER_BOTTOM,
                targetAnchor: Anchor.CENTER_TOP,
                class: "stroke-purple-600 stroke-2",
            },
        ]}
        class="bg-blue-500 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        API
    </DiagramNode>

    <DiagramNode
        id="frontend"
        x={300}
        y={80}
        width={100}
        height={50}
        class="bg-yellow-500 text-black rounded-lg flex items-center justify-center font-semibold"
    >
        Frontend
    </DiagramNode>

    <DiagramNode
        id="mobile"
        x={300}
        y={280}
        width={100}
        height={50}
        class="bg-pink-500 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        Mobile App
    </DiagramNode>

    <!-- Additional connection with custom center point -->
    <DiagramNode
        id="cache"
        x={500}
        y={120}
        width={80}
        height={40}
        connectSource={{
            source: "api",
            pathGen: "smoothstep",
            borderRadius: 20,
            center: { x: 0.3, y: 0.8 },
            sourceAnchor: Anchor.CENTER_RIGHT,
            targetAnchor: Anchor.CENTER_LEFT,
            class: "stroke-orange-600 stroke-2 stroke-dasharray-[5,5]",
        }}
        class="bg-orange-400 text-white rounded-lg flex items-center justify-center font-semibold text-sm"
    >
        Cache
    </DiagramNode>
</DiagramController>
