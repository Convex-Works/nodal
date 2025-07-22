<script lang="ts">
    import { DiagramController, DiagramNode, Anchor } from "@cnvx/nodal";
</script>

<DiagramController
    class="w-full h-96 border border-gray-300 rounded-lg bg-gray-50 justify-center items-center flex"
>
    <DiagramNode
        id="source"
        x={100}
        y={150}
        width={100}
        height={60}
        connect={{
            target: "target1",
            snippet: (edge, path, extra) => {
                // Custom edge rendering with arrow and label
                return `
					<g>
						<path d="${path}" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>
						<defs>
							<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
								<polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6"/>
							</marker>
						</defs>
						<path d="${path}" fill="none" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrowhead)"/>
						<text x="${extra.labelX}" y="${extra.labelY}" text-anchor="middle" fill="#1f2937" font-size="12" font-weight="bold">
							Data Flow
						</text>
					</g>
				`;
            },
            snippetExtraArg: { labelX: 200, labelY: 130 },
            sourceAnchor: Anchor.CENTER_RIGHT,
            targetAnchor: Anchor.CENTER_LEFT,
        }}
        class="bg-blue-500 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        Source
    </DiagramNode>

    <DiagramNode
        id="target1"
        x={350}
        y={150}
        width={100}
        height={60}
        class="bg-green-500 text-white rounded-lg flex items-center justify-center font-semibold"
    >
        Target
    </DiagramNode>

    <!-- Another custom edge with different styling -->
    <DiagramNode
        id="node1"
        x={100}
        y={250}
        width={80}
        height={40}
        connect={{
            target: "node2",
            snippet: (edge, path) => {
                // Animated dashed line
                return `
					<path
						d="${path}"
						fill="none"
						stroke="#ef4444"
						stroke-width="2"
						stroke-dasharray="5,5"
						stroke-linecap="round"
					>
						<animate attributeName="stroke-dashoffset" values="10;0" dur="1s" repeatCount="indefinite"/>
					</path>
				`;
            },
            pathGen: "smoothstep",
            borderRadius: 5,
        }}
        class="bg-red-500 text-white rounded-lg flex items-center justify-center font-semibold text-sm"
    >
        Animated
    </DiagramNode>

    <DiagramNode
        id="node2"
        x={350}
        y={250}
        width={80}
        height={40}
        class="bg-orange-500 text-white rounded-lg flex items-center justify-center font-semibold text-sm"
    >
        Target
    </DiagramNode>
</DiagramController>
