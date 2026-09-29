import React, { useState } from 'react';
import { PilotDetail, SimulationParams } from '../simulation';
import { ChevronLeft, ChevronRight, Eye, HelpCircle } from 'lucide-react';

interface SinglePilotScatterProps {
  pilots: PilotDetail[];
  params: SimulationParams;
}

export const SinglePilotScatter: React.FC<SinglePilotScatterProps> = ({ pilots, params }) => {
  const [selectedPilotIndex, setSelectedPilotIndex] = useState(0);
  const [activeMethod, setActiveMethod] = useState<'random' | 'manager' | 'compare'>('compare');
  const [showCounterfactuals, setShowCounterfactuals] = useState(false);
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState<number | null>(null);

  if (!pilots || pilots.length === 0) {
    return null;
  }

  const currentPilot = pilots[selectedPilotIndex] || pilots[0];
  const { weeks, randomEstimate, managerEstimate } = currentPilot;
  const { trueEffect } = params;

  const formatEuro = (v: number) => `${v > 0 ? '+' : ''}€${Math.round(v).toLocaleString()}`;

  // Compute min/max for scatter coordinates
  const allBusyness = weeks.map(w => w.busyness);
  const allSales = weeks.flatMap(w => [w.y0, w.y1, w.yObsRandom, w.yObsManager]);
  const bMin = Math.min(...allBusyness, -2.5);
  const bMax = Math.max(...allBusyness, 2.5);
  const yMin = Math.floor(Math.min(...allSales) / 200) * 200 - 100;
  const yMax = Math.ceil(Math.max(...allSales) / 200) * 200 + 100;

  const width = 640;
  const height = 360;
  const margin = { top: 30, right: 30, bottom: 45, left: 55 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const getX = (b: number) => margin.left + ((b - bMin) / (bMax - bMin)) * innerW;
  const getY = (y: number) => margin.top + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  const bTicks = [-2, -1, 0, 1, 2];
  const yStep = 500;
  const yTicks: number[] = [];
  for (let t = Math.ceil(yMin / yStep) * yStep; t <= yMax; t += yStep) {
    yTicks.push(t);
  }

  const renderScatter = (method: 'random' | 'manager', label: string, estimate: number) => {
    return (
      <div className="bg-stone-50/70 border border-stone-200 rounded-lg p-4 flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-semibold text-stone-900 block font-serif text-sm">
              {label}
            </span>
            <span className="text-[11px] text-stone-500">
              {method === 'random' ? 'Treatment randomly assigned 50/50' : 'Event probability rises with busyness'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-500 block">Pilot Difference-in-Means:</span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              method === 'random' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
            }`}>
              τ̂ = {formatEuro(estimate)}
            </span>
          </div>
        </div>

        {/* SVG Scatter */}
        <div className="w-full aspect-16/10">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible select-none">
            {/* Grid */}
            {bTicks.map(bt => (
              <g key={`b-grid-${bt}`}>
                <line
                  x1={getX(bt)}
                  x2={getX(bt)}
                  y1={margin.top}
                  y2={margin.top + innerH}
                  stroke="#e7e5e4"
                  strokeDasharray="2,2"
                />
                <text
                  x={getX(bt)}
                  y={margin.top + innerH + 16}
                  textAnchor="middle"
                  className="text-[9px] fill-stone-400 font-mono"
                >
                  {bt > 0 ? `+${bt}σ` : bt === 0 ? '0' : `${bt}σ`}
                </text>
              </g>
            ))}

            {yTicks.map(yt => (
              <g key={`y-grid-${yt}`}>
                <line
                  x1={margin.left}
                  x2={margin.left + innerW}
                  y1={getY(yt)}
                  y2={getY(yt)}
                  stroke="#e7e5e4"
                  strokeDasharray="2,2"
                />
                <text
                  x={margin.left - 6}
                  y={getY(yt) + 3}
                  textAnchor="end"
                  className="text-[9px] fill-stone-400 font-mono"
                >
                  €{yt}
                </text>
              </g>
            ))}

            {/* Zero vertical line */}
            <line
              x1={getX(0)}
              x2={getX(0)}
              y1={margin.top}
              y2={margin.top + innerH}
              stroke="#d6d3d1"
            />

            {/* Counterfactual connectors if enabled */}
            {showCounterfactuals && weeks.map(w => {
              const isTreated = method === 'random' ? w.randomAssignment === 1 : w.managerAssignment === 1;
              const yObs = isTreated ? w.y1 : w.y0;
              const yCounter = isTreated ? w.y0 : w.y1;
              return (
                <g key={`cf-line-${w.weekIndex}`}>
                  <line
                    x1={getX(w.busyness)}
                    x2={getX(w.busyness)}
                    y1={getY(yObs)}
                    y2={getY(yCounter)}
                    stroke="#a8a29e"
                    strokeWidth={1}
                    strokeDasharray="2,2"
                  />
                  {/* Counterfactual unobserved circle */}
                  <circle
                    cx={getX(w.busyness)}
                    cy={getY(yCounter)}
                    r={3.5}
                    fill="transparent"
                    stroke={isTreated ? '#64748b' : '#64748b'}
                    strokeWidth={1.5}
                    strokeDasharray="2,2"
                  />
                </g>
              );
            })}

            {/* Scatter points */}
            {weeks.map(w => {
              const isTreated = method === 'random' ? w.randomAssignment === 1 : w.managerAssignment === 1;
              const yObs = method === 'random' ? w.yObsRandom : w.yObsManager;
              const isHovered = hoveredWeekIndex === w.weekIndex;

              return (
                <g
                  key={`point-${w.weekIndex}`}
                  onMouseEnter={() => setHoveredWeekIndex(w.weekIndex)}
                  onMouseLeave={() => setHoveredWeekIndex(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={getX(w.busyness)}
                    cy={getY(yObs)}
                    r={isHovered ? 6.5 : 4.5}
                    fill={isTreated ? '#d97706' : '#2563eb'}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="transition-all"
                  />
                </g>
              );
            })}

            {/* Axes lines */}
            <line
              x1={margin.left}
              x2={margin.left + innerW}
              y1={margin.top + innerH}
              y2={margin.top + innerH}
              stroke="#78716c"
            />
            <line
              x1={margin.left}
              x2={margin.left}
              y1={margin.top}
              y2={margin.top + innerH}
              stroke="#78716c"
            />

            {/* Labels */}
            <text
              x={margin.left + innerW / 2}
              y={margin.top + innerH + 34}
              textAnchor="middle"
              className="text-[10px] fill-stone-600 font-sans"
            >
              Busyness Confounder Score (B_i)
            </text>
            <text
              transform="rotate(-90)"
              x={-(margin.top + innerH / 2)}
              y={margin.left - 38}
              textAnchor="middle"
              className="text-[10px] fill-stone-600 font-sans"
            >
              Observed Tuesday Sales (€)
            </text>
          </svg>
        </div>

        {/* Treatment counts footer */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-200 mt-2 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
            <span>Event Tuesdays: {method === 'random' ? currentPilot.randomTreatedCount : currentPilot.managerTreatedCount}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Normal Tuesdays: {method === 'random' ? currentPilot.randomControlCount : currentPilot.managerControlCount}</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <section id="single-pilot" className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
        <div>
          <h3 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
            <span>Single Pilot Microcosm (Pilot #{currentPilot.pilotIndex} of {params.numPilots.toLocaleString()})</span>
          </h3>
          <p className="text-xs text-stone-500">
            Scatter plot of the {params.numWeeks} weeks: X = Confounder (Busyness/Weather), Y = Tuesday Sales
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Counterfactual toggle */}
          <button
            onClick={() => setShowCounterfactuals(!showCounterfactuals)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              showCounterfactuals
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
            title="Reveal the unobserved potential outcome (Y0 or Y1) for each week"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showCounterfactuals ? 'Hide Counterfactuals' : 'Reveal Potential Outcomes'}</span>
          </button>

          {/* Pilot selector */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedPilotIndex(prev => (prev > 0 ? prev - 1 : pilots.length - 1))}
              className="p-1 text-stone-600 hover:text-stone-900 rounded transition-colors"
              title="Previous pilot"
              aria-label="Previous pilot"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-stone-700">
              Pilot {currentPilot.pilotIndex}/{pilots.length}
            </span>
            <button
              onClick={() => setSelectedPilotIndex(prev => (prev < pilots.length - 1 ? prev + 1 : 0))}
              className="p-1 text-stone-600 hover:text-stone-900 rounded transition-colors"
              title="Next pilot"
              aria-label="Next pilot"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pedagogical Callout */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Why does this single random pilot not hit exactly {formatEuro(trueEffect)}?</strong> In this specific {params.numWeeks}-week run, random assignment estimated{' '}
          <strong className="font-mono">{formatEuro(randomEstimate)}</strong>, while manager selection estimated{' '}
          <strong className="font-mono">{formatEuro(managerEstimate)}</strong>.
          Randomization does not mean <em>every individual run</em> is infallible; it guarantees that across thousands of hypothetical pilots, the procedure has <strong>zero systematic bias</strong>. By contrast, the manager&apos;s cherry-picking creates a structural distortion that repeats week after week.
        </div>
      </div>

      {/* Scatter Plots: Side-by-Side or Selected */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderScatter('random', 'Method A: Random Assignment', randomEstimate)}
        {renderScatter('manager', 'Method B: Manager\'s Choice (Selective)', managerEstimate)}
      </div>

      {/* Week Hover Detail Bar */}
      {hoveredWeekIndex !== null && (
        <div className="bg-stone-100 rounded-lg p-3 text-xs text-stone-800 flex flex-wrap items-center justify-between gap-3 font-mono">
          {(() => {
            const w = weeks.find(item => item.weekIndex === hoveredWeekIndex);
            if (!w) return null;
            return (
              <>
                <span>Week {w.weekIndex}</span>
                <span>Busyness Confounder B_i: {w.busyness.toFixed(2)}</span>
                <span>Potential Y(0): €{Math.round(w.y0)}</span>
                <span>Potential Y(1): €{Math.round(w.y1)} (Diff: {formatEuro(trueEffect)})</span>
                <span className="text-stone-600">
                  Manager P(Event): {(w.managerProb * 100).toFixed(0)}%
                </span>
              </>
            );
          })()}
        </div>
      )}
    </section>
  );
};
