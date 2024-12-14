import {useEffect, useRef, useState} from "react";
import {throttle} from "lodash";

// Amount of padding in pixels to add to the edge of the SVG container, to prevent clipping
const PADDING = 20;

const Grid = () => {
	const svgRef = useRef<SVGSVGElement>(null);

	const [radials] = useState(5);
	const [spokes] = useState(12);
	const [containerSize, setContainerSize] = useState({
		width: 0,
		height: 0,
		maxRadius: 0,
		center: {
			x: 0,
			y: 0
		}
	});
	const {maxRadius, center} = containerSize;


	const throttledResize = throttle((entries) => {
		for (const entry of entries) {
			const { width, height } = entry.contentRect;
			// Calculate the maximum radius that can fit in the SVG container.
			const maxRadius = Math.min(width, height) / 2 - PADDING;
			setContainerSize({
				width,
				height,
				maxRadius,
				center: {
					x: width / 2,
					y: height / 2
				}
			});
		}
	}, 500);

	// Observe resize events on the SVG container to update the graph as needed
	useEffect(() => {
		const svgElement = svgRef.current;
		if (!svgElement) return;

		const resizeObserver = new ResizeObserver((entries) => {
			throttledResize(entries);
		});

		resizeObserver.observe(svgElement);

		// Cleanup observer on unmount
		return () => {
			if (!svgElement) return;
			resizeObserver.unobserve(svgElement);
			resizeObserver.disconnect();
		};
	}, []);

    return (
		<svg
			style={{
				minHeight: "100vh",
			}}
			viewBox="0 0 100 100"
			ref={svgRef}
		>
			{
				Array.from({length: radials}).map((_, i) => {
					// Calculate the radius for the current radial axis
					const radius = (maxRadius / radials) * (i + 1);

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
					const x2 = center.x + Math.cos(angle) * maxRadius;
					const y2 = center.y + Math.sin(angle) * maxRadius;

					return (
						<line
							key={i}
							x1={center.x}
							y1={center.y}
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