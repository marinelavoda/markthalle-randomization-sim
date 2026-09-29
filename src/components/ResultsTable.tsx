import React from 'react';
import { SimulationResult } from '../simulation';
import { HelpCircle, AlertCircle, Check } from 'lucide-react';

interface ResultsTableProps {
  result: SimulationResult;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
  const { params, randomSummary, managerSummary } = result;
  const { trueEffect } = params;

  const formatEuro = (v: number) => {
    const rounded = Math.round(v);
    const sign = rounded > 0 ? '+' : '';
    return `${sign}€${rounded.toLocaleString()}`;
  };

  const biasDelta = managerSummary.bias - randomSummary.bias;

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-lg font-semibold text-stone-900">
            Performance Metrics: Random Assignment vs. Manager Selection
          </h3>
          <p className="text-xs text-stone-500">
            Calculated across {params.numPilots.toLocaleString()} repeated pilot simulations · True Treatment Effect = {formatEuro(trueEffect)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-100/70 text-xs font-semibold text-stone-700 uppercase tracking-wider">
              <th className="py-3.5 px-6">Evaluation Metric</th>
              <th className="py-3.5 px-6 text-emerald-900 bg-emerald-50/50">
                Random Assignment (A/B Test)
              </th>
              <th className="py-3.5 px-6 text-amber-900 bg-amber-50/50">
                Manager&apos;s Selective Choice
              </th>
              <th className="py-3.5 px-6 text-stone-700">
                Confounding Distortion (Delta)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 text-stone-800">
            {/* Row 1: Average Estimate */}
            <tr className="hover:bg-stone-50/80 transition-colors">
              <td className="py-4 px-6 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Average Estimate (E[τ̂])</span>
                  <span className="text-stone-400 group relative cursor-help" title="The mean difference-in-means estimate across all simulated pilots.">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 font-normal">
                  Should match true effect of {formatEuro(trueEffect)}
                </div>
              </td>
              <td className="py-4 px-6 font-mono font-bold text-emerald-800 bg-emerald-50/20 tabular-nums">
                {formatEuro(randomSummary.meanEstimate)}
              </td>
              <td className="py-4 px-6 font-mono font-bold text-amber-800 bg-amber-50/20 tabular-nums">
                {formatEuro(managerSummary.meanEstimate)}
              </td>
              <td className="py-4 px-6 font-mono tabular-nums text-stone-600">
                {formatEuro(managerSummary.meanEstimate - randomSummary.meanEstimate)}
              </td>
            </tr>

            {/* Row 2: Bias */}
            <tr className="hover:bg-stone-50/80 transition-colors">
              <td className="py-4 px-6 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Confounding Bias (E[τ̂] − τ)</span>
                  <span className="text-stone-400 group relative cursor-help" title="Difference between average estimate and true effect. Unbiased estimators yield ~€0.">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 font-normal">
                  Systematic estimation error
                </div>
              </td>
              <td className="py-4 px-6 font-mono font-semibold text-emerald-700 bg-emerald-50/20 tabular-nums">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{formatEuro(randomSummary.bias)}</span>
                </div>
              </td>
              <td className="py-4 px-6 font-mono font-semibold text-rose-700 bg-amber-50/20 tabular-nums">
                <div className="flex items-center gap-1.5">
                  {Math.abs(managerSummary.bias) > 30 ? (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>{formatEuro(managerSummary.bias)}</span>
                </div>
              </td>
              <td className="py-4 px-6 font-mono tabular-nums text-rose-700 font-semibold">
                {formatEuro(biasDelta)}
              </td>
            </tr>

            {/* Row 3: Standard Deviation of Estimates */}
            <tr className="hover:bg-stone-50/80 transition-colors">
              <td className="py-4 px-6 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Standard Deviation of Estimates (SE)</span>
                  <span className="text-stone-400 group relative cursor-help" title="Spread of estimates across pilots due to sampling noise. Drops as N increases.">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 font-normal">
                  Sampling uncertainty for an N-week pilot
                </div>
              </td>
              <td className="py-4 px-6 font-mono text-stone-700 bg-emerald-50/20 tabular-nums">
                ±€{Math.round(randomSummary.sdEstimate).toLocaleString()}
              </td>
              <td className="py-4 px-6 font-mono text-stone-700 bg-amber-50/20 tabular-nums">
                ±€{Math.round(managerSummary.sdEstimate).toLocaleString()}
              </td>
              <td className="py-4 px-6 font-mono tabular-nums text-stone-500">
                {Math.round(managerSummary.sdEstimate - randomSummary.sdEstimate) > 0 ? '+' : ''}
                €{Math.round(managerSummary.sdEstimate - randomSummary.sdEstimate)}
              </td>
            </tr>

            {/* Row 4: Wrong Sign Rate */}
            <tr className="hover:bg-stone-50/80 transition-colors">
              <td className="py-4 px-6 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Wrong-Sign Rate (%)</span>
                  <span className="text-stone-400 group relative cursor-help" title="Percentage of simulated pilots that conclude the opposite directional sign from reality.">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 font-normal">
                  Probability of recommending the opposite action
                </div>
              </td>
              <td className="py-4 px-6 font-mono bg-emerald-50/20 tabular-nums">
                <span className="font-semibold text-emerald-800">
                  {randomSummary.wrongSignRate.toFixed(1)}%
                </span>
                <span className="text-[11px] text-stone-400 block font-normal font-sans">
                  (Pure sampling variance)
                </span>
              </td>
              <td className="py-4 px-6 font-mono bg-amber-50/20 tabular-nums">
                <span className={`font-semibold ${managerSummary.wrongSignRate > 25 ? 'text-rose-700' : 'text-amber-800'}`}>
                  {managerSummary.wrongSignRate.toFixed(1)}%
                </span>
                <span className="text-[11px] text-rose-600 block font-normal font-sans">
                  {managerSummary.wrongSignRate > 50 ? 'Fatal false-positive rate' : 'Confounded error rate'}
                </span>
              </td>
              <td className="py-4 px-6 font-mono tabular-nums text-rose-700 font-medium">
                {managerSummary.wrongSignRate > randomSummary.wrongSignRate ? '+' : ''}
                {(managerSummary.wrongSignRate - randomSummary.wrongSignRate).toFixed(1)}%
              </td>
            </tr>

            {/* Row 5: 95% Empirical Range */}
            <tr className="hover:bg-stone-50/80 transition-colors">
              <td className="py-4 px-6 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>95% Empirical Simulation Interval</span>
                  <span className="text-stone-400 group relative cursor-help" title="Central 95% range [p02.5 to p97.5] of observed pilot estimates.">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 font-normal">
                  Where 95% of single pilot runs will land
                </div>
              </td>
              <td className="py-4 px-6 font-mono text-xs text-stone-700 bg-emerald-50/20 tabular-nums">
                [{formatEuro(randomSummary.p05)}, {formatEuro(randomSummary.p95)}]
              </td>
              <td className="py-4 px-6 font-mono text-xs text-stone-700 bg-amber-50/20 tabular-nums">
                [{formatEuro(managerSummary.p05)}, {formatEuro(managerSummary.p95)}]
              </td>
              <td className="py-4 px-6 font-mono text-xs text-stone-500 tabular-nums">
                Shifted right by {formatEuro(biasDelta)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between">
        <span>
          <strong>Key Takeaway:</strong> Randomization guarantees <code className="bg-stone-200/80 px-1 py-0.5 rounded font-mono">E[τ̂] = τ</code> regardless of confounder strength. Manager selection introduces a structural wedge that cannot be fixed by gathering more data.
        </span>
      </div>
    </div>
  );
};
