export interface BrushPoint {
  x: number;
  y: number;
}

export function distanceBetween(first: BrushPoint, second: BrushPoint): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function densifyBrushPoints(points: BrushPoint[], maxSpacing = 3): BrushPoint[] {
  if (points.length < 2) return [...points];
  const dense: BrushPoint[] = [points[0]];

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const distance = distanceBetween(start, end);
    const steps = Math.max(1, Math.ceil(distance / maxSpacing));
    for (let step = 1; step <= steps; step += 1) {
      const ratio = step / steps;
      dense.push({
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      });
    }
  }

  return dense;
}

export function drawSmoothBrushStroke(
  context: CanvasRenderingContext2D,
  points: BrushPoint[],
  color: string,
  width: number,
): void {
  if (points.length === 0) return;

  context.save();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();

  if (points.length === 1) {
    context.moveTo(points[0].x - 0.01, points[0].y);
    context.lineTo(points[0].x, points[0].y);
  } else if (points.length === 2) {
    context.moveTo(points[0].x, points[0].y);
    context.lineTo(points[1].x, points[1].y);
  } else {
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length - 1; index += 1) {
      const current = points[index];
      const next = points[index + 1];
      const midpoint = { x: (current.x + next.x) / 2, y: (current.y + next.y) / 2 };
      context.quadraticCurveTo(current.x, current.y, midpoint.x, midpoint.y);
    }
    const penultimate = points[points.length - 2];
    const last = points[points.length - 1];
    context.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);
  }

  context.stroke();
  context.restore();
}
