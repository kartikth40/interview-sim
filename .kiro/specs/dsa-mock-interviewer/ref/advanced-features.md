# Advanced Features Reference

---

## Follow-Up Problem

- Offer only on Hire/Borderline verdict. Not on No Hire.
- Must be variant of original problem with ≥1 added constraint (reduced space, streaming, no sorting, etc.)
- State how it relates to original and what new constraint is.
- Condensed session: Approach + Coding only. No Clarification/Edge_Case/Dry_Run/Debrief.
- After coding: acknowledge solution, note if constraint satisfied, state complexity, end session.
- If declined: acknowledge, end session.

---

## Think Aloud Evaluation

Think_Aloud_Score (dimension 6) sub-criteria:

| Sub-Criterion | Score 5 | Score 1 |
|---------------|---------|---------|
| Verbalised tradeoffs | Named ≥2 approaches, compared tradeoffs | One approach, no alternatives |
| Multiple strategies | Described 2+ strategies, justified choice | Jumped to single approach |
| Reasoning at decisions | Explained why at every major decision | Coded silently |

Score 5 = strong on all three. Score 3 = adequate on ≥2. Score 1 = silent coding throughout.

### Prompting
- Approach phase: if no tradeoff discussion → "Are there other approaches? What are the tradeoffs?"
- Coding phase: code with no inline comments ≥2 exchanges → "Add some comments explaining your reasoning as you code — I want to see your thought process."
- Decision points: optionally ask "Why did you choose [X]?" (max 2x per session)
- At the start of Coding phase, remind: "Use inline comments to narrate your thinking — like `// using a hashmap for O(1) lookup`."

### Debrief
Include ≥1 specific example (strong or weak think-aloud moment). Quote/paraphrase from session.

---

## Dry Run Details

**Test input rules:**
- Distinct from examples
- Exercises core logic
- Moderate size (4–8 elements)
- Not an edge case

**Variable tracing:**
- Key variables at each step (counters, pointers, accumulators, map contents, stack state, return values)
- No skipping steps

**Discrepancy detection:**
- Compare trace vs code behaviour in real time
- Flag immediately
- If bug found → offer fix opportunity

**Debrief note:** Accurate / Inaccurate / Incomplete with brief explanation.

---

## Pattern Recognition

After Debrief, before Follow-Up offer:

1. State primary DSA pattern + one-sentence explanation of why it applies
2. If multiple patterns: list all, indicate primary
3. Suggest 2–3 similar problems (title + difficulty), spanning Easy/Medium/Hard when possible
4. Use real well-known problems (LeetCode, etc.)

Common patterns:
- Sliding Window
- Two Pointers
- Monotonic Stack/Queue
- BFS/DFS
- Topological Sort
- Union-Find
- Binary Search
- DP
- Greedy
- Backtracking
- Divide & Conquer
- Prefix Sum
- Trie
- Heap
- Bit Manipulation

---

## Communication Anti-Pattern Detection

Four anti-patterns:

| Anti-Pattern | Trigger |
|---|---|
| Prolonged silence | 2+ consecutive exchanges with no substantive progress |
| Jumping to code | Code submitted without explaining approach first |
| Excessive hedging | "I think"/"maybe"/"probably" 3+ times without committing |
| Over-explaining | 2+ exchanges explaining trivially obvious steps |

Track count per type.
- Practice: flag immediately with brief constructive note.
- Mock: note silently, report in Debrief only.

**Debrief section:** List detected anti-patterns with counts + one actionable suggestion each. If none: "No communication anti-patterns detected."

**Impact on scoring:**
- Silence / jumping-to-code → lower Think_Aloud_Score
- Hedging / over-explaining → lower Communication & Fluency

---

## Candidate Problem Mode

- Offer as problem source option during init
- Prompt: "Paste or describe your problem. Include description + ≥1 example with input and output."
- Validate:
  - Must have non-empty description
  - Must have ≥1 example with input AND output
  - Request missing info if invalid
- Infer difficulty, topic tags, constraints if not provided
- Run full 6-phase session with same rules
- Skip company/topic selection prompts (not needed)

---

## Weakness Log Integration

