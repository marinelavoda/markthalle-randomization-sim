import React from 'react';
import { SimulationResult } from '../simulation';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ResultsSummaryBannerProps {
  result: SimulationResult;
}

export const ResultsSummaryBanner: React.FC<ResultsSummaryBannerProps> = ({ result }) => {
  const { params, randomSummary, managerSummary } = result;
  const { trueEffect } = params;

  const randMean = randomSummary.meanEstimate;
  const randBias = randomSummary.bias;
  const mgrMean = managerSummary.meanEstimate;
  const mgrBias = managerSummary.bias;

  const formatEuro = (val: number) => {
    const rounded = Math.round(val);
    const sign = rounded > 0 ? '+' : '';
    return `${sign}€${rounded.toLocaleString()}`;
  };

  const isSevereBias = Math.abs(mgrBias) > 50;
  const isWrongSignHigh = managerSummary.wrongSignRate > 20;

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
          isSevereBias ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
        }`}>
          {isSevereBias ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
        </div>

        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Executive Finding · Rubin Potential Outcomes Breakdown
            </h3>
            <span className="text-xs font-mono text-stone-500">
              Ground Truth Treatment Effect: <strong className="text-stone-900">{formatEuro(trueEffect)} / Tuesday</strong>
            </span>
          </div>

          {/* Plain language summary */}
          <p className="text-stone-700 text-base leading-relaxed">
            {!isSevereBias ? (
              <>
                When the manager schedules without cherry-picking or when busyness no longer affects sales, both methods produce unbiased estimates:{' '}
                <strong>Random ({formatEuro(randMean)})</strong> and <strong>Manager ({formatEuro(mgrMean)})</strong> both center on the true effect of <strong>{formatEuro(trueEffect)}</strong> (manager bias: <strong className="text-emerald-700 font-mono">{formatEuro(mgrBias)}</strong>).
              </>
            ) : (
              <>
                With manager-chosen weeks, the average estimate across {params.numPilots.toLocaleString()} simulated pilots is{' '}
                <strong className={mgrMean > 0 && trueEffect < 0 ? 'text-amber-800 bg-amber-50 px-1 py-0.5 rounded' : 'text-stone-900'}>
                  {formatEuro(mgrMean)}
                </strong>{' '}
                even though the true causal effect is{' '}
                <strong className="text-stone-900">{formatEuro(trueEffect)}</strong>{' '}
                (an average confounding bias of <strong className="text-rose-700">{formatEuro(mgrBias)}</strong>).
                {isWrongSignHigh && (
                  <>
                    {' '}In <strong className="text-rose-700 font-mono">{managerSummary.wrongSignRate.toFixed(1)}% of pilots</strong>, the manager arrives at the <em>wrong sign</em>—falsely concluding that ticketed events boosted sales when they actually reduced vendor sales.
                  </>
                )}
              </>
            )}
          </p>

          {/* Comparative Insights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs text-emerald-950 space-y-1">
                <span className="font-semibold block text-emerald-900">Random Assignment (Unbiased Guarantee)</span>
                <p className="text-emerald-800 leading-normal">
                  Average estimate is <strong className="font-mono">{formatEuro(randMean)}</strong> (bias: <strong className="font-mono">{formatEuro(randBias)}</strong>).
                  Because weather and tourist busyness are balanced across treatment arms in expectation, the estimator recovers the genuine causal effect.
                </p>
              </div>
            </div>

            <div className={`p-3.5 rounded-lg border flex items-start gap-2.5 ${
              isSevereBias ? 'bg-amber-50/60 border-amber-100' : 'bg-emerald-50/60 border-emerald-100'
            }`}>
              {isSevereBias ? (
                <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              )}
              <div className={`text-xs space-y-1 ${isSevereBias ? 'text-amber-950' : 'text-emerald-950'}`}>
                <span className={`font-semibold block ${isSevereBias ? 'text-amber-900' : 'text-emerald-900'}`}>
                  {isSevereBias ? "Manager's Selection (Confounded)" : "Manager's Selection (Unbiased here)"}
                </span>
                <p className={`leading-normal ${isSevereBias ? 'text-amber-800' : 'text-emerald-800'}`}>
                  {isSevereBias ? (
                    <>
                      Average estimate is <strong className="font-mono">{formatEuro(mgrMean)}</strong>.
                      The manager attributes sunny weather and high seasonal visitor traffic to their event programming, mistaking baseline potential outcomes for causal impact.
                    </>
                  ) : (
                    <>
                      Average estimate is <strong className="font-mono">{formatEuro(mgrMean)}</strong> (bias: <strong className="font-mono">{formatEuro(mgrBias)}</strong>).
                      Because the manager&apos;s choice no longer depends on busyness (or busyness no longer affects sales), event and normal weeks are comparable, so the estimate is unbiased.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
