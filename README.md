# DSA Mock Interviewer

A FAANG-level SDE-2 technical interview simulator that runs entirely inside your AI-powered IDE. Practice data structures and algorithms interviews with a Socratic-style AI interviewer that challenges your thinking, catches your mistakes, and never gives away the answer.

Supports both [Kiro](https://kiro.dev) and [GitHub Copilot](https://github.com/features/copilot) (in VS Code).

## Getting Started

### Prerequisites

- [Kiro IDE](https://kiro.dev) or [VS Code](https://code.visualstudio.com/) with [GitHub Copilot](https://github.com/features/copilot) installed
- Node.js (ES Modules)

### Setup

```bash
npm install
```

### Start a Session

**In Kiro:** Trigger the **Start DSA Mock Interview** hook from the Kiro hooks panel.

**In VS Code (Copilot):** Open the Chat panel and run the **Start DSA Mock Interview** prompt from `.github/prompts/start-mock-interview.prompt.md`.

You'll get a single setup prompt with all options — reply with your choices or just say "go" for defaults.

**Quickstart example:**
> Mock, DP, Google, Tough

**All-defaults:**
> go

### Defaults

| Option | Default |
|--------|---------|
| Mode | Mock |
| Format | Single session |
| Problem source | Interviewer-generated |
| Company | Random |
| Topic | Random |
| Personality | Neutral |
| Difficulty Progression | Off |
| Timer (Mock only) | 35 min |

## Interview Phases

Every session follows six sequential phases with visual banners and a progress tracker:

```
[🔍 Clarification] → [📝 Approach] → [💻 Coding] → [🧪 Edge Cases] → [🏃 Dry Run] → [📊 Debrief]
```

1. **Clarification** — interviewer asks clarifying questions about constraints and edge cases
2. **Approach** — describe your algorithm, discuss tradeoffs and complexity
3. **Coding** — write your solution with inline comments as think-aloud narration
4. **Edge Cases** — *you* list edge cases your code should handle, interviewer verifies and nudges for misses
5. **Dry Run** — trace through a test input step by step, stating variable values
6. **Debrief** — full scorecard with collapsible sections and visual indicators

## Commands

| Command | What it does |
|---------|-------------|
| `!hint` | Socratic nudge (progressive). Mock: max 3. Practice: unlimited. |
| `!reveal` | Show optimal solution, skip to Debrief. |
| `!restart` | Reset session and start over. |
| `!optimal` | Post-Debrief. Step-by-step optimal walkthrough + divergence analysis. |
| `!recap` | Any time. Score heatmap, recent sessions, weaknesses, focus recommendation. |

## Debrief Scoring

Seven dimensions scored 1–5 with visual indicators (✅ ⚠️ ❌):

| Dimension | What it evaluates |
|-----------|-------------------|
| Approach Quality | Strategy, efficiency, fit for constraints |
| Complexity Accuracy | Correct time/space analysis |
| Edge Case Coverage | Proactive identification, prediction accuracy, missed cases |
| Communication & Fluency | Sentence structure, confidence, conciseness, technical vocabulary |
| Clarifying Questions | Meaningful questions showing comprehension |
| Think-Aloud | Verbalised tradeoffs, multiple strategies, reasoning |
| Code Narration | Quality of inline comments used to narrate thinking |

**Verdict:** 🟢 Hire (avg ≥ 4.0, no dim below 3) · 🟡 Borderline · 🔴 No Hire (avg < 3.0 or ≥2 dims rated 1)

The debrief uses collapsible sections — scorecard and verdict are always visible, details (communication tips, edge case analysis, pace report, pitfalls, anti-patterns, DSA pattern, improvement suggestions) expand on click.

## Session Modes

### Practice Mode
- Unlimited hints
- Proactive Socratic nudges when stuck (after 2 exchanges)
- Anti-patterns flagged in real time
- Collaborative edge case nudges (up to 2 per missed case)
- Communication tips focused on learning

### Mock Mode
- Max 3 hints, strict pacing
- No proactive help — you have to ask
- Anti-patterns noted silently, reported in Debrief only
- One nudge max per missed edge case
- Timer with mid-session and 5-minute warnings

## Features

### Interviewer Behavior
- **Socratic style** — never gives answers, guides with questions
- **Never blindly agrees** — independently verifies every claim before confirming
- **Brief when you're right** — says "Correct." and moves on, no lecturing
- **Challenges wrong claims** — constructs counterexamples instead of saying "that's wrong"
- **JS pitfall detection** — flags 5 categories of common JS mistakes during coding
- **Code narration** — expects inline comments as think-aloud (since you're coding in chat)

### Tracking & Progression
- **Weakness log** (`src/weakness-log.md`) — tracks weak areas with status progression: `new` → `recurring` → `improving` → `resolved` → `retest`
- **Spaced repetition** — resolved weaknesses come back for re-testing after 3 sessions
- **Difficulty progression** — adjusts Easy/Medium/Hard based on verdict + hint usage, with weakness-aware overrides
- **Pace coaching** — tracks phase durations against FAANG benchmarks (Clarification 3–5m, Approach 5–8m, Coding 15–20m, Dry Run 3–5m)
- **Score heatmap** — `!recap` shows a color-coded grid of all 7 dimensions across your last 5 sessions

### Session Artifacts
- **Session replays** (`src/session-replays/`) — includes key exchanges (verbatim moments that matter for learning)
- **Problem file** (`src/current-problem.md`) — auto-created at session start with formatted problem statement and a notes section, auto-deleted after session
- **PDF export** — shareable progress report with stats, tables, and color coding

### Interviewer Personalities

| Personality | Tone |
|-------------|------|
| Friendly | Warm, encouraging. "Great thinking!" |
| Neutral | Professional, balanced. "That's correct." |
| Tough | Direct, high-pressure. "Wrong. Fix it." |

## CLI Scripts

### Run Tests
```bash
npm test
```

### Export Progress Report (PDF)
```bash
npm run export
npm run export -- --sessions 5 --output my-report.pdf
```
Generates a styled PDF with hero stats, session history, problems solved, and weakness areas. Optimized for sharing on LinkedIn/X.

### Daily Problem Suggestion
```bash
npm run daily
npm run daily -- --new              # only unsolved problems
npm run daily -- --topic DP         # force a topic
npm run daily -- --new --topic Trees
```
Reads your weakness log and suggests a problem weighted toward your weakest topics. Includes a built-in bank of ~80 problems across 8 topics and 3 difficulties. Override with your own `src/scripts/problem-bank.json`.

## Automation

Session lifecycle is automated differently depending on your IDE:

### Kiro (Hooks)

Three agent hooks automate session lifecycle:

| Hook | Trigger | What it does |
|------|---------|-------------|
| `start-mock-interview` | User-triggered | Collects session params in a single prompt, loads reference files, begins session |
| `post-session-save` | Agent stop | Ensures session replay and weakness log are saved after every debrief |
| `phase-pace-monitor` | Prompt submit | Silently counts exchanges per phase, nudges interviewer when a phase runs long |

### VS Code + GitHub Copilot (Prompts)

Two reusable prompts in `.github/prompts/`:

| Prompt | What it does |
|--------|-------------|
| `start-mock-interview.prompt.md` | Collects session params, loads reference files, begins session |
| `save-session.prompt.md` | Saves session replay, updates weakness log, cleans up after debrief |

Note: Copilot does not have an equivalent to Kiro's `phase-pace-monitor` hook (auto-triggered on every message). Pace coaching rules are embedded in `copilot-instructions.md` instead.

## Project Structure

```
src/
├── interview-utils.js          # Core utility functions (validation, scoring, pacing, difficulty, replay)
├── interview-utils.test.js     # Unit + property-based tests (fast-check)
├── scripts/
│   ├── export.js               # npm run export — PDF progress report
│   ├── daily.js                # npm run daily — weakness-based problem suggestion
│   └── problem-bank.json       # Custom problem bank (optional, user-maintained)
├── session-replays/            # Session replay files (gitignored)
├── weakness-log.md             # Weakness tracker (gitignored)
├── current-problem.md          # Active problem during session (gitignored, auto-deleted)
└── interview-report.pdf        # Exported report (gitignored)

.kiro/                              # Kiro IDE configuration
├── steering/
│   ├── dsa-interviewer.md          # Core interviewer persona, phases, scoring rules
│   ├── structure.md                # Project structure reference
│   ├── tech.md                     # Tech stack conventions
│   └── product.md                  # Product summary
├── hooks/
│   ├── start-mock-interview.kiro.hook
│   ├── post-session-save.kiro.hook
│   └── phase-pace-monitor.kiro.hook
└── specs/dsa-mock-interviewer/
    ├── requirements.md
    ├── design.md
    ├── tasks.md
    └── ref/                        # Shared reference docs (used by both Kiro and Copilot)
        ├── advanced-features.md
        ├── company-profiles.md
        └── multi-round.md

.github/                            # GitHub Copilot configuration
├── copilot-instructions.md         # Full interviewer rules for Copilot
└── prompts/
    ├── start-mock-interview.prompt.md
    └── save-session.prompt.md
```

## Company Support

50+ companies with tailored problem selection and evaluation emphasis:

**Big Tech:** Google, Microsoft, Meta, Amazon, Apple
**Product/Platform:** Adobe, Uber, Salesforce, LinkedIn, Airbnb, Atlassian, and more
**Fintech:** Stripe, PayPal, Goldman Sachs, JP Morgan, Razorpay, Zerodha, and more
**Indian Tech:** Flipkart, CRED, Zomato, PhonePe, Swiggy, Meesho, and more
**Enterprise:** Oracle, VMware, Samsung, Walmart, Rubrik, and more