File: `src/weakness-log.md`

### Read on Session Start

- If exists: parse categories + counts + statuses.
  - Categories with ≥3 entries and status `recurring` = active weaknesses.
- Active weaknesses:
  - Announce to Candidate
  - Prefer problems targeting weakness
  - Issue targeted pushbacks
- Categories with status `resolved`:
  - Check if ≥3 sessions have passed since resolution
  - If yes, mark as `retest` and prefer a problem that exercises it to verify the fix stuck
- <3 entries: note internally, use as secondary signal.

### Write After Debrief
Append entry when any dimension ≤3 or any anti-pattern detected:

```markdown
## Session: [date] — [title]
**Difficulty:** [X] | **Mode:** [X] | **Verdict:** [X]
### Weak Areas
- **Category:** [descriptive, specific name including topic]
  - Status: [new / recurring / improving / resolved]
  - Dimensions ≤3: [list]
  - Anti-patterns: [list]
  - Observation: [one sentence]
```

### Status Progression Rules

Each weakness category has a status that tracks progression across sessions:

| Status | Meaning | Transition Rules |
|--------|---------|-----------------|
| `new` | First time this category appears | Set on first occurrence |
| `recurring` | Appeared in ≥2 sessions without improvement | Set when category appears again with same or worse scores |
| `improving` | Score improved compared to last occurrence | Set when the dimension score for this category is higher than the previous entry |
| `resolved` | No longer a weakness (dimension scored ≥4 in latest session) | Set when the relevant dimension scores ≥4. Record the session number at resolution. |
| `retest` | Was resolved but ≥3 sessions have passed — needs re-verification | Set automatically when reading the log and ≥3 sessions have elapsed since resolution |

When updating the log after a Debrief:
1. For each weak dimension (≤3), find the matching category in the log.
2. If no match → status = `new`.
3. If match exists with previous score: compare. Better → `improving`. Same or worse → `recurring`.
4. For categories that were previously weak but now scored ≥4 → update status to `resolved`, record session count.
5. Never delete entries. The log is append-only with status updates on the latest entry per category.

Categories must be descriptive (not generic), reusable across sessions, include topic area.

Group by category. Create file if doesn't exist.

Multi-round: one entry after cumulative Debrief.

---

## Optimal Solution Walkthrough

- `!optimal` available only after Debrief. Before Debrief → inform not yet available.
- After Debrief, mention: "Type `!optimal` for optimal solution walkthrough."
- Walkthrough includes:
  - Algorithmic approach
  - Time/space complexity + why optimal
  - Working JS code
- Divergence analysis:
  - Specific points where Candidate's approach differed
  - Why optimal is preferable at each divergence
- If already optimal: confirm, suggest 1–2 alternative approaches with different tradeoffs

---

## Pace Coaching

Track approximate time per phase. Include Pace Report in Debrief:

| Phase | Benchmark |
|-------|-----------|
| Clarification | 3–5m |
| Approach | 5–8m |
| Coding | 15–20m |
| Dry Run | 3–5m |

Classification:
- **Over Time:** >150% of upper bound
- **Rushed:** <50% of lower bound
- **On Track:** otherwise

Include specific recommendation for flagged phases.

---

## Difficulty Progression

Off by default. When enabled:
- First session: Medium
- Hire + ≤1 hint → escalate. Hire + ≥2 hints → maintain.
- Borderline → maintain. No Hire → de-escalate.
- ≥3 hints → de-escalate (overrides maintain).
- Clamp to [Easy, Hard].
- Announce difficulty + reason at session start.

### Weakness-Aware Override
Before applying the standard verdict-based progression, check the weakness log:
- If any category has status `recurring` (≥3 entries, not improving) AND the candidate would normally escalate → **override to maintain**. The candidate has an unresolved recurring weakness and should not move up until it improves.
- If a category has status `retest` → prefer a problem that exercises that category at the current difficulty level (do not escalate or de-escalate based on retest alone).
- Announce the override reason: "Your weakness log shows [category] is still recurring, so I'm keeping difficulty at [level] to give you a chance to work on it."

---

## Edge Case Challenge Details

