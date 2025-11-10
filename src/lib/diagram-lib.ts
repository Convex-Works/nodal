export interface Vector2 { x: number, y: number }
export const vector2 = (x: number, y: number) => ({ x, y })
export const eq = (a: Vector2, b: Vector2) => a.x === b.x && a.y === b.y;

export const Anchor = {
  TOP_LEFT: vector2(0, 0),
  TOP_RIGHT: vector2(1, 0),
  BOTTOM_LEFT: vector2(0, 1),
  BOTTOM_RIGHT: vector2(1, 1),
  CENTER_LEFT: vector2(0, 0.5),
  CENTER_RIGHT: vector2(1, 0.5),
  CENTER_TOP: vector2(0.5, 0),
  CENTER_BOTTOM: vector2(0.5, 1),
  CENTER_CENTER: vector2(0.5, 0.5),
} as const satisfies Record<string, Vector2>;

export enum Side {
  Right, Top, Left, Bottom
}


export function normaliseAngle(r: number) {
  return ((r % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

export function sideToUnitVector2(s: Side): Vector2 {
  return {
    [Side.Top]: { x: 0, y: 1 },
    [Side.Left]: { x: -1, y: 0 },
    [Side.Right]: { x: 1, y: 0 },
    [Side.Bottom]: { x: 0, y: -1 }
  }[s]
}

export function sideForAngle(rad: number): Side {
  const a = normaliseAngle(rad);
  if (a >= (7 * Math.PI) / 4 || a < Math.PI / 4) return Side.Right; // 7π/4 → π/4
  if (a >= Math.PI / 4 && a < (3 * Math.PI) / 4) return Side.Top; // π/4 → 3π/4
  if (a >= (3 * Math.PI) / 4 && a < (5 * Math.PI) / 4) return Side.Left; // 3π/4 → 5π/4
  return Side.Bottom;
};

export function unitVectorFromAngle(rad: number): Vector2 {
  return {
    x: Math.cos(rad),
    y: Math.sin(rad)
  };
}


// Taken from: https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/bezier-edge.ts
export type GetBezierPathParams = {
  /** The `x` position of the source handle. */
  sourceX: number;
  /** The `y` position of the source handle. */
  sourceY: number;
  /**
   * The position of the source handle.
   * @default Side.Bottom
   */
  sourcePosition?: Side;
  /** The `x` position of the target handle. */
  targetX: number;
  /** The `y` position of the target handle. */
  targetY: number;
  /**
   * The position of the target handle.
   * @default Side.Top
   */
  targetPosition?: Side;
  /**
   * The curvature of the bezier edge.
   * @default 0.25
   */
  curvature?: number;
};

export type GetControlWithCurvatureParams = {
  pos: Side;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: number;
};

export function getBezierEdgeCenter({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceControlX,
  sourceControlY,
  targetControlX,
  targetControlY
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceControlX: number;
  sourceControlY: number;
  targetControlX: number;
  targetControlY: number;
}): [number, number, number, number] {
  /*
   * cubic bezier t=0.5 mid point, not the actual mid point, but easy to calculate
   * https://stackoverflow.com/questions/67516101/how-to-find-distance-mid-point-of-bezier-curve
   */
  const centerX =
    sourceX * 0.125 + sourceControlX * 0.375 + targetControlX * 0.375 + targetX * 0.125;
  const centerY =
    sourceY * 0.125 + sourceControlY * 0.375 + targetControlY * 0.375 + targetY * 0.125;
  const offsetX = Math.abs(centerX - sourceX);
  const offsetY = Math.abs(centerY - sourceY);

  return [centerX, centerY, offsetX, offsetY];
}

function calculateControlOffset(distance: number, curvature: number): number {
  if (distance >= 0) {
    return 0.5 * distance;
  }

  return curvature * 25 * Math.sqrt(-distance);
}

function getControlWithCurvature({
  pos,
  x1,
  y1,
  x2,
  y2,
  c
}: GetControlWithCurvatureParams): [number, number] {
  switch (pos) {
    case Side.Left:
      return [x1 - calculateControlOffset(x1 - x2, c), y1];
    case Side.Right:
      return [x1 + calculateControlOffset(x2 - x1, c), y1];
    case Side.Top:
      return [x1, y1 - calculateControlOffset(y1 - y2, c)];
    case Side.Bottom:
      return [x1, y1 + calculateControlOffset(y2 - y1, c)];
  }
}

/**
 * The `getBezierPath` util returns everything you need to render a bezier edge
 *between two nodes.
 * @public
 * @returns A path string you can use in an SVG, the `labelX` and `labelY` position (center of path)
 * and `offsetX`, `offsetY` between source handle and label.
 * - `path`: the path to use in an SVG `<path>` element.
 * - `labelX`: the `x` position you can use to render a label for this edge.
 * - `labelY`: the `y` position you can use to render a label for this edge.
 * - `offsetX`: the absolute difference between the source `x` position and the `x` position of the
 * middle of this path.
 * - `offsetY`: the absolute difference between the source `y` position and the `y` position of the
 * middle of this path.
 * @example
 * ```js
 *  const source = { x: 0, y: 20 };
 *  const target = { x: 150, y: 100 };
 *
 *  const [path, labelX, labelY, offsetX, offsetY] = getBezierPath({
 *    sourceX: source.x,
 *    sourceY: source.y,
 *    sourcePosition: Side.Right,
 *    targetX: target.x,
 *    targetY: target.y,
 *    targetPosition: Side.Left,
 *});
 *```
 *
 * @remarks This function returns a tuple (aka a fixed-size array) to make it easier to
 *work with multiple edge paths at once.
 */
export function getBezierPath({
  sourceX,
  sourceY,
  sourcePosition = Side.Bottom,
  targetX,
  targetY,
  targetPosition = Side.Top,
  curvature = 0.25
}: GetBezierPathParams): [
    path: string,
    labelX: number,
    labelY: number,
    offsetX: number,
    offsetY: number
  ] {
  const [sourceControlX, sourceControlY] = getControlWithCurvature({
    pos: sourcePosition,
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY,
    c: curvature
  });
  const [targetControlX, targetControlY] = getControlWithCurvature({
    pos: targetPosition,
    x1: targetX,
    y1: targetY,
    x2: sourceX,
    y2: sourceY,
    c: curvature
  });
  const [labelX, labelY, offsetX, offsetY] = getBezierEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourceControlX,
    sourceControlY,
    targetControlX,
    targetControlY
  });

  return [
    `M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`,
    labelX,
    labelY,
    offsetX,
    offsetY
  ];
}

// https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/smoothstep-edge.ts
export function getEdgeCenter({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}): [number, number, number, number] {
  const xOffset = Math.abs(targetX - sourceX) / 2;
  const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

  const yOffset = Math.abs(targetY - sourceY) / 2;
  const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

  return [centerX, centerY, xOffset, yOffset];
}

export interface GetSmoothStepPathParams {
  /** The `x` position of the source handle. */
  sourceX: number;
  /** The `y` position of the source handle. */
  sourceY: number;
  /**
   * The position of the source handle.
   * @default Side.Bottom
   */
  sourcePosition?: Side;
  /** The `x` position of the target handle. */
  targetX: number;
  /** The `y` position of the target handle. */
  targetY: number;
  /**
   * The position of the target handle.
   * @default Side.Top
   */
  targetPosition?: Side;
  /** @default 5 */
  borderRadius?: number;
  centerX?: number;
  centerY?: number;
  /** @default 20 */
  offset?: number;
}

const handleDirections = {
  [Side.Left]: { x: -1, y: 0 },
  [Side.Right]: { x: 1, y: 0 },
  [Side.Top]: { x: 0, y: -1 },
  [Side.Bottom]: { x: 0, y: 1 },
};

const getDirection = ({
  source,
  sourcePosition = Side.Bottom,
  target,
}: {
  source: Vector2;
  sourcePosition: Side;
  target: Vector2;
}): Vector2 => {
  if (sourcePosition === Side.Left || sourcePosition === Side.Right) {
    return source.x < target.x ? { x: 1, y: 0 } : { x: -1, y: 0 };
  }
  return source.y < target.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
};

const distance = (a: Vector2, b: Vector2) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

/*
 * With this function we try to mimic an orthogonal edge routing behaviour
 * It's not as good as a real orthogonal edge routing, but it's faster and good enough as a default for step and smooth step edges
 */
function getPoints({
  source,
  sourcePosition = Side.Bottom,
  target,
  targetPosition = Side.Top,
  center,
  offset,
}: {
  source: Vector2;
  sourcePosition: Side;
  target: Vector2;
  targetPosition: Side;
  center: Partial<Vector2>;
  offset: number;
}): [Vector2[], number, number, number, number] {
  const sourceDir = handleDirections[sourcePosition];
  const targetDir = handleDirections[targetPosition];
  const sourceGapped: Vector2 = { x: source.x + sourceDir.x * offset, y: source.y + sourceDir.y * offset };
  const targetGapped: Vector2 = { x: target.x + targetDir.x * offset, y: target.y + targetDir.y * offset };
  const dir = getDirection({
    source: sourceGapped,
    sourcePosition,
    target: targetGapped,
  });
  const dirAccessor = dir.x !== 0 ? 'x' : 'y';
  const currDir = dir[dirAccessor];

  let points: Vector2[] = [];
  let centerX, centerY;
  const sourceGapOffset = { x: 0, y: 0 };
  const targetGapOffset = { x: 0, y: 0 };

  const [defaultCenterX, defaultCenterY, defaultOffsetX, defaultOffsetY] = getEdgeCenter({
    sourceX: source.x,
    sourceY: source.y,
    targetX: target.x,
    targetY: target.y,
  });

  // opposite handle positions, default case
  if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
    centerX = center.x ?? defaultCenterX;
    centerY = center.y ?? defaultCenterY;
    /*
     *    --->
     *    |
     * >---
     */
    const verticalSplit: Vector2[] = [
      { x: centerX, y: sourceGapped.y },
      { x: centerX, y: targetGapped.y },
    ];
    /*
     *    |
     *  ---
     *  |
     */
    const horizontalSplit: Vector2[] = [
      { x: sourceGapped.x, y: centerY },
      { x: targetGapped.x, y: centerY },
    ];

    if (sourceDir[dirAccessor] === currDir) {
      points = dirAccessor === 'x' ? verticalSplit : horizontalSplit;
    } else {
      points = dirAccessor === 'x' ? horizontalSplit : verticalSplit;
    }
  } else {
    // sourceTarget means we take x from source and y from target, targetSource is the opposite
    const sourceTarget: Vector2[] = [{ x: sourceGapped.x, y: targetGapped.y }];
    const targetSource: Vector2[] = [{ x: targetGapped.x, y: sourceGapped.y }];
    // this handles edges with same handle positions
    if (dirAccessor === 'x') {
      points = sourceDir.x === currDir ? targetSource : sourceTarget;
    } else {
      points = sourceDir.y === currDir ? sourceTarget : targetSource;
    }

    if (sourcePosition === targetPosition) {
      const diff = Math.abs(source[dirAccessor] - target[dirAccessor]);

      // if an edge goes from right to right for example (sourcePosition === targetPosition) and the distance between source.x and target.x is less than the offset, the added point and the gapped source/target will overlap. This leads to a weird edge path. To avoid this we add a gapOffset to the source/target
      if (diff <= offset) {
        const gapOffset = Math.min(offset - 1, offset - diff);
        if (sourceDir[dirAccessor] === currDir) {
          sourceGapOffset[dirAccessor] = (sourceGapped[dirAccessor] > source[dirAccessor] ? -1 : 1) * gapOffset;
        } else {
          targetGapOffset[dirAccessor] = (targetGapped[dirAccessor] > target[dirAccessor] ? -1 : 1) * gapOffset;
        }
      }
    }

    // these are conditions for handling mixed handle positions like Right -> Bottom for example
    if (sourcePosition !== targetPosition) {
      const dirAccessorOpposite = dirAccessor === 'x' ? 'y' : 'x';
      const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessorOpposite];
      const sourceGtTargetOppo = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
      const sourceLtTargetOppo = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
      const flipSourceTarget =
        (sourceDir[dirAccessor] === 1 && ((!isSameDir && sourceGtTargetOppo) || (isSameDir && sourceLtTargetOppo))) ||
        (sourceDir[dirAccessor] !== 1 && ((!isSameDir && sourceLtTargetOppo) || (isSameDir && sourceGtTargetOppo)));

      if (flipSourceTarget) {
        points = dirAccessor === 'x' ? sourceTarget : targetSource;
      }
    }

    const sourceGapPoint = { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y };
    const targetGapPoint = { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y };
    const maxXDistance = Math.max(Math.abs(sourceGapPoint.x - points[0].x), Math.abs(targetGapPoint.x - points[0].x));
    const maxYDistance = Math.max(Math.abs(sourceGapPoint.y - points[0].y), Math.abs(targetGapPoint.y - points[0].y));

    // we want to place the label on the longest segment of the edge
    if (maxXDistance >= maxYDistance) {
      centerX = (sourceGapPoint.x + targetGapPoint.x) / 2;
      centerY = points[0].y;
    } else {
      centerX = points[0].x;
      centerY = (sourceGapPoint.y + targetGapPoint.y) / 2;
    }
  }

  const pathPoints = [
    source,
    { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y },
    ...points,
    { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y },
    target,
  ];

  return [pathPoints, centerX, centerY, defaultOffsetX, defaultOffsetY];
}

