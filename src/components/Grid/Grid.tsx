import {MouseEvent, useCallback, useRef, useState} from "react";
import {CellPosition, MAXRADIUS, PADDING, SPOKE_STANDOFF_DISTANCE, toCartesian, toPolar, VIEWPORT} from "./helpers.ts";
import GridLines from "./GridLines.tsx";


const Grid = () => {
	const svgRef = useRef<SVGSVGElement>(null);

	const [radials] = useState(8);
	const [spokes] = useState(48);

	const [highlightedCell, setHighlightedCell] = useState<{
		path: string;
		position: CellPosition;
	} | null>(null);
	const [selectedCell, setSelectedCell] = useState<{
		path: string;
		position: CellPosition;
	} | null>(null);
	const [arrows, setArrows] = useState<CellPosition[][]>([]);

	const calculateCellPath = useCallback((radialIndex: number, spokeIndex: number) => {
		const radialStep = MAXRADIUS / radials;
		const spokeAngle = (2 * Math.PI) / spokes;
		const innerRadius = radialIndex * radialStep;
		const outerRadius = (radialIndex + 1) * radialStep;

		// Check if within standoff and if spoke should be drawn
		let startAngle = spokeIndex * spokeAngle;
		let endAngle = (spokeIndex + 1) * spokeAngle;

		// Check if this cell is within the "standoff" distance from the center
		// Standoff is used to create wider segments near the center for better visibility/interaction
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

		return `M ${p1.x} ${p1.y} 
				L ${p2.x} ${p2.y} 
				A ${outerRadius} ${outerRadius} 0 0 1 ${p3.x} ${p3.y} 
				L ${p4.x} ${p4.y} 
				A ${innerRadius} ${innerRadius} 0 0 0 ${p1.x} ${p1.y}`;
	}, [radials, spokes]);

	// TODO: This arrow drawing function needs to get the proper center for the central standoff cells since they have fewer spokes
	const getCellCenter = useCallback((position: CellPosition) => {
		const radialStep = MAXRADIUS / radials;
		const spokeAngle = (2 * Math.PI) / spokes;
		const radius = (position.radialIndex + 0.5) * radialStep;
		const angle = (position.spokeIndex + 0.5) * spokeAngle;
		return toCartesian({ radius, angle });
	}, [radials, spokes]);

	const handleClick = () => {
		if (!highlightedCell) return null;

		setSelectedCell(prev => {
			// Check if cell is already selected
			if (
				prev &&
				(prev.position.radialIndex === highlightedCell.position.radialIndex) &&
				(prev.position.spokeIndex === highlightedCell.position.spokeIndex)
			) {
				return null;
			} else if (prev && selectedCell) {
				setArrows(prevArrows => {
					return [...prevArrows, [selectedCell.position, highlightedCell.position]];
				});
				return null;
			}

			return highlightedCell;
		});
	};

	// Converts mouse position to SVG coordinates and updates ghost dot position, snapping to the nearest radial circle or spoke line based on proximity and standoff rules.
	const handleMouseMove = useCallback((event: MouseEvent<SVGSVGElement>) => {
		const svg = svgRef.current;
		const CTM = svg?.getScreenCTM();
		if (!svg || !CTM) return;

		// Convert screen coordinates to SVG coordinates
		const svgPoint = new DOMPoint(event.clientX, event.clientY).matrixTransform(CTM.inverse());
		// Convert to polar coordinates
		const polar = toPolar({ x: svgPoint.x, y: svgPoint.y });

		// Handle points outside the grid
		if (polar.radius > (MAXRADIUS + PADDING)) {
			setHighlightedCell(null);
			return;
		}

		// Calculate cell indices for highlighting
		const radialIndex = Math.floor(polar.radius / (MAXRADIUS / radials));
		const spokeIndex = Math.floor(polar.angle / (2 * Math.PI / spokes));

		console.log(radialIndex, spokeIndex);

		setHighlightedCell({
			path: calculateCellPath(radialIndex, spokeIndex),
			position: { radialIndex, spokeIndex }
		});
	}, [calculateCellPath, radials, spokes]);

    return (
		<svg
			className={"max-h-screen mx-auto cursor-pointer"}
			viewBox={`0 0 ${VIEWPORT} ${VIEWPORT}`}
			ref={svgRef}
			preserveAspectRatio="xMidYMid meet"
			onMouseMove={handleMouseMove}
			onMouseLeave={() => setHighlightedCell(null)}
			onClick={handleClick}
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


			{/* Draw connection lines between selected cells */}
			{arrows.length > 0 && arrows.map((cell, index) => {
				const start = getCellCenter(cell[0]);
				const end = getCellCenter(cell[1]);
				return (
					<line
						key={`connection-${index}`}
						x1={start.x}
						y1={start.y}
						x2={end.x}
						y2={end.y}
						stroke="white"
						strokeWidth="2"
						markerEnd="url(#arrow)"
					/>
				);
			})}

			{selectedCell && (
				<path
					d={selectedCell.path}
					fill="rgba(0, 255, 0, 0.3)"
					stroke="none"
				/>
			)}

			{highlightedCell && (
				<path
					d={highlightedCell.path}
					fill="rgba(255, 255, 255, 0.3)"
					stroke="none"
				/>
			)}
		</svg>
	);
};

export default Grid;