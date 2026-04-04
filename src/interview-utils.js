/**
 * Validates that a problem statement contains sufficient information to run a session.
 *
 * A valid problem must have:
 * - A non-empty description (after trimming)
 * - A non-empty examples array with at least one example that has both
 *   a non-empty/non-null input and a non-empty/non-null output
 *
 * Validates: Requirements 2.8, 16.3 — Design Property 1
 *
 * @param {object} problem - The problem object to validate
 * @returns {boolean} true if the problem is valid, false otherwise
 */
function validateProblemStatement(problem) {
  if (!problem || typeof problem !== 'object') {
    return false;
  }

  // Check description is a non-empty string after trimming
  if (typeof problem.description !== 'string' || problem.description.trim() === '') {
    return false;
  }

  // Check examples is a non-empty array
  if (!Array.isArray(problem.examples) || problem.examples.length === 0) {
    return false;
  }

  // At least one example must have both non-empty/non-null input and output
  const hasValidExample = problem.examples.some((example) => {
    if (!example || typeof example !== 'object') {
      return false;
    }
    return example.input != null && example.input !== '' &&
           example.output != null && example.output !== '';
  });

  return hasValidExample;
}

/**
 * Detects weakness categories that appear in 3 or more entries in the weakness log.
 *
 * Categories appearing in fewer than 3 entries are excluded from the result.
 *
 * Validates: Requirements 18.5 — Design Property 2
 *
 * @param {Array<{category: string}>} weaknessLog - Array of weakness log entries, each with a category string
 * @returns {string[]} Array of category strings that appear in ≥3 entries
 */
function detectWeaknessCategoryThresholds(weaknessLog) {
  if (!Array.isArray(weaknessLog)) {
    return [];
  }

  const counts = {};
  for (const entry of weaknessLog) {
    if (entry && typeof entry.category === 'string') {
      counts[entry.category] = (counts[entry.category] || 0) + 1;
    }
  }

  return Object.keys(counts).filter((cat) => counts[cat] >= 3);
}

/**
 * Classifies the pace of a given interview phase based on its duration
 * relative to FAANG pacing benchmarks.
 *
 * Benchmarks:
 *   Clarification: 3–5 min
 *   Approach:      5–8 min
 *   Coding:       15–20 min
 *   Dry Run:       3–5 min
 *
 * Returns:
 *   "Over Time" if duration > 150% of upper bound
 *   "Rushed"    if duration < 50% of lower bound
 *   "On Track"  otherwise
 *
 * Unknown phase names return "On Track".
 *
 * Validates: Requirements 20.2, 20.3, 20.4 — Design Property 3
 *
 * @param {string} phaseName - One of "Clarification", "Approach", "Coding", "Dry Run"
 * @param {number} durationMinutes - Time spent in the phase (minutes)
 * @returns {"Over Time" | "Rushed" | "On Track"}
 */
function classifyPhasePace(phaseName, durationMinutes) {
  const benchmarks = {
    'Clarification': { lower: 3, upper: 5 },
    'Approach':      { lower: 5, upper: 8 },
    'Coding':        { lower: 15, upper: 20 },
    'Dry Run':       { lower: 3, upper: 5 },
  };

  const benchmark = benchmarks[phaseName];
  if (!benchmark) {
    return 'On Track';
  }

  if (durationMinutes > benchmark.upper * 1.5) {
    return 'Over Time';
  }
  if (durationMinutes < benchmark.lower * 0.5) {
    return 'Rushed';
  }
  return 'On Track';
}

/**
 * Computes the next session difficulty based on the previous verdict,
 * hint count, and current difficulty level.
 *
 * Rules:
 *   - Hire + hints ≤ 1 → escalate by one level
 *   - Hire + hints ≥ 2 → maintain current level
 *   - Borderline (any hint count) → maintain current level
 *   - No Hire (any hint count) → de-escalate by one level
 *   - hints ≥ 3 (regardless of verdict) → de-escalate (overrides maintain)
 *   - Result is clamped to [Easy, Hard]
 *
 * Validates: Requirements 21.2, 21.3, 21.4, 21.6 — Design Property 4
 *
 * @param {"Hire" | "Borderline" | "No Hire"} previousVerdict
 * @param {number} hintCount - Non-negative integer
 * @param {"Easy" | "Medium" | "Hard"} currentDifficulty
 * @returns {"Easy" | "Medium" | "Hard"}
 */
function computeNextDifficulty(previousVerdict, hintCount, currentDifficulty) {
  const levels = ['Easy', 'Medium', 'Hard'];
  const currentIndex = levels.indexOf(currentDifficulty);

  // Default to current level if unknown difficulty provided
  if (currentIndex === -1) {
    return currentDifficulty;
  }

  let direction = 0; // -1 = de-escalate, 0 = maintain, +1 = escalate

  if (previousVerdict === 'Hire') {
    direction = hintCount <= 1 ? 1 : 0;
  } else if (previousVerdict === 'No Hire') {
    direction = -1;
  }
  // Borderline → direction stays 0 (maintain)

  // Priority rule: hints ≥ 3 forces de-escalation regardless of verdict
  if (hintCount >= 3) {
    direction = -1;
  }

  const nextIndex = Math.max(0, Math.min(levels.length - 1, currentIndex + direction));
  return levels[nextIndex];
}

/**
 * Computes the edge case accuracy as the ratio of correct predictions
 * to total edge cases presented.
 *
 * Validates: Requirements 22.6 — Design Property 5
 *
 * @param {Array<{correct: boolean}>} edgeCaseResults - Array of edge case result objects
 * @returns {number} Ratio of correct predictions to total (0 for empty or non-array input)
 */
function computeEdgeCaseAccuracy(edgeCaseResults) {
  if (!Array.isArray(edgeCaseResults) || edgeCaseResults.length === 0) {
    return 0;
  }

  const correctCount = edgeCaseResults.filter(
    (r) => r && typeof r === 'object' && r.correct === true
  ).length;

  return correctCount / edgeCaseResults.length;
}

/**
 * Generates a session replay filename from a date string and problem title.
 *
 * Steps:
 * 1. Convert title to lowercase
 * 2. Replace spaces and special characters (anything not a letter or digit) with hyphens
 * 3. Collapse consecutive hyphens into a single hyphen
 * 4. Remove leading and trailing hyphens
 * 5. Return `{dateStr}-{kebab-title}.md`
 *
 * Validates: Requirements 23.2 — Design Property 6
 *
 * @param {string} dateStr - Date in YYYY-MM-DD format (e.g., "2026-04-04")
 * @param {string} problemTitle - Problem title (e.g., "Two Sum")
 * @returns {string} Filename in the format `{date}-{kebab-case-title}.md`
 */
function generateReplayFilename(dateStr, problemTitle) {
  const kebab = problemTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${dateStr}-${kebab}.md`;
}

export { validateProblemStatement, detectWeaknessCategoryThresholds, classifyPhasePace, computeNextDifficulty, computeEdgeCaseAccuracy, generateReplayFilename };
