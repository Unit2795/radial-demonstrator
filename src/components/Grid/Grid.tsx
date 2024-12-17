import {useCallback, useRef, useState} from "react";
import {
	MAXRADIUS,
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

	const [highlightedCell, setHighlightedCell] = useState<string | null>(null);

	const calculateCellPath = useCallback((radialIndex: number, spokeIndex: number) => {
		const radialStep = MAXRADIUS / radials;
		const spokeAngle = (2 * Math.PI) / spokes;

		const innerRadius = radialIndex * radialStep;
		const outerRadius = (radialIndex + 1) * radialStep;

		// Check if within standoff and if spoke should be drawn
		let startAngle = spokeIndex * spokeAngle;
		let endAngle = (spokeIndex + 1) * spokeAngle;
		const isWithinStandoff = innerRadius < (MAXRADIUS / radials) * SPOKE_STANDOFF_DISTANCE;

		if(isWithinStandoff){
			const startSpoke = Math.floor(spokeIndex / 4) * 4;
			const endSpoke = Math.ceil((spokeIndex + 1) / 4) * 4;
			startAngle = startSpoke * spokeAngle;
			endAngle = endSpoke * spokeAngle;
		}

		const p1 = toCartesian({ radius: innerRadius, angle: startAngle });
		const p2 = toCartesian({ radius: outerRadius, angle: startAngle });
		const p3 = toCartesian({ radius: outerRadius, angle: endAngle });
		const p4 = toCartesian({ radius: innerRadius, angle: endAngle });

		return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${outerRadius} ${outerRadius} 0 0 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${innerRadius} ${innerRadius} 0 0 0 ${p1.x} ${p1.y}`;
	}, [radials, spokes])

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
			setHighlightedCell(null);
			return;
		}

		// Calculate cell indices for highlighting
		const radialIndex = Math.floor(polar.radius / (MAXRADIUS / radials));
		const spokeIndex = Math.floor(polar.angle / (2 * Math.PI / spokes));
		const path = calculateCellPath(radialIndex, spokeIndex);

		setHighlightedCell(path);
	}, [calculateCellPath, radials, spokes]);

    return (
		<svg
			className={"max-h-screen mx-auto cursor-pointer"}
			viewBox={`0 0 ${VIEWPORT} ${VIEWPORT}`}
			ref={svgRef}
			preserveAspectRatio="xMidYMid meet"
			onMouseMove={handleMouseMove}
			onMouseLeave={() => setHighlightedCell(null)}
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
					d={highlightedCell}
					fill="rgba(255, 255, 255, 0.3)"
					stroke="none"
				/>
			)}
		</svg>
	);
};

export default Grid;