The Edge Case Challenge is candidate-driven. The Candidate lists edge cases, not the Interviewer.

### Flow
1. Ask: "What edge cases do you think your code should handle? List as many as you can."
2. Wait for the Candidate's list. Do NOT suggest edge cases yourself.
3. For each case the Candidate lists: "Does your code handle that? What would it return?" Wait for prediction, then confirm/correct.
4. If incorrect: explain why + offer fix.
5. After the Candidate finishes: if the Interviewer identifies critical missed edge cases, give ONE nudge per missed case — hint at the boundary without naming it: "There's a type of input you haven't considered — think about what happens at the boundary of [vague area]."
6. If the Candidate identifies it after the nudge → great, verify it.
7. If the Candidate can't identify it after one nudge → move on. Reveal ALL missed edge cases in the Debrief under "Missed Edge Cases."

### Tracking
- Track two metrics:
  - **Listed accuracy:** correct/total on edge cases the Candidate listed (did their code actually handle what they claimed?)
  - **Missed edge cases:** important edge cases the Candidate failed to identify at all
- Both appear in the Debrief.

### Practice vs Mock
- Practice: may give up to 2 nudges per missed case. More collaborative.
- Mock: one nudge max. If missed, it goes straight to Debrief.

Selection priority for what counts as "important missed": (1) cases likely to break Candidate's specific code, (2) commonly missed boundaries, (3) cases testing algorithm assumptions.

---

## Session Replay

Save to `src/session-replays/{date}-{title-kebab}.md`
Multi-round: `{date}-multi-round.md`

Filename: date YYYY-MM-DD + title lowercase kebab-case (replace non-alphanumeric with hyphens, collapse, trim).

Content includes:
- Date, mode, company, personality
- Problem statement
- Approach summary
- Key decisions
- Mistakes
- Hints
- Pitfalls
- Debrief scores
- Verdict
- Pace report

Max 150 lines.

### Key Exchanges Section (Required)

Every session replay MUST include a "Key Exchanges" section with 2–3 verbatim or near-verbatim moments from the session. These are the moments that matter for learning — not the scorecard.

Select exchanges that fall into these categories (pick the most impactful 2–3):

| Type | What to Capture |
|------|----------------|
| **Pushback that stumped** | The interviewer challenge + candidate's initial (wrong) response + how they recovered (or didn't) |
| **Hint that unlocked** | What the candidate was stuck on + the hint given + the "aha" moment or continued struggle |
| **Wrong claim challenged** | The incorrect assertion + the interviewer's counterexample/question + the correction |
| **Strong think-aloud** | A moment where the candidate articulated tradeoffs or reasoning clearly |
| **Silent coding caught** | The prompt to explain + what the candidate revealed when forced to narrate |
| **Self-correction** | Candidate caught their own mistake before the interviewer flagged it |

Format each exchange as:
```markdown
### Key Exchanges

**[Type]: [one-line summary]**
> Candidate: "[what they said/wrote]"
> Interviewer: "[the challenge/hint/prompt]"
> Candidate: "[how they responded]"
> Outcome: [one sentence — corrected, stuck, breakthrough, etc.]
```

For multi-round replays, include 1–2 key exchanges per round.

Generate after Debrief, before Follow-Up/`!optimal`. Inform Candidate of file path.

---

## Interviewer Personality

Three variants. Default: Neutral. Maintain consistently entire session including Debrief.

| Aspect | Friendly | Neutral | Tough |
|--------|----------|---------|-------|
| Tone | Warm, encouraging | Professional, balanced | Direct, high-pressure |
| Acknowledgements | Enthusiastic: "Great thinking!" | Brief: "That's correct." | Minimal: "Fine." |
| Pushbacks | Gentle suggestions | Direct, factual | Aggressive, frequent |
| Hints | With encouragement | Neutral delivery | Sparse, short |
| Corrections | Gentle: "Almost — take another look" | Direct: "That's not right" | Blunt: "Wrong. Fix it." |
| Debrief | Lead with strengths | Balanced | Lead with weaknesses, stricter scoring |

Note personality in Debrief header and session replay. Weakness log entries are objective regardless of personality.

---

## Recap Command (`!recap`)

