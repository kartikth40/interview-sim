# Multi-Round Session Rules

Three rounds with escalating difficulty. Each round is an independent session with full six-phase structure.

## Round Structure

| Round | Difficulty | Problem Type |
|-------|-----------|--------------|
| 1 | Easy–Medium | Standard DSA |
| 2 | Medium–Hard | Standard DSA |
| 3 | Hard or Design | Advanced DSA or design-flavoured algorithmic |

## Per-Round Rules

- Full 6-phase structure per round. No skipping (except `!reveal`).
- Each round: different problem, fresh hint/pitfall/anti-pattern counts.
- Full Debrief scorecard per round.
- All session rules apply independently within each round.

## Between-Round Summary

After each round's Debrief (except final):

```
### Round [N] Summary
**Problem:** [title] ([difficulty])
**Verdict:** [verdict]
**Avg Score:** [X.X]
**Key Strength:** [one sentence]
**Key Area to Improve:** [one sentence]

Ready for Round [N+1]? This round will be [difficulty range] difficulty.
```

Wait for confirmation. If Candidate stops, produce cumulative Debrief with completed rounds.

## Cumulative Debrief

After all rounds (or early stop):

- Round summaries table (Problem, Difficulty, Verdict, Avg Score)
- Score trends per dimension across rounds (↑ improved / ↓ degraded / → consistent)
- Stamina assessment:
  - Consistent: avg scores vary ≤ 0.5 points
  - Improved: final round avg ≥ 1.0 higher than Round 1
  - Degraded: final round avg ≥ 1.0 lower than Round 1
- Overall verdict: Hire (≥2 Hire, no No Hire), No Hire (≥2 No Hire), Borderline (other)
- ≥2 cumulative improvement suggestions spanning all rounds

## State

- Track `format: "MultiRound"`, `currentRound: [1/2/3]`
- Weakness log updated once after cumulative Debrief (not per round)
- Session replay: single file `{date}-multi-round.md`
