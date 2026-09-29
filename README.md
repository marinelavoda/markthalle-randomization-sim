# Markthalle Neun Causal Inference Simulator

An interactive simulation showing why randomization matters for causal estimates, illustrated with a hypothetical event pilot at Markthalle Neun, a historic market hall in Berlin-Kreuzberg.

**Live app:** https://markthalle-neun-causal-inference-simulator.ai.studio/

> All data in this app is simulated and illustrative. It is not real Markthalle Neun data.

## The claim

> Randomization works: the difference-in-means estimator is unbiased under random assignment, but biased when assignment depends on potential outcomes. (Rubin)

## The scenario

Markthalle Neun's owners are considering turning some quiet weekday market Tuesdays into ticketed event days. To learn whether events hurt everyday vendor sales, they could compare event days to normal days. But if managers schedule events in weeks they expect to be busy (good weather, tourist season), that comparison is misleading. This app shows why a randomized pilot gives the right answer and manager-chosen scheduling does not.

## How the simulation works

For each simulated week:

1. A hidden **busyness** score `B ~ Normal(0, 1)` represents weather, season and tourism.
2. Sales **without** an event: `Y0 = base_sales + busyness_effect × B + noise`
3. Sales **with** an event: `Y1 = Y0 + true_effect`
4. The same weeks are assigned to events in two ways:
   - **Random assignment:** exactly half the weeks, chosen at random.
   - **Manager's choice:** `P(event) = logistic(selection_strength × B)`, so busier weeks are more likely to be chosen.
5. Each method's estimate is the **difference in means**: average sales on event Tuesdays minus average sales on normal Tuesdays.

This is repeated over many simulated pilots (default 2,000) to show the full distribution of estimates for each method.

## Parameters

| Parameter | Range | Default |
|---|---|---|
| True effect of an event | −€500 to +€500 | −€200 |
| Manager selection strength | 0 to 3 | 1.5 |
| Pilot duration (weeks) | 6 to 52 | 20 |
| Busyness effect on sales (confounder) | €0 to €1,000 | €600 |
| Weekly sales noise (SD) | €50 to €1,000 | €300 |
| Simulated pilots | 500 to 5,000 | 2,000 |
| Random seed | any integer | 42 |

## Walk through the claim in 4 steps

The app includes four presets (seed 42):

| Step | What it tests | Random average | Manager average (bias) |
|---|---|---|---|
| 1. The problem | Manager picks busy weeks | −€215 | +€439 (+€639), wrong sign in 94.9% of pilots |
| 2. The fix | Selection strength = 0 (coin flip) | −€215 | −€195 (+€5) |
| 3. Why | Busyness no longer affects sales | −€207 | −€197 (+€3) |
| 4. More data doesn't help | 52 weeks instead of 20 | −€202 | +€437 (+€637), wrong sign in 99.7% of pilots |

**Takeaways:** random assignment is unbiased; selective assignment is biased only when it is linked to the potential outcomes (Steps 2 and 3 remove that link); and more data reduces noise but not bias (Step 4).

## How to use

1. Open the live app.
2. Click the four steps in order and read each summary.
3. Adjust the sliders and run the simulation to explore other settings. The same seed and settings always give the same results.

## Limitations

- The simulation shows a property of the estimator under its model assumptions; it does not estimate any real effect at Markthalle Neun.
- It assumes weeks do not affect each other (no spillovers) and that random assignment is followed as planned.
- With few weeks, even random estimates are imprecise: unbiased on average, but not always right in a single pilot.

## About

Built for Assignment 1 of CS130 (Knowledge: Information-Based Decisions). The app was generated with Google Gemini AI Studio from a specification written by the author, with help from Claude (Anthropic) in drafting the specification and this README.