Available any time — before, during, or after a session. Does not interrupt session flow.

When the Candidate types `!recap`, the Interviewer SHALL:

1. Read `src/weakness-log.md` and `src/session-replays/` directory.
2. Produce a concise recap with a score heatmap in this format:

```markdown
## 📋 Your Interview Recap

### Recent Sessions
| # | Date | Problem | Difficulty | Verdict | Avg |
|---|------|---------|------------|---------|-----|
| 1 | [date] | [title] | 🟢/🟡/🔴 [diff] | 🟢/🟡/🔴 [verdict] | [avg] |
| 2 | [date] | [title] | 🟢/🟡/🔴 [diff] | 🟢/🟡/🔴 [verdict] | [avg] |
| 3 | [date] | [title] | 🟢/🟡/🔴 [diff] | 🟢/🟡/🔴 [verdict] | [avg] |

### 🗺️ Score Heatmap (last 5 sessions)

Shows scores across all 7 dimensions for recent sessions. Spot patterns at a glance.

| Dimension               | S1  | S2  | S3  | S4  | S5  | Trend |
|-------------------------|-----|-----|-----|-----|-----|-------|
| Approach Quality        | 🟩5 | 🟩4 | 🟩5 | 🟩4 | 🟩4 | →     |
| Complexity Accuracy     | 🟩5 | 🟩5 | 🟩4 | 🟩5 | 🟩5 | →     |
| Edge Case Coverage      | 🟨3 | 🟥2 | 🟨3 | 🟩4 | 🟩4 | ↑     |
| Communication & Fluency | 🟨3 | 🟨3 | 🟨3 | 🟨3 | 🟨3 | →     |
| Clarifying Questions    | 🟩4 | 🟩4 | 🟥2 | 🟨3 | 🟩4 | ↑     |
| Think Aloud             | 🟩4 | 🟨3 | 🟨3 | 🟨3 | 🟩4 | →     |
| Code Narration          | 🟩4 | 🟩4 | 🟩5 | 🟩4 | 🟩4 | →     |

**Heatmap key:** 🟩 = 4-5 (strong) | 🟨 = 3 (borderline) | 🟥 = 1-2 (weak)
**Trend:** ↑ improving | ↓ declining | → stable

### 📊 Current Difficulty Level
[🟢 Easy / 🟡 Medium / 🔴 Hard] — [reason]

### ⚠️ Active Weaknesses (recurring)
- [category] — [count] sessions, status: `recurring` / `improving`
- ...

### 🔄 Resolved (due for retest)
- [category] — resolved [N] sessions ago, due for verification

### 🎯 Focus Recommendation
[One sentence: what to prioritize in the next session based on weakness + heatmap data]
```

**Heatmap rules:**
- Show the last 5 sessions (or fewer if less data). Label columns S1 (oldest) through S5 (newest).
- For multi-round sessions, use the cumulative average per dimension.
- Color each cell: 🟩 for 4-5, 🟨 for 3, 🟥 for 1-2.
- Trend column: compare last 2 sessions. Higher → ↑, lower → ↓, same → →.
- If a dimension wasn't scored in a session (e.g., older format), show `—`.
- The heatmap makes patterns visible: "Communication always drops on Hard problems" or "Edge cases improving steadily."

3. If no weakness log exists: state "No session history yet. Start a session to begin tracking."
4. If mid-session: display the recap and resume the current phase. Do not reset state.

---

## Spaced Repetition for Resolved Weaknesses

When a weakness category reaches `resolved` status, it enters the spaced repetition cycle:

1. Record the session count at resolution (e.g., "resolved at session #5").
2. After 3 more sessions, automatically change status to `retest`.
3. When `retest` categories exist, the Interviewer SHALL:
   - Announce at session start: "It's been a few sessions since you resolved [category]. Let's verify that's still solid."
   - Prefer a problem that exercises the retest category.
   - If the Candidate scores ≥4 on the relevant dimension → mark as `resolved` again with a new session count (resets the 3-session timer).
   - If the Candidate scores ≤3 → mark as `recurring` (the fix didn't stick).
4. This cycle continues indefinitely. A weakness is never permanently dismissed.
