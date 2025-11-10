export { default as Diagram } from './Diagram.svelte';
export { default as DiagramController, type PassthroughDiagramControllerProps } from './DiagramController.svelte';
export { default as DiagramNode } from './DiagramNode.svelte';
export { default as PrerenderDiagram } from './PrerenderDiagram.svelte';

export * from './diagram-lib.js';

export type {
  // DiagramNode as DiagramNodeType,
  DiagramEdgeDef as DiagramEdge,
  DiagramEdgeParams,
  DiagramProps
} from './Diagram.svelte';

export type { DiagramNodeProps } from './DiagramNode.svelte';
