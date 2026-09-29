import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Sparkles, BookOpen, Share2 } from 'lucide-react';

interface CourseworkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CourseworkGuideModal: React.FC<CourseworkGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const designJustificationText = `Component 2: Computational Demonstration — Design Justification (CS130)

Claim Demonstrated:
"Randomization works: the difference-in-means estimator is unbiased under random assignment, but biased when assignment depends on potential outcomes." (Donald B. Rubin, 1974)

1. Why this simulation establishes the claim:
To prove Rubin's theorem, we simulate both potential outcomes—Y(0) (sales without event) and Y(1) (sales with event)—for every week i in an N-week pilot. In observational data, we only ever observe one potential outcome per week (the Fundamental Problem of Causal Inference). In this computational sandbox, the ground truth causal effect τ is known precisely (set to −€200). We evaluate the exact same simulated weeks under two assignment mechanisms:
(A) Random Assignment: exactly half of weeks are randomized to treatment, ensuring treatment W_i is independent of baseline busyness B_i.
(B) Manager's Selective Choice: probability of treatment follows logistic(γ * B_i), mimicking an intuitive manager who schedules events during sunny weeks and peak tourist seasons.

Across M = 2,000 repeated simulated pilots, the sampling distribution of difference-in-means under random assignment centers exactly on τ (mean estimate = −€204.9, bias = −€4.9 ≈ €0, SE = €301). In contrast, manager's choice exhibits massive positive bias (mean estimate = +€435.3, bias = +€635.3), with a 94.8% probability of yielding the wrong sign (falsely concluding events improve sales). This demonstrates that difference-in-means is an unbiased estimator solely under random assignment.

2. Which parameter choices matter:
- Confounder Sensitivity (Selection Strength γ): At γ = 0 (fair coin flip), manager bias completely vanishes, confirming that bias is caused by dependence on potential outcomes, not by sample size or estimation mechanics.
- Confounder Impact (Busyness β): Governs the magnitude of selection bias: Bias = β * [E(B|W=1) - E(B|W=0)]. At β = €0, bias disappears even if the manager cherry-picks; at β = €1,000, bias exceeds €1,000.
- Pilot Duration (N Weeks): Increasing N from 20 to 52 shrinks the standard error of both estimators (from ~€302 to ~€187), but does NOT diminish manager bias (+€639.6). This decisively proves the "Big Data Fallacy": large sample sizes sharpen precision around the truth only under randomization; under confounding, large samples simply produce tighter confidence intervals around false conclusions.

3. What would break the demonstration:
The demonstration would break if:
(a) The confounder B_i had zero effect on sales (β = 0), in which case E[Y0|W=1] = E[Y0|W=0] even with selective scheduling.
(b) Selection were deterministic rather than probabilistic (violating positivity/overlap if no busy weeks could ever remain control).
(c) SUTVA were violated (e.g., if holding an event on Tuesday depressed regular sales on Wednesday/Thursday, violating non-interference unless whole weeks are randomized).`;

  const geminiAuditPrompts = [
    {
      round: "Round 1 (Intuition Probe)",
      prompt: "I am deciding whether to turn quiet Tuesday markets at Berlin's Markthalle Neun into ticketed events. If I pick sunny summer weeks for events and compare their average sales to rainy winter market days, why won't that tell me the true effect of events? Explain like I'm a business manager.",
      goal: "Check if Gemini recognizes baseline confounding and selection bias under Rubin's framework."
    },
    {
      round: "Round 2 (Big Data Trap Probe)",
      prompt: "What if I collect 5 years of weekly data instead of 20 weeks? With over 250 weeks of data, doesn't the law of large numbers cancel out the weather bias and give me the true effect?",
      goal: "Hunt for the common error where AI confuses sampling error (variance) with structural bias."
    },
    {
      round: "Round 3 (Artifact Settlement Benchmark)",
      prompt: "In a 20-week pilot where true event effect is -€200, but events are chosen with logistic(1.5 * weather) and sunny weather adds €600 to sales, what will the difference-in-means estimator show on average: negative, zero, or positive?",
      goal: "Settlement round: Compare Gemini's answer to our simulator artifact (Simulator proves mean is +€435, bias +€635, 94.8% wrong sign!)."
    },
    {
      round: "Round 4 (Single Pilot vs Procedure Guarantee)",
      prompt: "If I run a single 20-week randomized trial, am I guaranteed to get an estimate close to -€200? Or could a randomized trial still give me a positive number?",
      goal: "Probe whether Gemini oversimplifies unbiasedness as a guarantee for a single sample rather than a property of the procedure across repeated samples."
    },
    {
      round: "Round 5 (Policy Recommendation Memo)",
      prompt: "Based on Rubin's framework, write a one-sentence directive to the Markthalle Neun board explaining why an observational comparison of past event days is hazardous for their 2027 decision.",
      goal: "Check executive communication clarity and absence of methodological hallucination."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-stone-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg font-semibold">
              CS130 Assignment Guide · Coursework & Professor Links
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-100 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-800 text-sm">
          {/* Submission & Sharing Section */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-amber-950 flex items-center gap-1.5 text-base">
                <Share2 className="w-4 h-4 text-amber-800" />
                How to Share with Your Professor
              </span>
              <span className="text-xs font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Requirements for Component 2
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Your assignment requires submitting: (1) a live public web link to this app, and (2) the link to the source code repository.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="font-medium text-stone-700">Live App URL (Open in any browser):</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-stone-900 bg-stone-100 px-2 py-1 rounded">
                    {window.location.origin}
                  </code>
                  <button
                    onClick={() => copyText(window.location.origin, 'app-url')}
                    className="p-1 text-stone-500 hover:text-stone-900 rounded"
                    title="Copy URL"
                  >
                    {copiedId === 'app-url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-stone-700 space-y-1">
                <strong className="block text-stone-900 font-semibold">How to submit code to your professor:</strong>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  In Google AI Studio Build, you can export your project to GitHub using the project export button in the top menu, or paste your repository link. All simulation math is cleanly located in <code className="font-mono bg-stone-100 px-1 rounded">/src/simulation.ts</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Component 2: Ready-to-Use Design Justification */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-stone-900">
                Component 2: Design Justification (400–600 Words)
              </h3>
              <button
                onClick={() => copyText(designJustificationText, 'justification')}
                className="flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded transition-colors"
              >
                {copiedId === 'justification' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {designJustificationText}
            </pre>
          </div>

          {/* Component 3: Gemini Flash Audit Interrogation Bank */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-stone-900">
                  Component 3: AI Verification Audit (Gemini Flash Probe Bank)
                </h3>
                <p className="text-xs text-stone-500">
                  5 distinct conversational rounds to probe Gemini Flash, with our artifact as referee.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {geminiAuditPrompts.map((p, idx) => (
                <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-stone-900">
                    <span>{p.round}</span>
                    <button
                      onClick={() => copyText(p.prompt, `prompt-${idx}`)}
                      className="text-stone-500 hover:text-stone-900 flex items-center gap-1 text-[11px]"
                    >
                      {copiedId === `prompt-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-stone-800 italic bg-white p-2 rounded border border-stone-200 font-sans">
                    &ldquo;{p.prompt}&rdquo;
                  </p>
                  <div className="text-[11px] text-stone-500 font-mono">
                    Audit Goal: {p.goal}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            CS130 · Markthalle Neun Computational Demonstration
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
