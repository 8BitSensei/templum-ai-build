import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Site } from '../data/sites';

interface TemporalHistogramSliderProps {
  sites: Site[];
  startDate: number;
  endDate: number;
  onRangeChange: (start: number, end: number) => void;
  minYear?: number;
  maxYear?: number;
  step?: number;
}

const TemporalHistogramSlider: React.FC<TemporalHistogramSliderProps> = ({
  sites,
  startDate,
  endDate,
  onRangeChange,
  minYear = -150,
  maxYear = 600,
  step = 10
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visualStart, setVisualStart] = useState(startDate);
  const [visualEnd, setVisualEnd] = useState(endDate);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setVisualStart(startDate);
      setVisualEnd(endDate);
    }
  }, [startDate, endDate, isDragging]);

  useEffect(() => {
    if (containerRef.current) {
      const updateWidth = () => {
        setContainerWidth(containerRef.current?.offsetWidth || 0);
      };
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, []);

  const histogramData = useMemo(() => {
    const bins = d3.range(minYear, maxYear + step, step);
    const counts = new Array(bins.length - 1).fill(0);

    sites.forEach(site => {
      // A site is "active" in a bin if its range overlaps with the bin range
      bins.forEach((binStart, i) => {
        if (i === bins.length - 1) return;
        const binEnd = bins[i + 1];
        
        // Overlap logic
        if (site.startYear <= binEnd && site.endYear >= binStart) {
          counts[i]++;
        }
      });
    });

    return bins.slice(0, -1).map((bin, i) => ({
      year: bin,
      count: counts[i]
    }));
  }, [sites, minYear, maxYear, step]);

  const maxCount = d3.max(histogramData, d => d.count) || 1;

  const xScale = d3.scaleLinear()
    .domain([minYear, maxYear])
    .range([0, containerWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([0, 40]); // Height of the bars

  // Track the initial values when a pan starts
  const panStartValues = useRef<{ start: number; end: number } | null>(null);

  const handlePanStart = () => {
    panStartValues.current = { start: startDate, end: endDate };
    setIsDragging(true);
  };

  const handleStartPan = (event: any, info: any) => {
    if (!containerRef.current) return;
    
    const deltaYear = xScale.invert(info.delta.x) - xScale.invert(0);
    const newYear = visualStart + deltaYear;
    const clampedRawYear = Math.max(minYear, Math.min(newYear, visualEnd - 1)); // Allow fine movement
    setVisualStart(clampedRawYear);

    // Calculate snapped year for data updates
    const snappedYear = Math.round(clampedRawYear / step) * step;
    
    if (snappedYear !== startDate) {
      onRangeChange(snappedYear, endDate);
    }
  };

  const handleEndPan = (event: any, info: any) => {
    if (!containerRef.current) return;
    
    const deltaYear = xScale.invert(info.delta.x) - xScale.invert(0);
    const newYear = visualEnd + deltaYear;
    const clampedRawYear = Math.min(maxYear, Math.max(newYear, visualStart + 1));
    setVisualEnd(clampedRawYear);

    const snappedYear = Math.round(clampedRawYear / step) * step;
    
    if (snappedYear !== endDate) {
      onRangeChange(startDate, snappedYear);
    }
  };

  const handleWindowPan = (event: any, info: any) => {
    if (!containerRef.current || !panStartValues.current) return;
    
    const deltaYear = xScale.invert(info.delta.x) - xScale.invert(0);
    
    const range = visualEnd - visualStart;
    let newStart = visualStart + deltaYear;
    let newEnd = newStart + range;

    if (newStart < minYear) {
      newStart = minYear;
      newEnd = minYear + range;
    } else if (newEnd > maxYear) {
      newEnd = maxYear;
      newStart = maxYear - range;
    }

    setVisualStart(newStart);
    setVisualEnd(newEnd);

    const snappedStart = Math.round(newStart / step) * step;
    const snappedEnd = snappedStart + Math.round(range / step) * step;

    if (snappedStart !== startDate || snappedEnd !== endDate) {
      onRangeChange(snappedStart, snappedEnd);
    }
  };

  const formatYear = (year: number) => {
    if (year <= minYear) return `pre ${Math.abs(minYear)} BCE`;
    if (year >= maxYear) return `post ${maxYear} CE`;
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
  };

  return (
    <div className="w-full space-y-3 touch-none" ref={containerRef}>
      <div className="relative h-16 w-full select-none">
        {containerWidth > 0 && (
          <>
            {/* Histogram Bars */}
            <div className="absolute bottom-4 left-0 w-full h-12 pointer-events-none">
              {histogramData.map((d, i) => (
                <div 
                  key={i}
                  className="absolute bottom-0 bg-primary/20 transition-all duration-300 rounded-t-[1px]"
                  style={{
                    left: xScale(d.year),
                    width: Math.max(0, xScale(d.year + step) - xScale(d.year) - 1),
                    height: `${yScale(d.count)}px`,
                    opacity: d.year >= startDate && d.year < endDate ? 1 : 0.2,
                    backgroundColor: d.year >= startDate && d.year < endDate ? 'var(--color-primary)' : undefined
                  }}
                />
              ))}
            </div>

            {/* Slider Track */}
            <div className="absolute bottom-4 left-0 w-full h-1 bg-black/5 rounded-full pointer-events-none" />

            {/* Selected Range Window */}
            <motion.div
              className="absolute bottom-4 h-1 bg-primary cursor-grab active:cursor-grabbing group"
              style={{
                left: xScale(visualStart),
                width: Math.max(0, xScale(visualEnd) - xScale(visualStart))
              }}
              onPanStart={handlePanStart}
              onPan={handleWindowPan}
              onPanEnd={() => {
                panStartValues.current = null;
                setIsDragging(false);
              }}
            >
              {/* Visual indicator for draggable area */}
              <div className="absolute inset-0 -top-12 bottom-0 bg-primary/5 group-hover:bg-primary/10 transition-colors rounded-t-lg" />
            </motion.div>

            {/* Handles */}
            <motion.div
              className="absolute bottom-[2px] w-6 h-6 flex items-center justify-center cursor-ew-resize z-30"
              style={{ left: xScale(visualStart) - 12 }}
              onPanStart={handlePanStart}
              onPan={handleStartPan}
              onPanEnd={() => {
                panStartValues.current = null;
                setIsDragging(false);
              }}
            >
              <motion.div 
                className="w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 1.4 }}
              />
            </motion.div>

            <motion.div
              className="absolute bottom-[2px] w-6 h-6 flex items-center justify-center cursor-ew-resize z-30"
              style={{ left: xScale(visualEnd) - 12 }}
              onPanStart={handlePanStart}
              onPan={handleEndPan}
              onPanEnd={() => {
                panStartValues.current = null;
                setIsDragging(false);
              }}
            >
              <motion.div 
                className="w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 1.4 }}
              />
            </motion.div>
          </>
        )}
      </div>

      <div className="flex justify-between items-center font-label text-[10px] uppercase tracking-widest text-on-surface-variant px-1">
        <div className="flex flex-col">
          <span className="opacity-50 mb-1">From</span>
          <span className="text-primary font-bold text-xs">{formatYear(startDate)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="opacity-50 mb-1">To</span>
          <span className="text-primary font-bold text-xs">{formatYear(endDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default TemporalHistogramSlider;
