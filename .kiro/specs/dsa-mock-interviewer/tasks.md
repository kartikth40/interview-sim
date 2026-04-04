# Implementation Plan: DSA Mock Interviewer

## Overview

This plan implements the DSA Mock Interviewer as a Kiro-native feature using a steering file, a hook file, and utility functions for the deterministic correctness properties. All interviewer behaviour is defined in markdown steering/hook files. Utility functions extract the deterministic, computable logic identified in the design's correctness properties.

## Tasks

- [x] 1. Create the steering file with persona, phases, and core rules
  - [x] 1.1 Create `.kiro/steering/dsa-interviewer.md` with Persona Definition, Session Modes, and Phase Definitions sections
    - Define the SDE-2 FAANG interviewer persona with Socratic, non-solution-giving style
    - Define Practice_Mode vs Mock_Mode behavioural differences
    - Define the six sequential phases: Clarification → Approach → Coding → Edge_Case_Challenge → Dry_Run → Debrief with entry/exit conditions and transition rules
    - Include the `!reveal` command definition and no-solution-giving rule
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1–3.11_

  - [x] 1.2 Add Hint System Rules and Pushback Rules sections to the steering file
    - Define `!hint` command behaviour: Socratic nudges, progressive hints, distinct from previous hints
    - Define Mock_Mode 3-hint limit and Practice_Mode unlimited hints
    - Define pushback triggers: suboptimal complexity, missing complexity analysis, unhandled edge cases
    - Require at least one pushback per session during Coding or Approach phase
    - _Requirements: 4.1–4.5, 5.1–5.5_

  - [x] 1.3 Add JS Pitfall Detection and Timer Rules sections to the steering file
    - List all five JS pitfall categories: `=` vs `===`, undeclared variables, off-by-one errors, mutating parameters, `==` vs `===`
    - Define real-time flagging behaviour: quote offending line, name pitfall, ask Candidate to fix
    - Define Mock_Mode timer logic: start/end time display, half-time reminder, 5-minute warning, expiry transition to Debrief
    - _Requirements: 6.1–6.4, 7.1–7.5_

  - [x] 1.4 Add Debrief Rubric and Company Profiles sections to the steering file
    - Define six scoring dimensions (1-5 scale): Approach Quality, Time/Space Complexity Accuracy, Edge Case Coverage, Communication Clarity, Clarifying Questions Quality, Think_Aloud_Score
    - Define verdict logic: Hire / Borderline / No Hire based on aggregate scores
    - Define Pace_Report format with FAANG benchmarks
    - Define company profiles for Google, Meta, Amazon, Microsoft, Apple with topic preferences and evaluation emphasis
    - _Requirements: 8.1–8.8, 9.1–9.6_

- [x] 2. Checkpoint — Verify steering file core sections
  - Ensure the steering file exists at `.kiro/steering/dsa-interviewer.md` and contains all sections from tasks 1.1–1.4. Ask the user if questions arise.

- [x] 3. Add advanced steering file sections
  - [x] 3.1 Add State Tracking, Follow-Up Problem, and Think Aloud Evaluation sections
    - Define phase tracking, hint count, pitfall count, approach reference rules
    - Define `!restart` command: confirm, reset hint count, re-trigger initialisation
    - Define follow-up problem rules: offer on Hire/Borderline, add constraint, condensed Approach+Coding session
    - Define think-aloud sub-criteria, silent coding detection (3+ exchanges), prompting rules
    - _Requirements: 10.1–10.5, 11.1–11.5, 12.1–12.5_

  - [x] 3.2 Add Dry Run Rules, Pattern Recognition, and Communication Anti-Pattern Detection sections
    - Define test input generation (distinct from examples), variable tracing, discrepancy detection
    - Define post-debrief pattern identification with DSA_Pattern name, explanation, and 2-3 similar problems
    - Define anti-pattern list: prolonged silence, jumping to code, excessive hedging, over-explaining
    - Define mode-specific flagging: real-time in Practice_Mode, debrief-only in Mock_Mode
    - _Requirements: 13.1–13.7, 14.1–14.5, 15.1–15.5_

  - [x] 3.3 Add Candidate Problem Mode, Multi-Round Session, and Weakness Log Integration sections
    - Define validation rules for user-provided problems (description + at least one example I/O)
    - Define multi-round structure: 3 rounds with escalating difficulty and timers, per-round debrief, cumulative debrief with stamina assessment
    - Define weakness log read-on-start, write-after-debrief, recurring weakness detection (≥3 entries)
    - _Requirements: 16.1–16.5, 17.1–17.6, 18.1–18.5_

  - [x] 3.4 Add Optimal Solution Walkthrough, Pace Coaching, Difficulty Progression, and Edge Case Challenge sections
    - Define `!optimal` command: post-debrief only guard, step-by-step walkthrough, divergence analysis
    - Define pace coaching: phase timing tracking, benchmark comparison, Over Time / Rushed / On Track flags
    - Define difficulty progression: Medium start, escalate on Hire+≤1 hint, de-escalate on No Hire or ≥3 hints, maintain on Borderline, clamp to [Easy, Hard]
    - _Requirements: 19.1–19.5, 20.1–20.5, 21.1–21.6, 22.1–22.7_

  - [x] 3.5 Add Session Replay Generation, Interviewer Personality Variants, and Special Commands sections
    - Define replay file generation: naming convention `{date}-{title-kebab}.md`, content structure, 150-line cap
    - Define three personality variants (Friendly, Neutral, Tough) with tone rules and consistency requirement
    - Default personality: Neutral
    - Consolidate all special commands: `!hint`, `!reveal`, `!optimal`, `!restart`
    - _Requirements: 23.1–23.5, 24.1–24.7_

