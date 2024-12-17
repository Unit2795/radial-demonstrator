import {useRef, useState} from "react";

// Amount of padding in pixels to add to the edge of the SVG container, to prevent clipping
const PADDING = 20;
const VIEWPORT = 1000;
const CENTER = VIEWPORT / 2;
const MAXRADIUS = VIEWPORT / 2 - PADDING;
// Number of radial axes away from the center of the grid to draw a reduced number of spokes
const SPOKE_STANDOFF_DISTANCE = 2;

const Grid = () => {
	const svgRef = useRef<SVGSVGElement>(null);

	const [radials] = useState(8);
	const [spokes] = useState(48);

    return (
		<svg
			className={"max-h-screen mx-auto"}
			viewBox={`0 0 ${VIEWPORT} ${VIEWPORT}`}
			ref={svgRef}
			preserveAspectRatio="xMidYMid meet"
		>
			{
				Array.from({length: radials}).map((_, i) => {
					// Calculate the radius for the current radial axis
					const radius = (MAXRADIUS / radials) * (i + 1);

					return (
						<circle
							key={i}
							cx="50%"
							cy="50%"
							r={radius}
							stroke="white"
							fill="none"
							strokeWidth="1"
						/>
					);
				})
			}
			{
				Array.from({length: spokes}).map((_, i) => {
					const angle = (i * 2 * Math.PI) / spokes;
					const innerRadius = i % 4 === 0 ?
						0 :
						(MAXRADIUS / radials) * SPOKE_STANDOFF_DISTANCE;

					// Calculate start points using the inner radius
					const x1 = CENTER + Math.cos(angle) * innerRadius;
					const y1 = CENTER + Math.sin(angle) * innerRadius;

					// End points remain the same
					const x2 = CENTER + Math.cos(angle) * MAXRADIUS;
					const y2 = CENTER + Math.sin(angle) * MAXRADIUS;

					return (
						<line
							key={i}
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							stroke={"white"}
							strokeWidth={1}
						/>
					);
				})
			}
		</svg>
	);
};

export default Grid;