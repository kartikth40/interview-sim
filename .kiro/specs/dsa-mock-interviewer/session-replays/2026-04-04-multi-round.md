# Session Replay — Multi-Round Mock Interview
**Date:** 2026-04-04
**Mode:** Mock_Mode
**Format:** Multi_Round_Session
**Company:** N/A (Candidate Problem Mode)
**Personality:** Neutral
**Difficulty Progression:** On (started at Medium)

---

## Round 1 — Populating Next Right Pointers in Each Node II (Medium)
**Approach:** BFS level-order → optimized to O(1) space using existing next pointers. Iterative, level-by-level linking with prev/next/cur pointers.
**Key Decisions:** Independently improved from O(n) to O(1) space. Clean backtracking-free iterative solution.
**Mistakes:** Undeclared variable (`prev` missing `let`) — corrected immediately.
**Hints:** 0 | **Pitfalls:** 1 (corrected)
**Edge Cases:** 4/4 | **Dry Run:** Accurate
**Verdict:** Hire | **Avg:** 4.5

## Round 2 — Path Sum III (Medium-Hard)
**Approach:** Prefix sum + hashmap adapted from subarray sum problem (LC 560), with DFS backtracking for tree branches.
**Key Decisions:** Strong pattern recognition connecting linear prefix sum to tree traversal.
**Mistakes:** Miscounted paths in negative-value and all-zeros edge cases.
**Hints:** 0 | **Pitfalls:** 0
**Edge Cases:** 2/4 | **Dry Run:** Accurate
**Verdict:** Hire | **Avg:** 4.0

## Round 3 — Course Schedule III (Hard)
**Approach:** Greedy + max-heap. Sort by deadline, greedily take courses, swap longest course when current doesn't fit.
**Key Decisions:** Identified swap condition. Caught empty heap guard during discussion.
**Mistakes:** Initially stated O(n) time (corrected to O(n log n)). Skipped clarification phase. Minimal think-aloud during coding. Sorting order misstep in dry run trace.
**Hints:** 0 | **Pitfalls:** 0
**Edge Cases:** 4/4 | **Dry Run:** Accurate (correct result)
**Verdict:** Borderline | **Avg:** 3.67

---

## Cumulative
**Overall Verdict:** Hire (2 Hire, 1 Borderline)
**Stamina:** Degraded — communication and engagement dropped with difficulty.
**Trends:** Approach quality consistent. Clarifying questions, communication, think-aloud all degraded across rounds.
**Key Improvement Areas:** Clarification discipline on hard problems. Consistent think-aloud during coding regardless of difficulty.
