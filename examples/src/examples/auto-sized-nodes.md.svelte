---
title: Auto-sized Nodes Example
description: basic example of auto-sized nodes in a diagram
---

<script lang="ts">
    import { DiagramController, DiagramNode } from "@cnvx/nodal";
</script>

<DiagramController class="w-full h-96 border border-gray-300 rounded-lg bg-gray-50 justify-center items-center flex">
    <!-- Auto-sized nodes that adapt to their content -->
    <DiagramNode
        id="short"
        x={100}
        y={100}
        autosize
        connect="long"
        class="bg-blue-500 text-white rounded-lg px-4 py-2 font-semibold"
    >
        Short
    </DiagramNode>

    <DiagramNode
        id="long"
        x={300}
        y={100}
        autosize
        connect="variable"
        class="bg-green-500 text-white rounded-lg px-4 py-2 font-semibold"
    >
        This is a much longer text that will auto-size
    </DiagramNode>

    <DiagramNode
        id="variable"
        x={200}
        y={200}
        autosize
        class="bg-purple-500 text-white rounded-lg px-6 py-3 font-semibold max-w-xs"
    >
        Variable content that can wrap to multiple lines and still maintain
        proper connections
    </DiagramNode>

    <!-- Mixed auto-size and fixed-size nodes -->
    <DiagramNode
        id="fixed"
        x={450}
        y={150}
        width={120}
        height={80}
        connectSource="variable"
        class="bg-red-500 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        Fixed Size
    </DiagramNode>
</DiagramController>
