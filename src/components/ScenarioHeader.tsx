import React from 'react';

export const ScenarioHeader: React.FC = () => {
  return (
    <section className="bg-stone-900 text-stone-100 border-b border-stone-800 pt-8 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Coursework & Context metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 mb-4 font-mono">
          <span>CS130 Knowledge: Information-Based Decisions</span>
          <span aria-hidden="true">·</span>
          <span>Assignment 1: The Analyst, the AI, and the Truth</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-400">Component 2: Computational Demonstration</span>
        </div>

        {/* Claim Callout */}
        <div className="bg-stone-800/80 border-l-4 border-amber-400 rounded-r-lg p-5 mb-6 backdrop-blur-xs">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-300 mb-1.5 font-medium">
            Statistical Claim Under Demonstration (Claim D · Rubin, 1974)
          </div>
          <blockquote className="font-serif text-xl sm:text-2xl text-stone-100 font-normal leading-snug">
            “Randomization works: the difference-in-means estimator is unbiased under random assignment, but biased when assignment depends on potential outcomes.”
          </blockquote>
        </div>

        {/* Scenario description in plain language */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-stone-300 text-sm leading-relaxed">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-base font-semibold text-stone-100 font-serif">
              The Markthalle Neun Tuesday Dilemma
            </h2>
            <p>
              In Kreuzberg, Berlin, the operators of historic Markthalle Neun face the expiration of their 15-year food retail covenant in March 2027. To maximize revenue without alienating local shoppers, they are deciding whether to convert quiet weekday Small Market Tuesdays into ticketed event days.
            </p>
            <p>
              If the operators choose event Tuesdays themselves based on expected crowds (sunny weather, tourist peaks, or public holidays), their estimate of the event&apos;s impact will be confounded. Good weather boosts baseline vendor sales regardless of ticketed programming; scheduling events on busy weeks creates a powerful illusion of success even when events actually suppress regular food shopping.
            </p>
          </div>

          <div className="bg-stone-950/60 p-4 rounded-lg border border-stone-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
                The Methodological Test
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                By comparing a <strong className="text-emerald-400">Randomized A/B Pilot</strong> (coin flip chooses event weeks) against <strong className="text-amber-400">Manager&apos;s Choice</strong> (selective scheduling based on weather/busyness) across thousands of simulated market seasons, this interactive tool demonstrates why randomization is the only procedure that eliminates confounding bias.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-stone-800 text-[11px] text-stone-400">
              Unit: Tuesday Small Market · Baseline Sales: €2,000 · Confounder: Weather & Tourist Busyness
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
