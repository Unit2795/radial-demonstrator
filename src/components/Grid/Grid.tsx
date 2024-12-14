import {useEffect, useRef, useState} from "react";

// Amount of padding in pixels to add to the edge of the SVG container, to prevent clipping
const PADDING = 20;

const Grid = () => {
	const svgRef = useRef<SVGSVGElement>(null);

	const [concentrics, setConcentrics] = useState(5);
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0, maxRadius: 0 });


	// Observe resize events on the SVG container to update the graph as needed
	useEffect(() => {
		const svgElement = svgRef.current;
		if (!svgElement) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				// Calculate the maximum radius that can fit in the SVG container.
				const maxRadius = Math.min(width, height) / 2 - PADDING;
				setContainerSize({ width, height, maxRadius });
			}
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
			ref={svgRef}
			width="100%"
			height="100%"
		>
			{
				Array.from({length: concentrics}).map((_, i) => {
					// Calculate the radius for the current radial axis
					const radius = (containerSize.maxRadius / concentrics) * (i + 1);

					return (
						<circle
							key={i}
							cx="50%"
							cy="50%"
							r={radius}
							stroke="white"
							fill="none"
						/>
					);
				})
			}
		</svg>
	);
};

export default Grid;