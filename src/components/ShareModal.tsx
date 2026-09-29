import React, { useState } from 'react';
import { X, Copy, Check, Share2, Github, ExternalLink, Globe } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-3z4gjt5mok4cqwlmakudyq-144472310542.europe-west2.run.app';

  const copyAppUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedApp(true);
    setTimeout(() => setCopiedApp(false), 2000);
  };

  const citationText = `Computational Demonstration Artifact:
Voda, M. (2026). Markthalle Neun Causal Inference Simulator: Demonstrating Rubin's Potential Outcomes Framework & Randomization. CS130 Knowledge: Information-Based Decisions, Assignment 1. URL: ${currentUrl}`;

  const copyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Share Simulation with Professor
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-stone-700">
          <div>
            <label className="font-medium text-stone-900 block mb-1">
              Live Public Applet Link (Runs in any browser without login):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full font-mono text-[11px] bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
              />
              <button
                onClick={copyAppUrl}
                className="flex items-center gap-1 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium whitespace-nowrap"
              >
                {copiedApp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedApp ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Your professor can open this URL directly in Chrome, Safari, or Firefox to test parameters.
            </p>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="font-semibold text-stone-900 block">
              Source Code & Export
            </span>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              The entire simulation engine is self-contained in client-side TypeScript (<code className="font-mono bg-stone-200 px-1 py-0.5 rounded">src/simulation.ts</code>). You can export your code to GitHub directly via the export button in the AI Studio environment header, or download the workspace.
            </p>
          </div>

          <div>
            <label className="font-medium text-stone-900 block mb-1">
              Academic Citation for Component 2 Portfolio:
            </label>
            <div className="relative">
              <pre className="p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-[11px] font-mono text-stone-700 whitespace-pre-wrap">
                {citationText}
              </pre>
              <button
                onClick={copyCitation}
                className="absolute top-2 right-2 p-1.5 bg-white border border-stone-200 rounded text-stone-600 hover:text-stone-900 shadow-xs"
                title="Copy citation"
              >
                {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
