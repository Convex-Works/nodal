import { mount } from "svelte";
import type { Attachment } from "svelte/attachments";
import type { HTMLAttributes } from "svelte/elements";
import { SvelteMap } from "svelte/reactivity";
import { writable, type Writable } from "svelte/store";
import type { SurfaceEdge, SurfaceEdgeParams } from "./Surface.svelte";
import Surface from "./Surface.svelte";
import type { Vector2 } from "./diagram-lib.js";

type IndividualConnectActionParam =
  | string
  | (SurfaceEdgeParams & { target: string | string[] })
  | (SurfaceEdgeParams & { source: string | string[] });

interface NodalConnectorElement extends HTMLElement {
  _nodalEdgeConnections: IndividualConnectActionParam[];
}

interface NodalSurfaceElement extends HTMLElement {
  _nodalSurface: {
    internals: {
      width: Writable<number> | undefined;
      height: Writable<number> | undefined;
      edges: SvelteMap<string, SurfaceEdge>;
    }

    schedule: () => void;
  };
}

function drawCall(surface: NodalSurfaceElement) {
  // console.debug("Drawing nodal surface edges...");
  const connections = surface.querySelectorAll(
    "[data-nodal-connected='true']",
  ) as NodeListOf<NodalConnectorElement>;

  connections.forEach((conn: NodalConnectorElement) => {
    // console.debug("Processing connection for:", conn);
    const host = conn as HTMLElement;

    if (
      !conn._nodalEdgeConnections ||
      conn._nodalEdgeConnections.length === 0
    ) {
      // console.debug("No edges found for host:", host);
      return;
    }

    conn._nodalEdgeConnections.forEach((edge) => {
      let edgeDef: SurfaceEdge;

      if (typeof edge == "string") {
        edgeDef = {
          source: host,
          target: edge,
        };
      } else {
        edgeDef = {
          source: "source" in edge ? edge.source : host,
          target: "target" in edge ? edge.target : host,
          ...edge,
        };
      }

      surface._nodalSurface.internals.edges.set(
        `${edgeDef.source}->${edgeDef.target}`,
        edgeDef,
      );
    });
  });
}

export function createNodal({
  svgAttributes = {},
  getNodeAnchor,
  fadeInDuration,
  onMount,
}: Partial<{
  svgAttributes: HTMLAttributes<SVGElement>,
  onMount: (engine: NodalSurfaceElement["_nodalSurface"]) => void,
  getNodeAnchor: (node: HTMLElement, anchor: Vector2, svgElement: SVGElement) => { top: number; left: number };
  fadeInDuration: number;
}> = {}): Attachment {
  return (element) => {
    console.debug("Creating nodal sruface..");
    if (!Object.hasOwn(element, "_nodalSurface")) {

      const edges = new SvelteMap<string, SurfaceEdge>();

      const exports = mount(Surface, {
        target: element,
        props: {
          hostElement: element,
          edges,
          width: writable(element.clientWidth),
          height: writable(element.clientHeight),

          svgAttributes,
          getNodeAnchor,
          fadeInDuration,
        },
      });


      const engine = {
        _isScheduled: false,
        draw: () => drawCall(element as NodalSurfaceElement),
        schedule() {
          if (engine._isScheduled) return;
          engine._isScheduled = true;

          requestAnimationFrame(() => {
            this._isScheduled = false;
            drawCall(element as NodalSurfaceElement)
          });
        },
        internals: exports
      }

      Object.defineProperty(element, "_nodalSurface", {
        value: engine,
      });

      const resizeObserver = new ResizeObserver((entries) => {
        requestAnimationFrame(() => {
          for (let entry of entries) {
            const { width, height } = entry.contentRect;
            // console.debug(
            //   "Resizing nodal surface to:",
            //   width,
            //   height,
            // );
            exports.width?.set(width);
            exports.height?.set(height);

            // redraw edges
            // drawCall(element as NodalSurfaceElement);
            engine.schedule();
          }
        })
      });

      try {
        onMount?.(engine);
      } catch (e) {
        console.error("Error in onMount callback for nodal surface:", e);
      }

      resizeObserver.observe(element);
      engine.schedule();
      // drawCall(element as NodalSurfaceElement);
    }
  };
}

export function connectTo(...edges: IndividualConnectActionParam[]): Attachment {
  return (host: Element) => {
    host.setAttribute("data-nodal-connected", "true");
    (host as NodalConnectorElement)._nodalEdgeConnections = edges;
  };
}
