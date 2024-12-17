export type Point = { x: number; y: number };
export type PolarCoord = { radius: number; angle: number };
export interface CellPosition { radialIndex: number;spokeIndex: number }

// Amount of padding in pixels to add to the edge of the SVG container, to prevent clipping
export const PADDING = 50;
export const VIEWPORT = 1000;
export const CENTER = VIEWPORT / 2;
export const MAXRADIUS = VIEWPORT / 2 - PADDING;
// Number of radial axes away from the center of the grid to draw a reduced number of spokes
export const SPOKE_STANDOFF_DISTANCE = 2;


// Helper functions to handle coordinate conversions and calculations
export const toPolar = (point: Point): PolarCoord => {
	const dx = point.x - CENTER;
	const dy = point.y - CENTER;
	let angle = Math.atan2(dy, dx);
	if (angle < 0) angle += 2 * Math.PI;

	return {
		radius: Math.sqrt(dx * dx + dy * dy),
		angle
	};
};

export const toCartesian = (polar: PolarCoord): Point => ({
	x: CENTER + Math.cos(polar.angle) * polar.radius,
	y: CENTER + Math.sin(polar.angle) * polar.radius
});