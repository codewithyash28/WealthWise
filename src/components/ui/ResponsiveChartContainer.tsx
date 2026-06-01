import React, { useRef, useState, useEffect } from 'react';

interface ResponsiveChartContainerProps {
  children: (dimensions: { width: number; height: number }) => React.ReactNode;
  className?: string;
  aspectRatio?: number; // width / height
}

export function ResponsiveChartContainer({
  children,
  className = "",
  aspectRatio
}: ResponsiveChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;

      const { width, height } = entries[0].contentRect;

      // If an aspect ratio is provided, we might want to adjust the height accordingly
      // but usually the CSS handles the container size, and we just report back
      // what the container is.

      let finalHeight = height;
      if (aspectRatio && width > 0) {
        finalHeight = width / aspectRatio;
      }

      setDimensions({
        width: Math.floor(width),
        height: Math.floor(finalHeight || height)
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [aspectRatio]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className}`}
      style={{ minHeight: aspectRatio ? 'auto' : '100%' }}
    >
      {dimensions.width > 0 && children(dimensions)}
    </div>
  );
}
