# DSA Mock Interviewer

A FAANG-level SDE-2 technical interview simulator powered by Kiro. Practice data structures and algorithms interviews with a Socratic-style AI interviewer that guides you through problems without giving away answers.

## Getting Started

### Prerequisites

- [Kiro IDE](https://kiro.dev)
- Node.js (for running utility tests)

### Setup

```bash
npm install
```

### Start a Session

Open this project in Kiro and start a chat. Provide a DSA problem (or ask the interviewer to pick one) and specify your mode:

- **Practice Mode** — unlimited hints, proactive guidance when you're stuck, real-time anti-pattern flagging
- **Mock Mode** — max 3 hints, no proactive help, strict scoring (simulates a real interview)

Example prompt:

> Let's do a mock interview. Here's the problem: Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`.

## Interview Phases

Every session follows six sequential phases:

1. **Clarification** — the interviewer asks clarifying questions about constraints and edge cases
2. **Approach** — you describe your algorithm in plain language, discuss tradeoffs and complexity
3. **Coding** — you write your solution in JavaScript while thinking aloud
4. **Edge Case Challenge** — the interviewer presents edge cases one at a time for you to predict
5. **Dry Run** — you trace through a test input step by step
6. **Debrief** — full scorecard with verdict (Hire / Borderline / No Hire)

## Commands

Use these during a session:

| Command | What it does |
|---------|-------------|
| `!hint` | Get a Socratic nudge (progressive, no spoilers). Mock: max 3. Practice: unlimited. |
| `!reveal` | Show the full optimal solution and skip to Debrief. |
| `!restart` | Reset the session and start over. |
| `!optimal` | Post-Debrief only. Step-by-step optimal walkthrough with divergence analysis. |

## Debrief Scoring

Six dimensions scored 1–5:

| Dimension | What it evaluates |
|-----------|-------------------|
| Approach Quality | Strategy, efficiency, fit for constraints |
| Complexity Accuracy | Correct time/space analysis |
| Edge Case Coverage | Proactive consideration, prediction accuracy |
| Communication Clarity | Clear, structured explanations |
| Clarifying Questions | Meaningful questions showing comprehension |
| Think-Aloud | Verbalised tradeoffs, multiple strategies, reasoning |

**Verdict:** Hire (avg ≥ 4.0, no dim below 3) · Borderline · No Hire (avg < 3.0 or ≥2 dims rated 1)

## Features

- **JS Pitfall Detection** — flags common JavaScript mistakes during coding (assignment in conditions, missing declarations, off-by-one errors, parameter mutation, loose equality)
- **Pace Coaching** — tracks time per phase against FAANG benchmarks
- **Weakness Tracking** — identifies recurring weak areas across sessions
- **Difficulty Progression** — adjusts problem difficulty (Easy/Medium/Hard) based on your performance
- **Session Replay** — generates replay files for review

## Running Tests

```bash
npx vitest --run
```
