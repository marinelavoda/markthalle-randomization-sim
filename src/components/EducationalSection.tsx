import React, { useState } from 'react';
import { BookOpen, HelpCircle, Lightbulb, Compass, Code, Copy, Check } from 'lucide-react';

export const EducationalSection: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <section id="rubin-framework" className="space-y-8">
      {/* 2-Column: How to Use & What to Try */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: How to Use */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              How to Use the Simulator
            </h3>
          </div>

          <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
            <p>
              Each slider represents a structural parameter in Markthalle Neun&apos;s real-world environment:
            </p>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <strong className="text-stone-900 font-mono shrink-0">True Effect (τ):</strong>
                <span>The underlying causal effect of hosting an event on Tuesday vendor sales (euros). If −€200, ticketed events actually harm regular market grocery spending.</span>
              </li>
              <li className="flex items-start gap-2">
                <strong className="text-stone-900 font-mono shrink-0">Selection (γ):</strong>
                <span>How aggressively the hall manager picks pleasant, high-tourist weeks for events. At 0.0, the manager flips a fair coin. At 1.5+, high busyness weeks get events with &gt;80% probability.</span>
              </li>
              <li className="flex items-start gap-2">
                <strong className="text-stone-900 font-mono shrink-0">Weeks (N):</strong>
                <span>The duration of the pilot season (default 20 weeks). Controls sample size per pilot.</span>
              </li>
              <li className="flex items-start gap-2">
                <strong className="text-stone-900 font-mono shrink-0">Busyness (β):</strong>
                <span>Confounder strength: the euro increase in Tuesday sales caused by a 1-SD rise in pleasant weather or tourist volume.</span>
              </li>
              <li className="flex items-start gap-2">
                <strong className="text-stone-900 font-mono shrink-0">Noise (σε):</strong>
                <span>Weekly random shocks in sales due to unmodeled idiosyncrasies.</span>
              </li>
              <li className="flex items-start gap-2">
                <strong className="text-stone-900 font-mono shrink-0">Pilots (M):</strong>
                <span>How many repeated pilot seasons are simulated to observe the full sampling distribution.</span>
              </li>
              <li className="flex items-start gap-2">
                <strong className="text-stone-900 font-mono shrink-0">Random Seed:</strong>
                <span>Fixed pseudo-random seed ensuring 100% exact numerical reproducibility for assignments and audits.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Column 2: What to Try */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              What to Try (Rubin Demonstration Experiments)
            </h3>
          </div>

          <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
            <p>
              Run these guided experiments to witness the core principles of causal inference:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="font-semibold text-stone-900 mb-1 flex items-center justify-between">
                  <span>1. Set Selection Strength to 0.0</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Unbiased baseline</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  When the manager flips a fair coin, assignment is independent of busyness. Both distributions overlay almost perfectly centered on −€200, with near-zero bias.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="font-semibold text-stone-900 mb-1 flex items-center justify-between">
                  <span>2. Increase Weeks to 52 (Big Data Fallacy)</span>
                  <span className="text-[10px] font-mono text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">Precision ≠ Accuracy</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Watch the histograms narrow as standard error shrinks! But notice: manager choice remains stuck at +€435! More data makes a confounded estimate more precisely wrong.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="font-semibold text-stone-900 mb-1 flex items-center justify-between">
                  <span>3. Vary Busyness Confounder (€0 vs. €1,000)</span>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Confounder Scaling</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Set busyness effect to €0: bias disappears because weather doesn&apos;t impact sales. Set to €1,000: bias explodes to over +€1,000.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rubin Potential Outcomes Mathematical Framework */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <h3 className="font-serif text-xl font-semibold text-stone-900">
            The Mathematical Engine: Rubin&apos;s Potential Outcomes Decomposition
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <p>
              Under Rubin&apos;s Potential Outcomes Framework (1974), each Tuesday <em>i</em> has two hypothetical states:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
              <li><strong className="font-sans">Y0_i:</strong> Vendor sales if Tuesday runs as a regular Small Market.</li>
              <li><strong className="font-sans">Y1_i:</strong> Vendor sales if Tuesday hosts a ticketed event (Y1_i = Y0_i + τ).</li>
            </ul>

            <p>
              Because any Tuesday can only be an event day OR a normal market day (W_i = 1 or W_i = 0), we only observe Y_i = W_i · Y1_i + (1 − W_i) · Y0_i.
              The standard difference-in-means estimator decomposes into:
            </p>

            <div className="p-4 bg-stone-900 text-stone-100 rounded-lg font-mono text-xs overflow-x-auto shadow-inner">
              <div className="text-amber-300 font-bold mb-1">Difference-in-Means Decomposition:</div>
              <div>E[τ̂] = E[Y | W=1] − E[Y | W=0]</div>
              <div className="mt-1">    = E[Y1 | W=1] − E[Y0 | W=0]</div>
              <div className="mt-1">    = τ + [ E[Y0 | W=1] − E[Y0 | W=0] ]</div>
              <div className="text-stone-400 mt-2">         └── True Effect ──┘   └───── Selection Bias (Confounding) ─────┘</div>
            </div>

            <div className="space-y-2">
              <p>
                <strong>1. Why Random Assignment Works:</strong> When treatment W_i is assigned via coin flip, W_i is independent of potential outcomes (Y0, Y1) and busyness B_i.
                Therefore, E[Y0 | W=1] = E[Y0 | W=0]. The selection bias term cancels to exactly zero:
                <span className="font-mono block mt-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded w-fit">
                  E[τ̂_random] = τ
                </span>
              </p>
              <p>
                <strong>2. Why Manager Choice Fails:</strong> The manager schedules events when weather and tourist busyness B_i are high (P(W_i=1) = logistic(γ · B_i)).
                Because busyness directly inflates baseline sales (β &gt; 0), weeks with W_i=1 would have had higher sales anyway: E[Y0 | W=1] &gt; E[Y0 | W=0].
                This positive selection bias guarantees that:
                <span className="font-mono block mt-1 font-semibold text-rose-800 bg-rose-50 px-2 py-1 rounded w-fit">
                  E[τ̂_manager] &gt; τ  (Persistent Overstatement)
                </span>
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-5 border border-stone-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2 font-mono">
                <Compass className="w-4 h-4 text-amber-700" />
                <span>Kleinberg et al. Classification</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-3">
                Kleinberg et al. distinguish between <em>prediction problems</em> (predicting sales given calendar date) and <em>causal inference problems</em> (predicting the counterfactual delta caused by an intervention).
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                A supervised machine learning model trained on historical data would learn that events correlate with high sales. But that correlation is spurious confounding. The decision to hold events requires counterfactual evaluation, which only randomized experimentation provides.
              </p>
            </div>

            <div className="text-[11px] text-stone-500 pt-3 border-t border-stone-200">
              Reading: Rubin (1974) “Estimating Causal Effects of Treatments in Randomized and Nonrandomized Studies”; Kleinberg et al. (2015) “Prediction Policy Problems”.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
