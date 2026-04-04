---
description: "Save session replay and update weakness log after a DSA mock interview debrief. Run this manually after your debrief is complete."
name: "Save Interview Session"
agent: "agent"
---

Check if a DSA mock interview Debrief was just completed in this conversation. Look for the presence of a scorecard with the seven scoring dimensions (Approach Quality, Time/Space Complexity Accuracy, Edge Case Coverage, Communication & Fluency, Clarifying Questions Quality, Think_Aloud_Score, Code Narration Quality) and a verdict (Hire/Borderline/No Hire).

If a Debrief WAS completed:

1. **Calculate elapsed time (if timer was used):** Check if `src/.session-timer.json` exists. If it does, read it and calculate elapsed time from `startMs` to `Date.now()`. Format as `Xm Ys` (e.g., "23m 45s"). Include as "Total Session Time: Xm Ys" in the session replay header and display it to the Candidate. Delete `src/.session-timer.json` after reading.

2. **Save session replay:** Check if a session replay file already exists in `src/session-replays/`. If not, generate and save it now following the Session Replay format defined in `.github/copilot-instructions.md` (Session Replay section). The replay MUST include the Key Exchanges section (2–3 verbatim moments from the session). Include total session time in the replay metadata. Filename format: `src/session-replays/YYYY-MM-DD-title-kebab.md` (multi-round: `YYYY-MM-DD-multi-round.md`). Max 150 lines.

3. **Update weakness log:** Check if `src/weakness-log.md` was already updated this session. If not, append entries for any dimension scored ≤3 or any communication anti-pattern detected. Follow the status progression rules (new → recurring → improving → resolved → retest) from advanced-features.md. Create the file if it doesn't exist. The log is append-only — never delete entries.

4. **Clean up:** Delete `src/current-problem.md` if it still exists.

5. **Confirm to Candidate:**
   - "Session replay saved to [path]."
   - "Total time: [Xm Ys]." (only if timer was used)
   - "Weakness log updated."

If NO Debrief was completed (the session was abandoned or this prompt was run by mistake), do nothing — do not create any files or output any message.
