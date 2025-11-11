import type { Vector2 } from "./diagram-lib.js";

export function getElementQuad(el: Element) {
  if ((el as any).getBoxQuads) {
    const quads = (el as any).getBoxQuads() as DOMQuad[];
    if (quads && quads.length) return quads[0];
  }
  // Fallback to rect -> quad
  const r = el.getBoundingClientRect();
  return {
    p1: { x: r.left, y: r.top },
    p2: { x: r.right, y: r.top },
    p3: { x: r.right, y: r.bottom },
    p4: { x: r.left, y: r.bottom },
  };
}

export function toSvgPoint(svg: SVGGraphicsElement, x: number, y: number) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { left: x, top: y };
  const inv = ctm.inverse();
  const p = new DOMPoint(x, y).matrixTransform(inv);
  return { left: p.x, top: p.y };
}

export function getNodeAnchorWithBoundingClientRect(
  el: Element,
  anchor: Vector2,
  svg: SVGGraphicsElement,
) {
  const q = getElementQuad(el);

  // Clamp to [0,1] to avoid surprises.
  const ax = Math.max(0, Math.min(1, anchor.x));
  const ay = Math.max(0, Math.min(1, anchor.y));

  // Bilinear interpolation across the quad:
  // p(ax,ay) = (1-ax)(1-ay) * p1 + ax(1-ay) * p2 + ax*ay * p3 + (1-ax)ay * p4
  const w1 = (1 - ax) * (1 - ay);
  const w2 = ax * (1 - ay);
  const w3 = ax * ay;
  const w4 = (1 - ax) * ay;

  const sx = w1 * q.p1.x + w2 * q.p2.x + w3 * q.p3.x + w4 * q.p4.x;

  const sy = w1 * q.p1.y + w2 * q.p2.y + w3 * q.p3.y + w4 * q.p4.y;

  return toSvgPoint(svg, sx, sy);
}

export function getNodeAnchorFast(
  node: HTMLElement,
  anchor: Vector2,
  svgElement: SVGGraphicsElement,
): {
  left: number;
  top: number;
} {
  return {
    left: node.offsetLeft + anchor.x * node.clientWidth,
    top: node.offsetTop + anchor.y * node.clientHeight,
  };
}