- [x] 4. Checkpoint — Verify complete steering file
  - Ensure the steering file contains all 24 requirement areas. Ask the user if questions arise.

- [x] 5. Create the hook file
  - [x] 5.1 Create `.kiro/hooks/start-mock-interview.md` with frontmatter and parameter collection flow
    - Add `trigger: user` and `description: Start a DSA mock interview session` frontmatter
    - Define the sequential parameter collection: mode, format, problem source, company, topic, personality, difficulty progression, timer duration
    - Include weakness log read instruction on session start
    - Include Candidate_Problem_Mode validation step
    - Include Multi_Round_Session option with three rounds
    - Default personality to Neutral when none selected
    - Hand off to steering file's Clarification phase after all parameters collected
    - _Requirements: 2.1–2.8, 16.1–16.2, 17.1, 24.1–24.2_

- [x] 6. Create utility functions for testable correctness properties
  - [x] 6.1 Create `src/interview-utils.js` with `validateProblemStatement` function
    - Accept a problem object, return true if it has a non-empty description and at least one example with input and output
    - Return false otherwise
    - _Requirements: 2.8, 16.3 — Design Property 1_

  - [x] 6.2 Add `detectWeaknessCategoryThresholds` function to `src/interview-utils.js`
    - Accept a weakness log (array of entries with categories), return array of categories appearing in ≥3 entries
    - Categories with <3 entries must not be included
    - _Requirements: 18.5 — Design Property 2_

  - [x] 6.3 Add `classifyPhasePace` function to `src/interview-utils.js`
    - Accept phase name and duration in minutes, return "Over Time" if duration > 150% of benchmark upper bound, "Rushed" if duration < 50% of benchmark lower bound, "On Track" otherwise
    - Use benchmarks: Clarification (3–5), Approach (5–8), Coding (15–20), Dry Run (3–5)
    - _Requirements: 20.2, 20.3, 20.4 — Design Property 3_

  - [x] 6.4 Add `computeNextDifficulty` function to `src/interview-utils.js`
    - Accept (previousVerdict, hintCount, currentDifficulty), return next difficulty
    - Hire + hints ≤ 1 → escalate; No Hire or hints ≥ 3 → de-escalate; Borderline → maintain
    - Clamp result to [Easy, Hard]
    - _Requirements: 21.2, 21.3, 21.4, 21.6 — Design Property 4_

  - [x] 6.5 Add `computeEdgeCaseAccuracy` function to `src/interview-utils.js`
    - Accept array of edge case results (each with `correct` boolean), return correct count / total
    - Handle empty array (return 0 or NaN as appropriate)
    - _Requirements: 22.6 — Design Property 5_

  - [x] 6.6 Add `generateReplayFilename` function to `src/interview-utils.js`
    - Accept date string (YYYY-MM-DD) and problem title, return `{date}-{kebab-case-title}.md`
    - Convert title to lowercase, replace spaces and special chars with hyphens, collapse consecutive hyphens
    - _Requirements: 23.2 — Design Property 6_

- [x] 7. Final checkpoint — Verify all files
  - Ensure the steering file, hook file, and all six utility functions are complete and correct. Ask the user if questions arise.

## Notes

- The steering file and hook file are the core deliverables — they define all interviewer behaviour
- Utility functions in `src/interview-utils.js` extract deterministic logic from the design's correctness properties
- Property 7 (Session Replay Line Count Invariant) is validated behaviourally by the steering file's 150-line cap rule rather than a utility function, since replay generation is done by the AI in chat
