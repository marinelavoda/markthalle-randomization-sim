import React from 'react';
import { RotateCcw, Share2, BookOpen } from 'lucide-react';

interface TopNavProps {
  onReset: () => void;
  onOpenGuide: () => void;
  onShare: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onReset, onOpenGuide, onShare }) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3">
          <a href="#" className="font-serif text-lg tracking-tight font-semibold text-stone-100 hover:text-amber-200 transition-colors">
            Markthalle Neun <span className="font-sans font-light text-stone-400">· Causal Lab</span>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider text-stone-300 font-medium">
          <a href="#simulator" className="hover:text-amber-300 transition-colors">
            Simulation
          </a>
          <a href="#single-pilot" className="hover:text-amber-300 transition-colors">
            Single Pilot
          </a>
          <a href="#rubin-framework" className="hover:text-amber-300 transition-colors">
            Rubin Framework
          </a>
          <a href="#assignment-context" className="hover:text-amber-300 transition-colors">
            Course Memo
          </a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-md border border-stone-700 transition-colors whitespace-nowrap"
            title="Open CS130 Assignment Guide & Gemini Audit Bank"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">CS130 Assignment Guide</span>
            <span className="sm:hidden">Guide</span>
          </button>

          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap font-sans shadow-xs"
            title="Share App Link & Code"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={onReset}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-md transition-colors"
            title="Reset parameters to defaults"
            aria-label="Reset parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
