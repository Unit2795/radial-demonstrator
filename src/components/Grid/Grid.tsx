import {useRef, useState} from "react";

// Amount of padding in pixels to add to the edge of the SVG container, to prevent clipping
const PADDING = 20;
const VIEWPORT = 1000;
const CENTER = VIEWPORT / 2;
const MAXRADIUS = VIEWPORT / 2 - PADDING;

const Grid = () => {
	const svgRef = useRef<SVGSVGElement>(null);

	const [radials] = useState(6);
	const [spokes] = useState(6);

    return (
		<svg
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
					const x2 = CENTER + Math.cos(angle) * MAXRADIUS;
					const y2 = CENTER + Math.sin(angle) * MAXRADIUS;

					return (
						<line
							key={i}
							x1={CENTER}
							y1={CENTER}
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