/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import {
  DEFAULT_PARAMS,
  SimulationParams,
  SimulationResult,
  runSimulation,
} from './simulation';
import { TopNav } from './components/TopNav';
import { ScenarioHeader } from './components/ScenarioHeader';
import { ControlsDeck } from './components/ControlsDeck';
import { ResultsSummaryBanner } from './components/ResultsSummaryBanner';
import { HistogramChart } from './components/HistogramChart';
import { ResultsTable } from './components/ResultsTable';
import { SinglePilotScatter } from './components/SinglePilotScatter';
import { EducationalSection } from './components/EducationalSection';
import { CourseworkGuideModal } from './components/CourseworkGuideModal';
import { ShareModal } from './components/ShareModal';

export default function App() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [lastRunParams, setLastRunParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [result, setResult] = useState<SimulationResult>(() => runSimulation(DEFAULT_PARAMS));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string | null>('default');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  const [, startTransition] = useTransition();

  // Check if current params differ from last simulation run
  const hasUnsavedChanges = JSON.stringify(params) !== JSON.stringify(lastRunParams);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    // Non-blocking timeout so the UI spinner immediately renders
    setTimeout(() => {
      startTransition(() => {
        const newResult = runSimulation(params);
        setResult(newResult);
        setLastRunParams({ ...params });
        setIsRunning(false);
      });
    }, 40);
  }, [params]);

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setActivePreset('default');
    setIsRunning(true);
    setTimeout(() => {
      startTransition(() => {
        const newResult = runSimulation(DEFAULT_PARAMS);
        setResult(newResult);
        setLastRunParams(DEFAULT_PARAMS);
        setIsRunning(false);
      });
    }, 40);
  }, []);

  const handleApplyPreset = (presetName: string, presetParams: Partial<SimulationParams>) => {
    const newP: SimulationParams = {
      ...params,
      ...presetParams,
    };
    setParams(newP);
    setActivePreset(presetName);

    // Auto-run when user selects a preset so they immediately see the result
    setIsRunning(true);
    setTimeout(() => {
      startTransition(() => {
        const newResult = runSimulation(newP);
        setResult(newResult);
        setLastRunParams(newP);
        setIsRunning(false);
      });
    }, 40);
  };

  // Keyboard shortcut: Press Ctrl/Cmd + Enter to run simulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun]);

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Top Bar Navigation */}
      <TopNav
        onReset={handleReset}
        onOpenGuide={() => setIsGuideOpen(true)}
        onShare={() => setIsShareOpen(true)}
      />

      {/* Hero Scenario & Rubin Claim */}
      <ScenarioHeader />

      {/* Main Workspace */}
      <main id="simulator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        {/* Interactive Parameter Controls Deck */}
        <section aria-label="Simulation Controls">
          <ControlsDeck
            params={params}
            onChange={(newParams) => {
              setParams(newParams);
              setActivePreset(null);
            }}
            onRun={handleRun}
            isRunning={isRunning}
            hasUnsavedChanges={hasUnsavedChanges}
            onApplyPreset={handleApplyPreset}
            activePreset={activePreset}
          />
        </section>

        {/* Live Dynamic Plain-Language Summary Banner */}
        <ResultsSummaryBanner result={result} />

        {/* Primary Visual Output: Dual Histograms */}
        <section aria-label="Histogram Distributions">
          <HistogramChart result={result} />
        </section>

        {/* Statistical Performance Table */}
        <section aria-label="Results Table">
          <ResultsTable result={result} />
        </section>

        {/* Deep Dive: Single Pilot Microcosm Scatter Plot */}
        <SinglePilotScatter
          pilots={result.examplePilots}
          params={result.params}
        />

        {/* Educational Framework, How-To, and What-To-Try */}
        <EducationalSection />
      </main>

      {/* Clean Academic Footer */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 py-10 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
            <div className="space-y-1">
              <span className="font-serif text-sm font-semibold text-stone-200">
                Markthalle Neun Causal Decision Simulator
              </span>
              <p className="text-stone-400">
                Course: CS130 Knowledge: Information-Based Decisions · Assignment 1: “The Analyst, the AI, and the Truth”
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="text-amber-400 hover:text-amber-300 underline font-medium"
              >
                CS130 Assignment Guide
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setIsShareOpen(true)}
                className="text-stone-300 hover:text-stone-100 underline"
              >
                Share Artifact Link
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-stone-500">
            <div>
              Anchored in Rubin (1974) potential outcomes and Kleinberg et al. (2015) decision frameworks. Fully client-side reproducible PRNG.
            </div>
            <div>
              Markthalle Neun · Eisenbahnstraße 42/43, 10997 Berlin-Kreuzberg
            </div>
          </div>
        </div>
      </footer>

      {/* Assignment & Audit Guide Modal */}
      <CourseworkGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Share & Submission Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
