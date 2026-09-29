/**
 * Markthalle Neun Causal Inference Simulation Engine
 * Rubin's Potential Outcomes Framework Demonstration
 * 
 * Demonstrates:
 * "Randomization works: the difference-in-means estimator is unbiased under random
 * assignment, but biased when assignment depends on potential outcomes."
 */

export interface SimulationParams {
  trueEffect: number;        // True treatment effect (euros), default: -200
  selectionStrength: number; // Confounder sensitivity for manager, default: 1.5
  numWeeks: number;          // Sample size N per pilot, default: 20
  busynessEffect: number;    // Confounder effect on sales beta, default: 600
  noiseSd: number;           // Residual noise standard deviation, default: 300
  numPilots: number;         // Monte Carlo iterations M, default: 2000
  seed: number;              // Reproducible PRNG seed, default: 42
  baseSales: number;         // Base sales on Tuesday (fixed at 2000)
}

export const DEFAULT_PARAMS: SimulationParams = {
  trueEffect: -200,
  selectionStrength: 1.5,
  numWeeks: 20,
  busynessEffect: 600,
  noiseSd: 300,
  numPilots: 2000,
  seed: 42,
  baseSales: 2000,
};

export interface WeekData {
  weekIndex: number;
  busyness: number;       // B_i ~ Normal(0, 1)
  noise: number;          // noise_i ~ Normal(0, noiseSd)
  y0: number;             // Potential outcome without event (EUR)
  y1: number;             // Potential outcome with event (EUR)
  randomAssignment: 0 | 1;// Treatment under random assignment
  managerAssignment: 0 | 1;// Treatment under manager choice
  managerProb: number;    // logistic(selectionStrength * B_i)
  yObsRandom: number;     // Observed outcome under random assignment
  yObsManager: number;    // Observed outcome under manager choice
}

export interface PilotDetail {
  pilotIndex: number;
  weeks: WeekData[];
  randomEstimate: number;
  managerEstimate: number;
  randomTreatedCount: number;
  randomControlCount: number;
  managerTreatedCount: number;
  managerControlCount: number;
}

