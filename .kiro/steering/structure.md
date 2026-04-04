---
inclusion: always
---

# Project Structure

```
├── src/
│   ├── interview-utils.js        # Core utility functions (validation, scoring, pacing, difficulty, replay)
│   ├── interview-utils.test.js   # Unit + property-based tests for all utils
│   └── session-replays/          # Saved session replay files
├── .kiro/
│   ├── specs/dsa-mock-interviewer/  # Feature spec (requirements, design, tasks)
│   │   └── ref/                     # Reference docs (company profiles, multi-round rules, advanced features)
│   ├── steering/                    # Steering rules for AI assistant
│   └── hooks/                       # Agent hooks
├── package.json                     # ES module config, devDependencies only
└── .gitignore
```

# Patterns

- All source code lives in `src/`
- Test files are co-located with source: `*.test.js` next to `*.js`
- Each test file contains both unit tests and property-based tests (fast-check) grouped by function in `describe` blocks
- Property-based tests are in nested `describe('Property N: ...')` blocks within each function's suite
- Spec reference documents live under `.kiro/specs/{feature}/ref/`
