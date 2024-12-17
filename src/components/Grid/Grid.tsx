import {useCallback, useRef, useState} from "react";
import {
	findClosestRadial,
	findClosestSpoke, MAXRADIUS,
	SPOKE_STANDOFF_DISTANCE,
	toCartesian,
	toPolar,
	VIEWPORT
} from "./helpers.ts";
import GridLines from "./GridLines.tsx";


const Grid = () => {
	const svgRef = useRef<SVGSVGElement>(null);

	const [radials] = useState(8);
	const [spokes] = useState(48);

	const [ghostDot, setGhostDot] = useState<{ x: number; y: number; } | null>(null);
	const [highlightedCell, setHighlightedCell] = useState<{ radialIndex: number; spokeIndex: number } | null>(null);

	// Converts mouse position to SVG coordinates and updates ghost dot position, snapping to the nearest radial circle or spoke line based on proximity and standoff rules.
	const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
		if (!svgRef.current) return;
		const CTM = svgRef.current.getScreenCTM();
		if (!CTM) return;

		// Convert screen coordinates to SVG coordinates
		const svgPoint = new DOMPoint(event.clientX, event.clientY)
			.matrixTransform(CTM.inverse());

		// Convert to polar coordinates
		const polar = toPolar({ x: svgPoint.x, y: svgPoint.y });

		// Handle points outside the grid
		if (polar.radius > MAXRADIUS) {
			setGhostDot(toCartesian({ ...polar, radius: MAXRADIUS }));
			return;
		}

		// Calculate standoff parameters
		const standoffRadius = (MAXRADIUS / radials) * SPOKE_STANDOFF_DISTANCE;
		const isWithinStandoff = polar.radius <= standoffRadius;

		// Find closest grid elements
		const radial = findClosestRadial(polar.radius, radials);
		const spoke = findClosestSpoke(polar, spokes, isWithinStandoff);

		// Determine snap target
		const snapToRadial =
			radial.distance <= spoke.distance ||
			(isWithinStandoff && spoke.index % 4 !== 0);

		// Calculate final position
		const snapPoint = snapToRadial
			? toCartesian({ angle: polar.angle, radius: radial.radius })
			: toCartesian({ angle: spoke.angle, radius: polar.radius });

		setGhostDot(snapPoint);

		// Calculate cell indices for highlighting
		const radialIndex = Math.floor(polar.radius / (MAXRADIUS / radials));
		const spokeIndex = Math.floor(polar.angle / (2 * Math.PI / spokes));

		setHighlightedCell({ radialIndex, spokeIndex });
	}, [radials, spokes]);

	const calculateCellPath = (radialIndex: number, spokeIndex: number) => {
		const radialStep = MAXRADIUS / radials;
		const spokeAngle = (2 * Math.PI) / spokes;

		const innerRadius = radialIndex * radialStep;
		const outerRadius = (radialIndex + 1) * radialStep;
		const startAngle = spokeIndex * spokeAngle;
		const endAngle = (spokeIndex + 1) * spokeAngle;

		const p1 = toCartesian({ radius: innerRadius, angle: startAngle });
		const p2 = toCartesian({ radius: outerRadius, angle: startAngle });
		const p3 = toCartesian({ radius: outerRadius, angle: endAngle });
		const p4 = toCartesian({ radius: innerRadius, angle: endAngle });

		return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${outerRadius} ${outerRadius} 0 0 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${innerRadius} ${innerRadius} 0 0 0 ${p1.x} ${p1.y}`;
	};

    return (
		<svg
			className={"max-h-screen mx-auto"}
			viewBox={`0 0 ${VIEWPORT} ${VIEWPORT}`}
			ref={svgRef}
			preserveAspectRatio="xMidYMid meet"
			onMouseMove={handleMouseMove}
			onMouseLeave={() => {setGhostDot(null); setHighlightedCell(null);}}
		>
			<defs>
				{/*Marker to be used as an arrowhead*/}
				<marker
					fill={"white"}
					id="arrow"
					viewBox="0 0 10 10"
					refX="5"
					refY="5"
					markerWidth="6"
					markerHeight="6"
					orient="auto-start-reverse">
					<path d="M 0 0 L 10 5 L 0 10 z"/>
				</marker>
			</defs>

			<GridLines
				radials={radials}
				spokes={spokes}
			/>

			{highlightedCell && (
				<path
					d={calculateCellPath(highlightedCell.radialIndex, highlightedCell.spokeIndex)}
					fill="rgba(255, 255, 255, 0.3)" // Blue with some transparency
					stroke="none"
				/>
			)}

			{/*{ghostDot && (
				<circle
					cx={ghostDot.x}
					cy={ghostDot.y}
					r="5"
					fill="rgba(255, 255, 255, 0.5)"
				/>
			)}*/}
		</svg>
	);
};

export default Grid;