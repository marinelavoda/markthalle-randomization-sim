import React, { useState, useId } from 'react';
import { SimulationResult, HistogramBin } from '../simulation';
import { Layers, Columns } from 'lucide-react';

interface HistogramChartProps {
  result: SimulationResult;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({ result }) => {
  const { bins, params, randomSummary, managerSummary } = result;
  const { trueEffect } = params;

  const [viewMode, setViewMode] = useState<'overlaid' | 'sideBySide'>('overlaid');
  const [hoveredBin, setHoveredBin] = useState<HistogramBin | null>(null);

  const filterId = useId();

  // Find max count for scaling
  const maxRandomCount = Math.max(...bins.map(b => b.randomCount), 1);
  const maxManagerCount = Math.max(...bins.map(b => b.managerCount), 1);
  const maxCombinedCount = Math.max(maxRandomCount, maxManagerCount);

  const xMin = bins[0]?.x0 ?? -1000;
  const xMax = bins[bins.length - 1]?.x1 ?? 1000;
  const xRange = xMax - xMin || 1;

  // SVG dimensions
  const width = 800;
  const height = viewMode === 'overlaid' ? 360 : 250;
  const margin = { top: 30, right: 30, bottom: 45, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const getX = (val: number) => {
    return margin.left + ((val - xMin) / xRange) * innerWidth;
  };

  const getYCombined = (count: number) => {
    return margin.top + innerHeight - (count / maxCombinedCount) * innerHeight;
  };

  const getYSingle = (count: number, maxC: number) => {
    return margin.top + innerHeight - (count / maxC) * innerHeight;
  };

  // Generate tick values for X axis
  const step = Math.pow(10, Math.floor(Math.log10(xRange / 6)));
  const xStep = (xRange / 6 > 2.5 * step) ? 2.5 * step : (xRange / 6 > 2 * step) ? 2 * step : step;
  const xTicks: number[] = [];
  const firstTick = Math.ceil(xMin / xStep) * xStep;
  for (let t = firstTick; t <= xMax; t += xStep) {
    xTicks.push(t);
  }

  const formatEuro = (v: number) => `${v > 0 ? '+' : ''}€${Math.round(v)}`;

  // Wrong sign region bounds
  const hasWrongSign = trueEffect !== 0;
  const wrongSignX0 = trueEffect < 0 ? Math.max(0, xMin) : xMin;
  const wrongSignX1 = trueEffect < 0 ? xMax : Math.min(0, xMax);
  const wrongSignWidth = Math.max(0, getX(wrongSignX1) - getX(wrongSignX0));

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
        <div>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            Sampling Distribution of Estimates ({params.numPilots.toLocaleString()} Simulated Pilots)
          </h3>
          <p className="text-xs text-stone-500">
            Comparing difference-in-means estimates: <span className="text-emerald-700 font-medium">Random A/B Assignment</span> vs.{' '}
            <span className="text-amber-700 font-medium">Manager&apos;s Selective Scheduling</span>
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('overlaid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'overlaid'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overlaid</span>
          </button>
          <button
            onClick={() => setViewMode('sideBySide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'sideBySide'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Legend & Key Indicators */}
      <div className="flex flex-wrap items-center justify-between text-xs gap-3 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block opacity-80" />
            <span className="text-stone-700 font-sans">Random Assignment (Mean: {formatEuro(randomSummary.meanEstimate)})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block opacity-80" />
            <span className="text-stone-700 font-sans">Manager&apos;s Choice (Mean: {formatEuro(managerSummary.meanEstimate)})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-stone-900 inline-block" />
            <span className="text-stone-900 font-semibold font-sans">True Effect ({formatEuro(trueEffect)})</span>
          </div>
        </div>

        {hasWrongSign && (
          <div className="text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 font-sans">
            Shaded Zone: Wrong Sign {trueEffect < 0 ? '(> €0 illusion of gain)' : '(< €0 illusion of loss)'}
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      {viewMode === 'overlaid' ? (
        <div className="relative w-full aspect-16/9 sm:aspect-21/9 min-h-[300px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible select-none"
          >
            <defs>
              <pattern id={`wrong-sign-pattern-${filterId}`} width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#f43f5e" strokeWidth="1" strokeOpacity="0.15" />
              </pattern>
            </defs>

            {/* Wrong sign background shading */}
            {hasWrongSign && wrongSignWidth > 0 && (
              <rect
                x={getX(wrongSignX0)}
                y={margin.top}
                width={wrongSignWidth}
                height={innerHeight}
                fill={`url(#wrong-sign-pattern-${filterId})`}
                opacity={0.7}
              />
            )}

            {/* Grid lines */}
            {xTicks.map(tick => (
              <g key={`grid-x-${tick}`}>
                <line
                  x1={getX(tick)}
                  x2={getX(tick)}
                  y1={margin.top}
                  y2={margin.top + innerHeight}
                  stroke="#e7e5e4"
                  strokeDasharray="2,2"
                />
                <text
                  x={getX(tick)}
                  y={margin.top + innerHeight + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-stone-500 font-mono"
                >
                  {formatEuro(tick)}
                </text>
              </g>
            ))}

            {/* Zero Axis if in range */}
            {xMin <= 0 && xMax >= 0 && (
              <line
                x1={getX(0)}
                x2={getX(0)}
                y1={margin.top}
                y2={margin.top + innerHeight}
                stroke="#a8a29e"
                strokeWidth={1}
              />
            )}

            {/* Random Assignment Bars */}
            {bins.map((b, i) => {
              const x = getX(b.x0);
              const barW = Math.max(1, getX(b.x1) - getX(b.x0) - 1);
              const y = getYCombined(b.randomCount);
              const h = margin.top + innerHeight - y;

              return (
                <rect
                  key={`rbar-${i}`}
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(0, h)}
                  fill="#10b981"
                  fillOpacity={hoveredBin === b ? 0.9 : 0.45}
                  stroke="#059669"
                  strokeWidth={0.5}
                  onMouseEnter={() => setHoveredBin(b)}
                  onMouseLeave={() => setHoveredBin(null)}
                  className="transition-colors cursor-pointer"
                />
              );
            })}

            {/* Manager Choice Bars */}
            {bins.map((b, i) => {
              const x = getX(b.x0);
              const barW = Math.max(1, getX(b.x1) - getX(b.x0) - 1);
              const y = getYCombined(b.managerCount);
              const h = margin.top + innerHeight - y;

              return (
                <rect
                  key={`mbar-${i}`}
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(0, h)}
                  fill="#f59e0b"
                  fillOpacity={hoveredBin === b ? 0.9 : 0.55}
                  stroke="#d97706"
                  strokeWidth={0.5}
                  onMouseEnter={() => setHoveredBin(b)}
                  onMouseLeave={() => setHoveredBin(null)}
                  className="transition-colors cursor-pointer"
                />
              );
            })}

            {/* Vertical Marker: Random Mean */}
            <line
              x1={getX(randomSummary.meanEstimate)}
              x2={getX(randomSummary.meanEstimate)}
              y1={margin.top - 6}
              y2={margin.top + innerHeight}
              stroke="#047857"
              strokeWidth={2}
              strokeDasharray="4,3"
            />

            {/* Vertical Marker: Manager Mean */}
            <line
              x1={getX(managerSummary.meanEstimate)}
              x2={getX(managerSummary.meanEstimate)}
              y1={margin.top - 6}
              y2={margin.top + innerHeight}
              stroke="#b45309"
              strokeWidth={2}
              strokeDasharray="4,3"
            />

            {/* Vertical Marker: TRUE EFFECT */}
            <line
              x1={getX(trueEffect)}
              x2={getX(trueEffect)}
              y1={margin.top - 16}
              y2={margin.top + innerHeight}
              stroke="#1c1917"
              strokeWidth={2.5}
            />

            {/* True Effect Flag Badge */}
            <g transform={`translate(${getX(trueEffect)}, ${margin.top - 16})`}>
              <rect
                x="-40"
                y="-14"
                width="80"
                height="16"
                rx="3"
                fill="#1c1917"
              />
              <text
                x="0"
                y="-3"
                textAnchor="middle"
                className="text-[9px] fill-amber-300 font-mono font-bold"
              >
                τ = {formatEuro(trueEffect)}
              </text>
            </g>

            {/* Axis Baseline */}
            <line
              x1={margin.left}
              x2={margin.left + innerWidth}
              y1={margin.top + innerHeight}
              y2={margin.top + innerHeight}
              stroke="#78716c"
              strokeWidth={1}
            />

            {/* Y Axis Label */}
            <text
              transform={`rotate(-90)`}
              x={-(margin.top + innerHeight / 2)}
              y={margin.left - 40}
              textAnchor="middle"
              className="text-[11px] fill-stone-500 font-sans"
            >
              Frequency (Simulated Pilots)
            </text>

            {/* X Axis Label */}
            <text
              x={margin.left + innerWidth / 2}
              y={margin.top + innerHeight + 35}
              textAnchor="middle"
              className="text-[11px] fill-stone-600 font-sans font-medium"
            >
              Estimated Difference-in-Means Effect (Average Event Tuesday Sales − Normal Tuesday Sales)
            </text>
          </svg>
        </div>
      ) : (
        /* Side by Side Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Panel 1: Random Assignment */}
          <div className="border border-stone-200 rounded-lg p-3 bg-stone-50/50">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-emerald-800">Random Assignment (A/B Test)</span>
              <span className="font-mono text-emerald-700">Mean: {formatEuro(randomSummary.meanEstimate)} · Bias: {formatEuro(randomSummary.bias)}</span>
            </div>
            <div className="w-full aspect-16/10">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Grid */}
                {xTicks.map(tick => (
                  <line
                    key={`side-r-tick-${tick}`}
                    x1={getX(tick)}
                    x2={getX(tick)}
                    y1={margin.top}
                    y2={margin.top + innerHeight}
                    stroke="#e7e5e4"
                    strokeDasharray="2,2"
                  />
                ))}
                {/* Bars */}
                {bins.map((b, i) => {
                  const x = getX(b.x0);
                  const barW = Math.max(1, getX(b.x1) - getX(b.x0) - 1);
                  const y = getYSingle(b.randomCount, maxRandomCount);
                  const h = margin.top + innerHeight - y;
                  return (
                    <rect
                      key={`srbar-${i}`}
                      x={x}
                      y={y}
                      width={barW}
                      height={Math.max(0, h)}
                      fill="#10b981"
                      fillOpacity={0.8}
                      stroke="#059669"
                      strokeWidth={0.5}
                    />
                  );
                })}
                {/* True effect line */}
                <line
                  x1={getX(trueEffect)}
                  x2={getX(trueEffect)}
                  y1={margin.top}
                  y2={margin.top + innerHeight}
                  stroke="#1c1917"
                  strokeWidth={2}
                  strokeDasharray="3,2"
                />
                {/* Mean line */}
                <line
                  x1={getX(randomSummary.meanEstimate)}
                  x2={getX(randomSummary.meanEstimate)}
                  y1={margin.top}
                  y2={margin.top + innerHeight}
                  stroke="#047857"
                  strokeWidth={2}
                />
                <line
                  x1={margin.left}
                  x2={margin.left + innerWidth}
                  y1={margin.top + innerHeight}
                  y2={margin.top + innerHeight}
                  stroke="#78716c"
                />
              </svg>
            </div>
          </div>

          {/* Panel 2: Manager Choice */}
          <div className="border border-stone-200 rounded-lg p-3 bg-stone-50/50">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-amber-800">Manager&apos;s Selective Choice</span>
              <span className="font-mono text-amber-700">Mean: {formatEuro(managerSummary.meanEstimate)} · Bias: {formatEuro(managerSummary.bias)}</span>
            </div>
            <div className="w-full aspect-16/10">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Grid */}
                {xTicks.map(tick => (
                  <line
                    key={`side-m-tick-${tick}`}
                    x1={getX(tick)}
                    x2={getX(tick)}
                    y1={margin.top}
                    y2={margin.top + innerHeight}
                    stroke="#e7e5e4"
                    strokeDasharray="2,2"
                  />
                ))}
                {/* Bars */}
                {bins.map((b, i) => {
                  const x = getX(b.x0);
                  const barW = Math.max(1, getX(b.x1) - getX(b.x0) - 1);
                  const y = getYSingle(b.managerCount, maxManagerCount);
                  const h = margin.top + innerHeight - y;
                  return (
                    <rect
                      key={`smbar-${i}`}
                      x={x}
                      y={y}
                      width={barW}
                      height={Math.max(0, h)}
                      fill="#f59e0b"
                      fillOpacity={0.8}
                      stroke="#d97706"
                      strokeWidth={0.5}
                    />
                  );
                })}
                {/* True effect line */}
                <line
                  x1={getX(trueEffect)}
                  x2={getX(trueEffect)}
                  y1={margin.top}
                  y2={margin.top + innerHeight}
                  stroke="#1c1917"
                  strokeWidth={2}
                  strokeDasharray="3,2"
                />
                {/* Mean line */}
                <line
                  x1={getX(managerSummary.meanEstimate)}
                  x2={getX(managerSummary.meanEstimate)}
                  y1={margin.top}
                  y2={margin.top + innerHeight}
                  stroke="#b45309"
                  strokeWidth={2}
                />
                <line
                  x1={margin.left}
                  x2={margin.left + innerWidth}
                  y1={margin.top + innerHeight}
                  y2={margin.top + innerHeight}
                  stroke="#78716c"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip / Inspection Bar */}
      <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 text-xs flex flex-wrap items-center justify-between gap-3 min-h-[46px]">
        {hoveredBin ? (
          <>
            <span className="font-mono text-stone-700">
              Bin Range: <strong>{formatEuro(hoveredBin.x0)}</strong> to <strong>{formatEuro(hoveredBin.x1)}</strong>
            </span>
            <div className="flex items-center gap-4 font-mono">
              <span className="text-emerald-700">
                Random Pilots: <strong>{hoveredBin.randomCount}</strong> ({(hoveredBin.randomCount / params.numPilots * 100).toFixed(1)}%)
              </span>
              <span className="text-amber-700">
                Manager Pilots: <strong>{hoveredBin.managerCount}</strong> ({(hoveredBin.managerCount / params.numPilots * 100).toFixed(1)}%)
              </span>
            </div>
          </>
        ) : (
          <span className="text-stone-500 italic">
            Hover over any histogram bar to inspect exact frequency counts and empirical density.
          </span>
        )}
      </div>
    </div>
  );
};
