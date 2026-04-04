---
inclusion: always
---

# Project Structure

```
├── src/
│   ├── interview-utils.js        # Core utility functions (validation, scoring, pacing, difficulty, replay)
│   ├── interview-utils.test.js   # Unit + property-based tests for all utils
│   ├── session-replays/          # Saved session replay files (gitignored)
│   ├── weakness-log.md           # Persistent weakness tracker across sessions (gitignored)
│   ├── current-problem.md        # Active problem statement during session (gitignored, auto-deleted)
│   ├── interview-report.md       # Exported progress report (gitignored)
│   └── scripts/                  # CLI tools (export, daily)
│       ├── export.js             # npm run export — shareable progress report
│       ├── daily.js              # npm run daily — weakness-based problem suggestion
│       └── problem-bank.json     # Curated problem bank by topic/difficulty (user-maintained)
├── .kiro/
│   ├── specs/dsa-mock-interviewer/  # Feature spec (requirements, design, tasks)
│   │   └── ref/                     # Reference docs (company profiles, multi-round rules, advanced features)
│   ├── steering/                    # Steering rules for AI assistant
│   └── hooks/                       # Agent hooks (start-mock-interview, post-session-save, phase-pace-monitor)
├── package.json                     # ES module config, devDependencies only
└── .gitignore
```

# Patterns

- All source code lives in `src/`
- Test files are co-located with source: `*.test.js` next to `*.js`
- Each test file contains both unit tests and property-based tests (fast-check) grouped by function in `describe` blocks
- Property-based tests are in nested `describe('Property N: ...')` blocks within each function's suite
- Spec reference documents live under `.kiro/specs/{feature}/ref/`
