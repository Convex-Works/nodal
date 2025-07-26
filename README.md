# 🦔 nodal

A Svelte 5 library for creating interactive node diagrams with customizable connections and layouts

## Goals
- Simple declarative API
- Static rendering by default
- SVG Rendering
- Fully typed
- Lightweight and performant

## Quick Start

```svelte
<script lang="ts">
  import { DiagramController, DiagramNode } from 'nodal';
</script>

<DiagramController class="w-full h-96 border rounded-lg">
  <DiagramNode
    id="start"
    x={100}
    y={100}
    width={120}
    height={60}
    connect="end"
    class="bg-blue-500 text-white rounded-lg flex items-center justify-center"
  >
    Start
  </DiagramNode>

  <DiagramNode
    id="end"
    x={300}
    y={100}
    width={120}
    height={60}
    class="bg-green-500 text-white rounded-lg flex items-center justify-center"
  >
    End
  </DiagramNode>
</DiagramController>
```

## API Reference

### Components

#### `DiagramController`
The main container component that manages nodes and their connections.

**Props:**
- Standard HTML div attributes for styling and classes

#### `DiagramNode`
Individual nodes in the diagram.

**Props:**
- `id: string` - Unique identifier for the node
- `x: number` - X coordinate position
- `y: number` - Y coordinate position
- `width?: number` - Fixed width (optional if using autosize)
- `height?: number` - Fixed height (optional if using autosize)
- `connect?: string | DiagramEdgeParams | Array<string | DiagramEdgeParams>` - Outgoing connections
- `connectSource?: string | DiagramEdgeParams | Array<string | DiagramEdgeParams>` - Incoming connections
- `autosize?: boolean` - Auto-size to fit content
- `origin?: Vector2` - Origin point for positioning (default: center)
- `clientOnly?: boolean` - Render only on client side
- Standard HTML div attributes for styling

### Connection Types

#### Bezier Curves
Smooth curved connections perfect for organic layouts.

```svelte
<DiagramNode
  connect={{
    target: "destination",
    pathGen: "bezier",
    curvature: 0.5,
    sourceAnchor: Anchor.CENTER_RIGHT,
    targetAnchor: Anchor.CENTER_LEFT
  }}
/>
```

#### Smooth Step
Right-angled connections with rounded corners, ideal for structured diagrams.

```svelte
<DiagramNode
  connect={{
    target: "destination",
    pathGen: "smoothstep",
    borderRadius: 10,
    center: { x: 0.5, y: 0.3 }
  }}
/>
```

### Anchoring System

Use predefined anchor points for precise connection positioning:

```ts
import { Anchor } from 'nodal';

// Available anchors:
Anchor.TOP_LEFT        // { x: 0, y: 0 }
Anchor.TOP_RIGHT       // { x: 1, y: 0 }
Anchor.BOTTOM_LEFT     // { x: 0, y: 1 }
Anchor.BOTTOM_RIGHT    // { x: 1, y: 1 }
Anchor.CENTER_LEFT     // { x: 0, y: 0.5 }
Anchor.CENTER_RIGHT    // { x: 1, y: 0.5 }
Anchor.CENTER_TOP      // { x: 0.5, y: 0 }
Anchor.CENTER_BOTTOM   // { x: 0.5, y: 1 }
Anchor.CENTER_CENTER   // { x: 0.5, y: 0.5 }
```

### Custom Edge Rendering

Create custom edge appearances with the `snippet` prop:

```svelte
<DiagramNode
  connect={{
    target: "destination",
    snippet: (edge, path, extra) => `
      <path
        d="${path}"
        stroke="#3b82f6"
        stroke-width="3"
        fill="none"
        marker-end="url(#arrow)"
      />
    `,
    snippetExtraArg: { labelText: "Custom Edge" }
  }}
/>
```

## Examples

### Basic Flow Diagram
```svelte
<script lang="ts">
  import { DiagramController, DiagramNode } from 'nodal';
</script>

<DiagramController class="w-full h-96 bg-gray-50 rounded-lg">
  <DiagramNode id="start" x={100} y={150} width={100} height={50} connect="process">
    Start
  </DiagramNode>

  <DiagramNode id="process" x={250} y={150} width={100} height={50} connect="end">
    Process
  </DiagramNode>

  <DiagramNode id="end" x={400} y={150} width={100} height={50}>
    End
  </DiagramNode>
</DiagramController>
```

### Auto-Sizing Nodes
```svelte
<DiagramNode
  id="dynamic"
  x={200}
  y={100}
  autosize
  connect="target"
  class="bg-blue-500 text-white px-4 py-2 rounded"
>
  This content determines the size
</DiagramNode>
```

### Multiple Connections
```svelte
<DiagramNode
  id="hub"
  x={200}
  y={200}
  width={80}
  height={80}
  connect={[
    { target: "output1", pathGen: "bezier", curvature: 0.3 },
    { target: "output2", pathGen: "smoothstep", borderRadius: 15 },
    "output3" // Simple string connection
  ]}
>
  Hub
</DiagramNode>
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```ts
import type {
  DiagramNodeType,
  DiagramEdge,
  DiagramEdgeParams,
  Vector2
} from 'nodal';

const nodes: DiagramNodeType[] = [
  {
    id: "node1",
    x: 100,
    y: 100,
    width: 120,
    height: 60
  }
];
```

## License

MIT License - see LICENSE file for details.