export interface MethodSummary {
  meanEstimate: number;
  bias: number;
  sdEstimate: number;
  wrongSignRate: number; // Percentage 0 - 100
  minEstimate: number;
  maxEstimate: number;
  p05: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

export interface HistogramBin {
  x0: number;
  x1: number;
  mid: number;
  randomCount: number;
  managerCount: number;
  randomDensity: number;
  managerDensity: number;
}

export interface SimulationResult {
  params: SimulationParams;
  randomEstimates: number[];
  managerEstimates: number[];
  randomSummary: MethodSummary;
  managerSummary: MethodSummary;
  bins: HistogramBin[];
  examplePilots: PilotDetail[]; // First few pilots for inspection
}

/**
 * 32-bit Mulberry PRNG for fast, seedable, high-quality pseudo-random numbers
 */
export function createRng(initialSeed: number) {
  let s = (Math.abs(initialSeed) | 0) || 123456789;
  return function nextFloat(): number {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Standard Normal variate using Box-Muller transform
 */
export function standardNormal(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng(); // Avoid log(0)
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Logistic sigmoid function
 */
export function logistic(x: number): number {
  if (x > 20) return 1.0;
  if (x < -20) return 0.0;
  return 1.0 / (1.0 + Math.exp(-x));
}

/**
 * Shuffle array in-place using Fisher-Yates with custom RNG
 */
export function shuffleArray<T>(array: T[], rng: () => number): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

/**
 * Compute summary statistics from an array of estimates
 */
function computeSummary(estimates: number[], trueEffect: number): MethodSummary {
  const n = estimates.length;
  if (n === 0) {
    return {
      meanEstimate: 0,
      bias: 0,
      sdEstimate: 0,
      wrongSignRate: 0,
      minEstimate: 0,
      maxEstimate: 0,
      p05: 0,
      p25: 0,
      p50: 0,
      p75: 0,
      p95: 0,
    };
  }

  const sum = estimates.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;
  const bias = mean - trueEffect;

  const variance = estimates.reduce((acc, val) => acc + (val - mean) ** 2, 0) / (n > 1 ? n - 1 : 1);
  const sd = Math.sqrt(variance);

  // Wrong sign rate:
  // If trueEffect < 0, wrong sign means estimate > 0
  // If trueEffect > 0, wrong sign means estimate < 0
  // If trueEffect == 0, define as |estimate| > 50 or estimate != 0
  let wrongSignCount = 0;
  if (trueEffect < 0) {
    wrongSignCount = estimates.filter(e => e > 0).length;
  } else if (trueEffect > 0) {
    wrongSignCount = estimates.filter(e => e < 0).length;
  } else {
    wrongSignCount = 0;
  }
  const wrongSignRate = (wrongSignCount / n) * 100;

  const sorted = [...estimates].sort((a, b) => a - b);
  const percentile = (p: number) => {
    const idx = (n - 1) * p;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  return {
    meanEstimate: mean,
    bias,
    sdEstimate: sd,
    wrongSignRate,
    minEstimate: sorted[0],
    maxEstimate: sorted[n - 1],
    p05: percentile(0.05),
    p25: percentile(0.25),
    p50: percentile(0.50),
    p75: percentile(0.75),
    p95: percentile(0.95),
  };
}

/**
 * Execute the simulation over M pilots according to Rubin's framework
 */
export function runSimulation(params: SimulationParams): SimulationResult {
  const {
    trueEffect,
    selectionStrength,
    numWeeks,
    busynessEffect,
    noiseSd,
    numPilots,
    seed,
    baseSales,
  } = params;

  const rng = createRng(seed);

  const randomEstimates: number[] = new Array(numPilots);
  const managerEstimates: number[] = new Array(numPilots);
  const examplePilots: PilotDetail[] = [];

  const targetRandomTreated = Math.floor(numWeeks / 2);

  for (let p = 0; p < numPilots; p++) {
    const weeks: WeekData[] = new Array(numWeeks);

    // Step 1 & 2: Generate busyness, noise, potential outcomes for each week
    for (let i = 0; i < numWeeks; i++) {
      const busyness = standardNormal(rng);
      const noise = standardNormal(rng) * noiseSd;
      const y0 = baseSales + busynessEffect * busyness + noise;
      const y1 = y0 + trueEffect;
      const managerProb = logistic(selectionStrength * busyness);

      weeks[i] = {
        weekIndex: i + 1,
        busyness,
        noise,
        y0,
        y1,
        randomAssignment: 0,
        managerAssignment: 0,
        managerProb,
        yObsRandom: 0,
        yObsManager: 0,
      };
    }

    // Step 4a: RANDOM ASSIGNMENT
    // Randomly choose exactly floor(N / 2) weeks to be event weeks
    const weekIndices = Array.from({ length: numWeeks }, (_, idx) => idx);
    shuffleArray(weekIndices, rng);
    for (let k = 0; k < numWeeks; k++) {
      const idx = weekIndices[k];
      weeks[idx].randomAssignment = k < targetRandomTreated ? 1 : 0;
      weeks[idx].yObsRandom = weeks[idx].randomAssignment === 1 ? weeks[idx].y1 : weeks[idx].y0;
    }

    // Step 4b: MANAGER'S CHOICE
    // Probabilistic selection based on busyness.
    // Must guarantee at least one treated and at least one control week.
    let validManager = false;
    let attempts = 0;
    while (!validManager && attempts < 100) {
      attempts++;
      let treatedCount = 0;
      for (let i = 0; i < numWeeks; i++) {
        const draw = rng();
        const treated = draw < weeks[i].managerProb ? 1 : 0;
        weeks[i].managerAssignment = treated;
        if (treated === 1) treatedCount++;
      }
      if (treatedCount > 0 && treatedCount < numWeeks) {
        validManager = true;
      }
    }

    // Fallback if extreme values: force 1 treated or 1 control if ever needed
    if (!validManager) {
      weeks[0].managerAssignment = 1;
      weeks[1].managerAssignment = 0;
    }

    for (let i = 0; i < numWeeks; i++) {
      weeks[i].yObsManager = weeks[i].managerAssignment === 1 ? weeks[i].y1 : weeks[i].y0;
    }

    // Step 5 & 6: Compute difference in means for both methods
    let sumYRandTreated = 0;
    let countRandTreated = 0;
    let sumYRandControl = 0;
    let countRandControl = 0;

    let sumYMgrTreated = 0;
    let countMgrTreated = 0;
    let sumYMgrControl = 0;
    let countMgrControl = 0;

    for (let i = 0; i < numWeeks; i++) {
      const w = weeks[i];
      if (w.randomAssignment === 1) {
        sumYRandTreated += w.yObsRandom;
        countRandTreated++;
      } else {
        sumYRandControl += w.yObsRandom;
        countRandControl++;
      }

      if (w.managerAssignment === 1) {
        sumYMgrTreated += w.yObsManager;
        countMgrTreated++;
      } else {
        sumYMgrControl += w.yObsManager;
        countMgrControl++;
      }
    }

    const meanRandTreated = countRandTreated > 0 ? sumYRandTreated / countRandTreated : 0;
    const meanRandControl = countRandControl > 0 ? sumYRandControl / countRandControl : 0;
    const diffRandom = meanRandTreated - meanRandControl;

    const meanMgrTreated = countMgrTreated > 0 ? sumYMgrTreated / countMgrTreated : 0;
    const meanMgrControl = countMgrControl > 0 ? sumYMgrControl / countMgrControl : 0;
    const diffManager = meanMgrTreated - meanMgrControl;

    randomEstimates[p] = diffRandom;
    managerEstimates[p] = diffManager;

    // Retain first 5 pilots for interactive individual inspection
    if (p < 5) {
      examplePilots.push({
        pilotIndex: p + 1,
        weeks: weeks.map(w => ({ ...w })),
        randomEstimate: diffRandom,
        managerEstimate: diffManager,
        randomTreatedCount: countRandTreated,
        randomControlCount: countRandControl,
        managerTreatedCount: countMgrTreated,
        managerControlCount: countMgrControl,
      });
    }
  }

  const randomSummary = computeSummary(randomEstimates, trueEffect);
  const managerSummary = computeSummary(managerEstimates, trueEffect);

  // Generate joint histogram bins
  const allValues = [...randomEstimates, ...managerEstimates];
  let overallMin = Math.min(...allValues);
  let overallMax = Math.max(...allValues);

  // Expand bounds slightly for clean padding
  const padding = (overallMax - overallMin) * 0.05 || 50;
  overallMin -= padding;
  overallMax += padding;

  const numBins = 40;
  const binWidth = (overallMax - overallMin) / numBins;
  const bins: HistogramBin[] = [];

  for (let b = 0; b < numBins; b++) {
    const x0 = overallMin + b * binWidth;
    const x1 = x0 + binWidth;
    bins.push({
      x0,
      x1,
      mid: (x0 + x1) / 2,
      randomCount: 0,
      managerCount: 0,
      randomDensity: 0,
      managerDensity: 0,
    });
  }

  for (let i = 0; i < numPilots; i++) {
    const rVal = randomEstimates[i];
    const mVal = managerEstimates[i];

    const rBinIdx = Math.min(numBins - 1, Math.max(0, Math.floor((rVal - overallMin) / binWidth)));
    bins[rBinIdx].randomCount++;

    const mBinIdx = Math.min(numBins - 1, Math.max(0, Math.floor((mVal - overallMin) / binWidth)));
    bins[mBinIdx].managerCount++;
  }

  for (let b = 0; b < numBins; b++) {
    bins[b].randomDensity = bins[b].randomCount / (numPilots * binWidth);
    bins[b].managerDensity = bins[b].managerCount / (numPilots * binWidth);
  }

  return {
    params,
    randomEstimates,
    managerEstimates,
    randomSummary,
    managerSummary,
    bins,
    examplePilots,
  };
}