function getBend(a: Vector2, b: Vector2, c: Vector2, size: number): string {
  const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size);
  const { x, y } = b;

  // no bend
  if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) {
    return `L${x} ${y}`;
  }

  // first segment is horizontal
  if (a.y === y) {
    const xDir = a.x < c.x ? -1 : 1;
    const yDir = a.y < c.y ? 1 : -1;
    return `L ${x + bendSize * xDir},${y}Q ${x},${y} ${x},${y + bendSize * yDir}`;
  }

  const xDir = a.x < c.x ? 1 : -1;
  const yDir = a.y < c.y ? -1 : 1;
  return `L ${x},${y + bendSize * yDir}Q ${x},${y} ${x + bendSize * xDir},${y}`;
}

/**
 * The `getSmoothStepPath` util returns everything you need to render a stepped path
 * between two nodes. The `borderRadius` property can be used to choose how rounded
 * the corners of those steps are.
 * @public
 * @returns A path string you can use in an SVG, the `labelX` and `labelY` position (center of path)
 * and `offsetX`, `offsetY` between source handle and label.
 *
 * - `path`: the path to use in an SVG `<path>` element.
 * - `labelX`: the `x` position you can use to render a label for this edge.
 * - `labelY`: the `y` position you can use to render a label for this edge.
 * - `offsetX`: the absolute difference between the source `x` position and the `x` position of the
 * middle of this path.
 * - `offsetY`: the absolute difference between the source `y` position and the `y` position of the
 * middle of this path.
 * @example
 * ```js
 *  const source = { x: 0, y: 20 };
 *  const target = { x: 150, y: 100 };
 *
 *  const [path, labelX, labelY, offsetX, offsetY] = getSmoothStepPath({
 *    sourceX: source.x,
 *    sourceY: source.y,
 *    sourcePosition: Side.Right,
 *    targetX: target.x,
 *    targetY: target.y,
 *    targetPosition: Side.Left,
 *  });
 * ```
 * @remarks This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.
 */
export function getSmoothStepPath({
  sourceX,
  sourceY,
  sourcePosition = Side.Bottom,
  targetX,
  targetY,
  targetPosition = Side.Top,
  borderRadius = 5,
  centerX,
  centerY,
  offset = 20,
}: GetSmoothStepPathParams): [path: string, labelX: number, labelY: number, offsetX: number, offsetY: number] {
  const [points, labelX, labelY, offsetX, offsetY] = getPoints({
    source: { x: sourceX, y: sourceY },
    sourcePosition,
    target: { x: targetX, y: targetY },
    targetPosition,
    center: { x: centerX, y: centerY },
    offset,
  });

  const path = points.reduce<string>((res, p, i) => {
    let segment = '';

    if (i > 0 && i < points.length - 1) {
      segment = getBend(points[i - 1], p, points[i + 1], borderRadius);
    } else {
      segment = `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`;
    }

    res += segment;

    return res;
  }, '');

  return [path, labelX, labelY, offsetX, offsetY];
}
