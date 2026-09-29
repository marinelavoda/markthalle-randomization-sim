import React from 'react';
import { SimulationParams } from '../simulation';
import { Play, Shuffle, HelpCircle, Sparkles, Check } from 'lucide-react';

interface ControlsDeckProps {
  params: SimulationParams;
  onChange: (newParams: SimulationParams) => void;
  onRun: () => void;
  isRunning: boolean;
  hasUnsavedChanges: boolean;
  onApplyPreset: (presetName: string, presetParams: Partial<SimulationParams>) => void;
  activePreset: string | null;
}

export const ControlsDeck: React.FC<ControlsDeckProps> = ({
  params,
  onChange,
  onRun,
  isRunning,
  hasUnsavedChanges,
  onApplyPreset,
  activePreset,
}) => {
  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    onChange({
      ...params,
      [key]: value,
    });
  };

  const rollNewSeed = () => {
    const newSeed = Math.floor(Math.random() * 100000) + 1;
    updateParam('seed', newSeed);
  };

  const SCENARIO_CAPTIONS: Record<string, string> = {
    default: "Event days land in weeks that were busy anyway, so the estimate is biased, and a harmful event can look helpful.",
    unbiased: "When events are assigned by coin flip, the average estimate matches the true effect.",
    'zero-confounder': "If busy weeks don't have higher sales, selective picking causes no bias: bias appears only when assignment is linked to the outcomes.",
    'big-data': "More weeks make estimates more precise, but the manager's method is still wrong on average.",
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
      {/* Top Banner: Presets */}
      <div className="bg-stone-50/80 px-5 py-3.5 border-b border-stone-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider whitespace-nowrap">
              Walk through the claim in 4 steps
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onApplyPreset('default', {
                trueEffect: -200,
                selectionStrength: 1.5,
                numWeeks: 20,
                busynessEffect: 600,
                noiseSd: 300,
                numPilots: 2000,
                baseSales: 2000,
              })}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activePreset === 'default'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              1. The problem: manager picks busy weeks
            </button>

            <button
              onClick={() => onApplyPreset('unbiased', {
                trueEffect: -200,
                selectionStrength: 0,
                numWeeks: 20,
                busynessEffect: 600,
                noiseSd: 300,
                numPilots: 2000,
                baseSales: 2000,
              })}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activePreset === 'unbiased'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              2. The fix: pick weeks at random
            </button>

            <button
              onClick={() => onApplyPreset('zero-confounder', {
                trueEffect: -200,
                selectionStrength: 1.5,
                numWeeks: 20,
                busynessEffect: 0,
                noiseSd: 300,
                numPilots: 2000,
                baseSales: 2000,
              })}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activePreset === 'zero-confounder'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              3. Why: remove the link to sales
            </button>

            <button
              onClick={() => onApplyPreset('big-data', {
                trueEffect: -200,
                selectionStrength: 1.5,
                numWeeks: 52,
                busynessEffect: 600,
                noiseSd: 300,
                numPilots: 2000,
                baseSales: 2000,
              })}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activePreset === 'big-data'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              4. More data doesn&apos;t help
            </button>
          </div>
        </div>

        {activePreset && SCENARIO_CAPTIONS[activePreset] && (
          <div className="mt-3 pt-2.5 border-t border-stone-200 text-xs text-stone-700 flex items-start gap-2 bg-amber-50/50 p-2 rounded-md border-amber-200/50">
            <span className="font-semibold text-amber-800 shrink-0 font-sans">Summary:</span>
            <span className="text-stone-700 leading-relaxed font-sans">{SCENARIO_CAPTIONS[activePreset]}</span>
          </div>
        )}
      </div>

      {/* Main Sliders Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Slider 1: True Effect */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label htmlFor="slider-true-effect" className="text-xs font-semibold text-stone-800 flex items-center gap-1">
              <span>True Effect of Event (τ)</span>
              <span className="group relative cursor-help text-stone-400 hover:text-stone-600" title="The actual constant causal effect on weekly vendor sales in euros.">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              params.trueEffect < 0 ? 'bg-rose-50 text-rose-700' : params.trueEffect > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-700'
            }`}>
              {params.trueEffect > 0 ? `+€${params.trueEffect}` : `€${params.trueEffect}`} / wk
            </span>
          </div>
          <input
            id="slider-true-effect"
            type="range"
            min={-500}
            max={500}
            step={25}
            value={params.trueEffect}
            onChange={(e) => updateParam('trueEffect', Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-400 font-mono">
            <span>-€500 (Loss)</span>
            <span>€0</span>
            <span>+€500 (Gain)</span>
          </div>
          <p className="text-[11px] text-stone-500">
            True impact on vendor sales. Default −€200 represents events crowding out regular shoppers.
          </p>
        </div>

        {/* Slider 2: Selection Strength */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label htmlFor="slider-selection-strength" className="text-xs font-semibold text-stone-800 flex items-center gap-1">
              <span>Manager Selection Strength (γ)</span>
              <span className="group relative cursor-help text-stone-400 hover:text-stone-600" title="How strongly the manager cherry-picks busy weeks for events: P(Event) = logistic(γ * B_i).">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              params.selectionStrength === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
            }`}>
              {params.selectionStrength.toFixed(1)} {params.selectionStrength === 0 ? '(Coin Flip)' : ''}
            </span>
          </div>
          <input
            id="slider-selection-strength"
            type="range"
            min={0}
            max={3}
            step={0.1}
            value={params.selectionStrength}
            onChange={(e) => updateParam('selectionStrength', Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-400 font-mono">
            <span>0.0 (Unbiased)</span>
            <span>1.5 (Default)</span>
            <span>3.0 (Aggressive)</span>
          </div>
          <p className="text-[11px] text-stone-500">
            At 0.0, manager flips a coin. Higher values favor warm weather / tourist influx weeks.
          </p>
        </div>

        {/* Slider 3: Number of Weeks */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label htmlFor="slider-num-weeks" className="text-xs font-semibold text-stone-800 flex items-center gap-1">
              <span>Pilot Duration (Weeks N)</span>
              <span className="group relative cursor-help text-stone-400 hover:text-stone-600" title="Number of Tuesday Small Markets evaluated in each pilot season.">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
              {params.numWeeks} weeks
            </span>
          </div>
          <input
            id="slider-num-weeks"
            type="range"
            min={6}
            max={52}
            step={1}
            value={params.numWeeks}
            onChange={(e) => updateParam('numWeeks', Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-400 font-mono">
            <span>6 wks</span>
            <span>20 wks (Default)</span>
            <span>52 wks (Full Year)</span>
          </div>
          <p className="text-[11px] text-stone-500">
            More weeks reduce estimation variance, but cannot eliminate selection bias!
          </p>
        </div>

        {/* Slider 4: Busyness Confounder Effect */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label htmlFor="slider-busyness-effect" className="text-xs font-semibold text-stone-800 flex items-center gap-1">
              <span>Confounder Impact (β Busyness)</span>
              <span className="group relative cursor-help text-stone-400 hover:text-stone-600" title="How much 1 standard deviation of weather/tourists increases Tuesday sales (euros).">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
              €{params.busynessEffect} / SD
            </span>
          </div>
          <input
            id="slider-busyness-effect"
            type="range"
            min={0}
            max={1000}
            step={50}
            value={params.busynessEffect}
            onChange={(e) => updateParam('busynessEffect', Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-400 font-mono">
            <span>€0 (No Confounder)</span>
            <span>€600 (Default)</span>
            <span>€1,000</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Sales lift driven solely by sunny weather and tourist traffic on baseline Tuesdays.
          </p>
        </div>

        {/* Slider 5: Weekly Noise SD */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label htmlFor="slider-noise-sd" className="text-xs font-semibold text-stone-800 flex items-center gap-1">
              <span>Weekly Sales Noise (SD ε)</span>
              <span className="group relative cursor-help text-stone-400 hover:text-stone-600" title="Idiosyncratic random variation in weekly vendor sales from unmeasured factors.">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
              €{params.noiseSd} SD
            </span>
          </div>
          <input
            id="slider-noise-sd"
            type="range"
            min={50}
            max={1000}
            step={25}
            value={params.noiseSd}
            onChange={(e) => updateParam('noiseSd', Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-400 font-mono">
            <span>€50</span>
            <span>€300 (Default)</span>
            <span>€1,000</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Standard deviation of residual noise. Higher noise broadens histogram spread.
          </p>
        </div>

        {/* Slider 6: Number of Simulated Pilots */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label htmlFor="slider-num-pilots" className="text-xs font-semibold text-stone-800 flex items-center gap-1">
              <span>Simulation Pilots (M Runs)</span>
              <span className="group relative cursor-help text-stone-400 hover:text-stone-600" title="Number of repeated pilots simulated to reveal the long-run sampling distribution.">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
              {params.numPilots.toLocaleString()} pilots
            </span>
          </div>
          <input
            id="slider-num-pilots"
            type="range"
            min={500}
            max={5000}
            step={250}
            value={params.numPilots}
            onChange={(e) => updateParam('numPilots', Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-400 font-mono">
            <span>500</span>
            <span>2,000 (Default)</span>
            <span>5,000</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Repeated hypothetical seasons to test procedure guarantees under Rubin&apos;s framework.
          </p>
        </div>
      </div>

      {/* Bottom Bar: Seed Control + Action Button */}
      <div className="bg-stone-50 px-5 py-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Seed Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="seed-input" className="text-xs font-medium text-stone-600 whitespace-nowrap">
            Random Seed:
          </label>
          <div className="flex items-center gap-1">
            <input
              id="seed-input"
              type="number"
              value={params.seed}
              onChange={(e) => updateParam('seed', parseInt(e.target.value) || 1)}
              className="w-24 px-2.5 py-1 text-xs font-mono bg-white border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-stone-800"
              title="Change seed to generate different random samples or match exact runs"
            />
            <button
              onClick={rollNewSeed}
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-md transition-colors"
              title="Roll random new seed"
              aria-label="Roll new seed"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[11px] text-stone-400 hidden lg:inline">
            (Guarantees 100% reproducible results for assignments)
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-700 font-medium animate-pulse flex items-center gap-1">
              <span>●</span> Parameters modified
            </span>
          )}

          <button
            onClick={onRun}
            disabled={isRunning}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              hasUnsavedChanges
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Simulating {params.numPilots.toLocaleString()} pilots...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Re-run Simulation</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Simulation Up to Date</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
