import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateProblemStatement, detectWeaknessCategoryThresholds, classifyPhasePace, computeNextDifficulty, computeEdgeCaseAccuracy, generateReplayFilename } from './interview-utils.js';

describe('validateProblemStatement', () => {
  // --- Unit Tests ---

  it('returns true for a valid problem with description and one valid example', () => {
    const problem = {
      description: 'Find the sum of two numbers',
      examples: [{ input: '[1, 2]', output: '3' }],
    };
    expect(validateProblemStatement(problem)).toBe(true);
  });

  it('returns true for a valid problem with multiple examples', () => {
    const problem = {
      description: 'Two Sum',
      examples: [
        { input: '[2,7,11,15], target=9', output: '[0,1]' },
        { input: '[3,2,4], target=6', output: '[1,2]' },
      ],
    };
    expect(validateProblemStatement(problem)).toBe(true);
  });

  it('returns false for null input', () => {
    expect(validateProblemStatement(null)).toBe(false);
  });

  it('returns false for undefined input', () => {
    expect(validateProblemStatement(undefined)).toBe(false);
  });

  it('returns false for a non-object input', () => {
    expect(validateProblemStatement('string')).toBe(false);
    expect(validateProblemStatement(42)).toBe(false);
  });

  it('returns false when description is missing', () => {
    const problem = {
      examples: [{ input: '[1]', output: '1' }],
    };
    expect(validateProblemStatement(problem)).toBe(false);
  });

  it('returns false when description is empty string', () => {
    const problem = {
      description: '',
      examples: [{ input: '[1]', output: '1' }],
    };
    expect(validateProblemStatement(problem)).toBe(false);
  });

  it('returns false when description is whitespace only', () => {
    const problem = {
      description: '   \t\n  ',
      examples: [{ input: '[1]', output: '1' }],
    };
    expect(validateProblemStatement(problem)).toBe(false);
  });

  it('returns false when examples is missing', () => {
    const problem = {
      description: 'Find the sum',
    };
    expect(validateProblemStatement(problem)).toBe(false);
  });

  it('returns false when examples is an empty array', () => {
    const problem = {
      description: 'Find the sum',
      examples: [],
    };
    expect(validateProblemStatement(problem)).toBe(false);
  });

  it('returns false when examples is not an array', () => {
    const problem = {
      description: 'Find the sum',
      examples: 'not an array',
    };
    expect(validateProblemStatement(problem)).toBe(false);
  });

  it('returns false when all examples have null input', () => {
    const problem = {
      description: 'Find the sum',
      examples: [{ input: null, output: '3' }],
    };
    expect(validateProblemStatement(problem)).toBe(false);
  });

  it('returns false when all examples have null output', () => {
    const problem = {
      description: 'Find the sum',
      examples: [{ input: '[1,2]', output: null }],
    };
    expect(validateProblemStatement(problem)).toBe(false);
  });

  it('returns false when all examples have empty string input', () => {
    const problem = {
      description: 'Find the sum',
      examples: [{ input: '', output: '3' }],
    };
    expect(validateProblemStatement(problem)).toBe(false);
  });

  it('returns false when all examples have empty string output', () => {
    const problem = {
      description: 'Find the sum',
      examples: [{ input: '[1,2]', output: '' }],
    };
    expect(validateProblemStatement(problem)).toBe(false);
  });

  it('returns true when at least one example is valid among invalid ones', () => {
    const problem = {
      description: 'Find the sum',
      examples: [
        { input: null, output: '3' },
        { input: '[1,2]', output: '3' },
      ],
    };
    expect(validateProblemStatement(problem)).toBe(true);
  });

  it('returns true when input/output are numeric values (non-empty, non-null)', () => {
    const problem = {
      description: 'Return the number',
      examples: [{ input: 0, output: 0 }],
    };
    expect(validateProblemStatement(problem)).toBe(true);
  });

  it('returns false when example is null', () => {
    const problem = {
      description: 'Find the sum',
      examples: [null],
    };
    expect(validateProblemStatement(problem)).toBe(false);
  });

  // --- Property-Based Tests ---
  // Feature: dsa-mock-interviewer, Property 1: Problem Statement Validation
  // **Validates: Requirements 2.8, 16.3**

  describe('Property 1: Problem Statement Validation', () => {
    // Arbitrary for non-empty trimmed strings
    const nonEmptyTrimmedString = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    // Arbitrary for non-null, non-empty values (strings or numbers)
    const nonEmptyValue = fc.oneof(
      fc.string({ minLength: 1 }),
      fc.integer(),
      fc.boolean(),
      fc.constant(true),
    );

    it('accepts any problem with a non-empty description and at least one valid example', () => {
      fc.assert(
        fc.property(
          nonEmptyTrimmedString,
          fc.array(
            fc.record({
              input: nonEmptyValue,
              output: nonEmptyValue,
            }),
            { minLength: 1 },
          ),
          (description, examples) => {
            const problem = { description, examples };
            expect(validateProblemStatement(problem)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects any problem with an empty or whitespace-only description', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', ' ', '\t', '\n', '  \t\n  '),
          fc.array(
            fc.record({ input: nonEmptyValue, output: nonEmptyValue }),
            { minLength: 1 },
          ),
          (description, examples) => {
            const problem = { description, examples };
            expect(validateProblemStatement(problem)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('rejects any problem with an empty examples array', () => {
      fc.assert(
        fc.property(nonEmptyTrimmedString, (description) => {
          const problem = { description, examples: [] };
          expect(validateProblemStatement(problem)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it('rejects any problem where all examples have null or empty input/output', () => {
      fc.assert(
        fc.property(
          nonEmptyTrimmedString,
          fc.array(
            fc.record({
              input: fc.constantFrom(null, ''),
              output: fc.constantFrom(null, ''),
            }),
            { minLength: 1 },
          ),
          (description, examples) => {
            const problem = { description, examples };
            expect(validateProblemStatement(problem)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

describe('detectWeaknessCategoryThresholds', () => {
  // --- Unit Tests ---

  it('returns empty array for empty weakness log', () => {
    expect(detectWeaknessCategoryThresholds([])).toEqual([]);
  });

  it('returns empty array when no category reaches threshold', () => {
    const log = [
      { category: 'Graph Traversal Edge Cases' },
      { category: 'Graph Traversal Edge Cases' },
      { category: 'DP State Transitions' },
    ];
    expect(detectWeaknessCategoryThresholds(log)).toEqual([]);
  });

  it('returns category that appears exactly 3 times', () => {
    const log = [
      { category: 'Graph Traversal Edge Cases' },
      { category: 'Graph Traversal Edge Cases' },
      { category: 'Graph Traversal Edge Cases' },
    ];
    expect(detectWeaknessCategoryThresholds(log)).toEqual(['Graph Traversal Edge Cases']);
  });

  it('returns category that appears more than 3 times', () => {
    const log = [
      { category: 'Think Aloud Under Pressure' },
      { category: 'Think Aloud Under Pressure' },
      { category: 'Think Aloud Under Pressure' },
      { category: 'Think Aloud Under Pressure' },
    ];
    expect(detectWeaknessCategoryThresholds(log)).toEqual(['Think Aloud Under Pressure']);
  });

  it('returns multiple categories that meet threshold', () => {
    const log = [
      { category: 'A' }, { category: 'A' }, { category: 'A' },
      { category: 'B' }, { category: 'B' }, { category: 'B' },
      { category: 'C' }, { category: 'C' },
    ];
    const result = detectWeaknessCategoryThresholds(log);
    expect(result).toContain('A');
    expect(result).toContain('B');
    expect(result).not.toContain('C');
    expect(result).toHaveLength(2);
  });

  it('returns empty array for non-array input', () => {
    expect(detectWeaknessCategoryThresholds(null)).toEqual([]);
    expect(detectWeaknessCategoryThresholds(undefined)).toEqual([]);
    expect(detectWeaknessCategoryThresholds('string')).toEqual([]);
  });

  it('skips entries with missing or non-string category', () => {
    const log = [
      { category: 'A' }, { category: 'A' }, { category: 'A' },
      null,
      { category: 123 },
      {},
    ];
    expect(detectWeaknessCategoryThresholds(log)).toEqual(['A']);
  });

  // --- Property-Based Tests ---
  // Feature: dsa-mock-interviewer, Property 2: Weakness Category Threshold Detection
  // **Validates: Requirements 18.5**

  describe('Property 2: Weakness Category Threshold Detection', () => {
    const categoryArb = fc.stringMatching(/^[A-Za-z ]{1,30}$/);

    it('every returned category appears in ≥3 entries', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ category: categoryArb }), { minLength: 0, maxLength: 50 }),
          (log) => {
            const result = detectWeaknessCategoryThresholds(log);
            const counts = {};
            for (const entry of log) {
              counts[entry.category] = (counts[entry.category] || 0) + 1;
            }
            for (const cat of result) {
              expect(counts[cat]).toBeGreaterThanOrEqual(3);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('every category with ≥3 entries is included in the result', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ category: categoryArb }), { minLength: 0, maxLength: 50 }),
          (log) => {
            const result = detectWeaknessCategoryThresholds(log);
            const counts = {};
            for (const entry of log) {
              counts[entry.category] = (counts[entry.category] || 0) + 1;
            }
            for (const [cat, count] of Object.entries(counts)) {
              if (count >= 3) {
                expect(result).toContain(cat);
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('no category with <3 entries is included in the result', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ category: categoryArb }), { minLength: 0, maxLength: 50 }),
          (log) => {
            const result = detectWeaknessCategoryThresholds(log);
            const counts = {};
            for (const entry of log) {
              counts[entry.category] = (counts[entry.category] || 0) + 1;
            }
            for (const cat of result) {
              expect(counts[cat]).toBeGreaterThanOrEqual(3);
            }
            // Also verify no below-threshold categories snuck in
            for (const [cat, count] of Object.entries(counts)) {
              if (count < 3) {
                expect(result).not.toContain(cat);
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('returns empty array when all categories appear fewer than 3 times', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ category: categoryArb }), { minLength: 0, maxLength: 50 }).filter((log) => {
            const counts = {};
            for (const entry of log) {
              counts[entry.category] = (counts[entry.category] || 0) + 1;
            }
            return Object.values(counts).every((c) => c < 3);
          }),
          (log) => {
            expect(detectWeaknessCategoryThresholds(log)).toEqual([]);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

describe('classifyPhasePace', () => {
  // --- Unit Tests ---

  it('returns "Over Time" when Clarification duration exceeds 150% of upper bound (> 7.5)', () => {
    expect(classifyPhasePace('Clarification', 8)).toBe('Over Time');
  });

  it('returns "Rushed" when Clarification duration is below 50% of lower bound (< 1.5)', () => {
    expect(classifyPhasePace('Clarification', 1)).toBe('Rushed');
  });

  it('returns "On Track" when Clarification duration is within range', () => {
    expect(classifyPhasePace('Clarification', 4)).toBe('On Track');
  });

  it('returns "Over Time" for Approach when duration > 12', () => {
    expect(classifyPhasePace('Approach', 13)).toBe('Over Time');
  });

  it('returns "Rushed" for Approach when duration < 2.5', () => {
    expect(classifyPhasePace('Approach', 2)).toBe('Rushed');
  });

  it('returns "On Track" for Approach when duration is within range', () => {
    expect(classifyPhasePace('Approach', 6)).toBe('On Track');
  });

  it('returns "Over Time" for Coding when duration > 30', () => {
    expect(classifyPhasePace('Coding', 31)).toBe('Over Time');
  });

  it('returns "Rushed" for Coding when duration < 7.5', () => {
    expect(classifyPhasePace('Coding', 7)).toBe('Rushed');
  });

  it('returns "On Track" for Coding when duration is within range', () => {
    expect(classifyPhasePace('Coding', 18)).toBe('On Track');
  });

  it('returns "Over Time" for Dry Run when duration > 7.5', () => {
    expect(classifyPhasePace('Dry Run', 8)).toBe('Over Time');
  });

  it('returns "Rushed" for Dry Run when duration < 1.5', () => {
    expect(classifyPhasePace('Dry Run', 1)).toBe('Rushed');
  });

  it('returns "On Track" for Dry Run when duration is within range', () => {
    expect(classifyPhasePace('Dry Run', 4)).toBe('On Track');
  });

  it('returns "On Track" for exact boundary: duration equals 150% of upper bound', () => {
    // Clarification upper = 5, 150% = 7.5 — exactly 7.5 is NOT over time
    expect(classifyPhasePace('Clarification', 7.5)).toBe('On Track');
  });

  it('returns "On Track" for exact boundary: duration equals 50% of lower bound', () => {
    // Clarification lower = 3, 50% = 1.5 — exactly 1.5 is NOT rushed
    expect(classifyPhasePace('Clarification', 1.5)).toBe('On Track');
  });

  it('returns "On Track" for unknown phase name', () => {
    expect(classifyPhasePace('Unknown Phase', 10)).toBe('On Track');
  });

  it('returns "On Track" for empty string phase name', () => {
    expect(classifyPhasePace('', 5)).toBe('On Track');
  });

  // --- Property-Based Tests ---
  // Feature: dsa-mock-interviewer, Property 3: Pace Report Phase Classification
  // **Validates: Requirements 20.2, 20.3, 20.4**

  describe('Property 3: Pace Report Phase Classification', () => {
    const phases = [
      { name: 'Clarification', lower: 3, upper: 5 },
      { name: 'Approach', lower: 5, upper: 8 },
      { name: 'Coding', lower: 15, upper: 20 },
      { name: 'Dry Run', lower: 3, upper: 5 },
    ];

    const phaseArb = fc.constantFrom(...phases);

    it('returns "Over Time" for any duration strictly above 150% of upper bound', () => {
      fc.assert(
        fc.property(
          phaseArb,
          fc.double({ min: 0.001, max: 1000, noNaN: true }),
          (phase, extra) => {
            const threshold = phase.upper * 1.5;
            const duration = threshold + Math.abs(extra) + 0.001;
            expect(classifyPhasePace(phase.name, duration)).toBe('Over Time');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('returns "Rushed" for any duration strictly below 50% of lower bound', () => {
      fc.assert(
        fc.property(
          phaseArb,
          fc.double({ min: 0, max: 0.99999, noNaN: true }),
          (phase, fraction) => {
            const threshold = phase.lower * 0.5;
            const duration = threshold * fraction;
            // duration is in [0, threshold) — strictly below threshold
            expect(classifyPhasePace(phase.name, duration)).toBe('Rushed');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('returns "On Track" for any duration in [50% lower, 150% upper]', () => {
      fc.assert(
        fc.property(
          phaseArb,
          fc.double({ min: 0, max: 1, noNaN: true }),
          (phase, t) => {
            const low = phase.lower * 0.5;
            const high = phase.upper * 1.5;
            const duration = low + t * (high - low);
            expect(classifyPhasePace(phase.name, duration)).toBe('On Track');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('returns "On Track" for unknown phase names regardless of duration', () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => !['Clarification', 'Approach', 'Coding', 'Dry Run'].includes(s)),
          fc.double({ min: -1000, max: 1000, noNaN: true }),
          (phaseName, duration) => {
            expect(classifyPhasePace(phaseName, duration)).toBe('On Track');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('result is always one of the three valid classifications', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Clarification', 'Approach', 'Coding', 'Dry Run', 'Unknown', ''),
          fc.double({ min: -100, max: 200, noNaN: true }),
          (phaseName, duration) => {
            const result = classifyPhasePace(phaseName, duration);
            expect(['Over Time', 'Rushed', 'On Track']).toContain(result);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

describe('computeNextDifficulty', () => {
  // --- Unit Tests ---

  // Hire + hints ≤ 1 → escalate
  it('escalates from Easy to Medium on Hire with 0 hints', () => {
    expect(computeNextDifficulty('Hire', 0, 'Easy')).toBe('Medium');
  });

  it('escalates from Medium to Hard on Hire with 1 hint', () => {
    expect(computeNextDifficulty('Hire', 1, 'Medium')).toBe('Hard');
  });

  it('clamps at Hard when escalating from Hard on Hire with 0 hints', () => {
    expect(computeNextDifficulty('Hire', 0, 'Hard')).toBe('Hard');
  });

  // Hire + hints ≥ 2 → maintain
  it('maintains Medium on Hire with 2 hints', () => {
    expect(computeNextDifficulty('Hire', 2, 'Medium')).toBe('Medium');
  });

  it('maintains Hard on Hire with 2 hints', () => {
    expect(computeNextDifficulty('Hire', 2, 'Hard')).toBe('Hard');
  });

  // Borderline → maintain
  it('maintains Easy on Borderline with 0 hints', () => {
    expect(computeNextDifficulty('Borderline', 0, 'Easy')).toBe('Easy');
  });

  it('maintains Medium on Borderline with 2 hints', () => {
    expect(computeNextDifficulty('Borderline', 2, 'Medium')).toBe('Medium');
  });

  it('maintains Hard on Borderline with 1 hint', () => {
    expect(computeNextDifficulty('Borderline', 1, 'Hard')).toBe('Hard');
  });

  // No Hire → de-escalate
  it('de-escalates from Hard to Medium on No Hire', () => {
    expect(computeNextDifficulty('No Hire', 0, 'Hard')).toBe('Medium');
  });

  it('de-escalates from Medium to Easy on No Hire', () => {
    expect(computeNextDifficulty('No Hire', 1, 'Medium')).toBe('Easy');
  });

  it('clamps at Easy when de-escalating from Easy on No Hire', () => {
    expect(computeNextDifficulty('No Hire', 0, 'Easy')).toBe('Easy');
  });

  // hints ≥ 3 → de-escalate (overrides Borderline maintain)
  it('de-escalates from Medium to Easy on Borderline with 3 hints (priority rule)', () => {
    expect(computeNextDifficulty('Borderline', 3, 'Medium')).toBe('Easy');
  });

  it('de-escalates from Hard to Medium on Borderline with 4 hints', () => {
    expect(computeNextDifficulty('Borderline', 4, 'Hard')).toBe('Medium');
  });

  // hints ≥ 3 overrides Hire+maintain too
  it('de-escalates from Hard to Medium on Hire with 3 hints', () => {
    expect(computeNextDifficulty('Hire', 3, 'Hard')).toBe('Medium');
  });

  it('clamps at Easy on Borderline with 5 hints from Easy', () => {
    expect(computeNextDifficulty('Borderline', 5, 'Easy')).toBe('Easy');
  });

  // --- Property-Based Tests ---
  // Feature: dsa-mock-interviewer, Property 4: Difficulty Progression Computation
  // **Validates: Requirements 21.2, 21.3, 21.4, 21.6**

  describe('Property 4: Difficulty Progression Computation', () => {
    const verdictArb = fc.constantFrom('Hire', 'Borderline', 'No Hire');
    const hintCountArb = fc.nat({ max: 20 });
    const difficultyArb = fc.constantFrom('Easy', 'Medium', 'Hard');
    const levels = ['Easy', 'Medium', 'Hard'];

    it('result is always one of Easy, Medium, Hard', () => {
      fc.assert(
        fc.property(verdictArb, hintCountArb, difficultyArb, (verdict, hints, diff) => {
          const result = computeNextDifficulty(verdict, hints, diff);
          expect(levels).toContain(result);
        }),
        { numRuns: 100 },
      );
    });

    it('Hire with hints ≤ 1 escalates or clamps at Hard', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(0, 1),
          difficultyArb,
          (hints, diff) => {
            const result = computeNextDifficulty('Hire', hints, diff);
            const currentIdx = levels.indexOf(diff);
            const expectedIdx = Math.min(currentIdx + 1, 2);
            expect(result).toBe(levels[expectedIdx]);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Hire with hints = 2 maintains current level', () => {
      fc.assert(
        fc.property(difficultyArb, (diff) => {
          const result = computeNextDifficulty('Hire', 2, diff);
          expect(result).toBe(diff);
        }),
        { numRuns: 100 },
      );
    });

    it('Borderline with hints < 3 maintains current level', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 2 }),
          difficultyArb,
          (hints, diff) => {
            const result = computeNextDifficulty('Borderline', hints, diff);
            expect(result).toBe(diff);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('No Hire de-escalates or clamps at Easy', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 2 }),
          difficultyArb,
          (hints, diff) => {
            const result = computeNextDifficulty('No Hire', hints, diff);
            const currentIdx = levels.indexOf(diff);
            const expectedIdx = Math.max(currentIdx - 1, 0);
            expect(result).toBe(levels[expectedIdx]);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('hints ≥ 3 always de-escalates or clamps at Easy regardless of verdict', () => {
      fc.assert(
        fc.property(
          verdictArb,
          fc.integer({ min: 3, max: 20 }),
          difficultyArb,
          (verdict, hints, diff) => {
            const result = computeNextDifficulty(verdict, hints, diff);
            const currentIdx = levels.indexOf(diff);
            const expectedIdx = Math.max(currentIdx - 1, 0);
            expect(result).toBe(levels[expectedIdx]);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('result never goes below Easy or above Hard (clamping)', () => {
      fc.assert(
        fc.property(verdictArb, hintCountArb, difficultyArb, (verdict, hints, diff) => {
          const result = computeNextDifficulty(verdict, hints, diff);
          const idx = levels.indexOf(result);
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(idx).toBeLessThanOrEqual(2);
        }),
        { numRuns: 100 },
      );
    });
  });
});

describe('computeEdgeCaseAccuracy', () => {
  // --- Unit Tests ---

  it('returns 0 for an empty array', () => {
    expect(computeEdgeCaseAccuracy([])).toBe(0);
  });

  it('returns 0 for non-array input (null)', () => {
    expect(computeEdgeCaseAccuracy(null)).toBe(0);
  });

  it('returns 0 for non-array input (undefined)', () => {
    expect(computeEdgeCaseAccuracy(undefined)).toBe(0);
  });

  it('returns 0 for non-array input (string)', () => {
    expect(computeEdgeCaseAccuracy('not an array')).toBe(0);
  });

  it('returns 0 for non-array input (number)', () => {
    expect(computeEdgeCaseAccuracy(42)).toBe(0);
  });

  it('returns 1 when all results are correct', () => {
    const results = [{ correct: true }, { correct: true }, { correct: true }];
    expect(computeEdgeCaseAccuracy(results)).toBe(1);
  });

  it('returns 0 when no results are correct', () => {
    const results = [{ correct: false }, { correct: false }];
    expect(computeEdgeCaseAccuracy(results)).toBe(0);
  });

  it('returns correct ratio for mixed results', () => {
    const results = [
      { correct: true },
      { correct: false },
      { correct: true },
      { correct: false },
    ];
    expect(computeEdgeCaseAccuracy(results)).toBe(0.5);
  });

  it('returns correct ratio for 1 out of 3', () => {
    const results = [{ correct: false }, { correct: true }, { correct: false }];
    expect(computeEdgeCaseAccuracy(results)).toBeCloseTo(1 / 3);
  });

  it('returns 1 for a single correct result', () => {
    expect(computeEdgeCaseAccuracy([{ correct: true }])).toBe(1);
  });

  it('returns 0 for a single incorrect result', () => {
    expect(computeEdgeCaseAccuracy([{ correct: false }])).toBe(0);
  });

  it('treats null entries as incorrect', () => {
    const results = [{ correct: true }, null, { correct: false }];
    expect(computeEdgeCaseAccuracy(results)).toBeCloseTo(1 / 3);
  });

  it('treats entries without correct property as incorrect', () => {
    const results = [{ correct: true }, {}, { correct: true }];
    expect(computeEdgeCaseAccuracy(results)).toBeCloseTo(2 / 3);
  });

  // --- Property-Based Tests ---
  // Feature: dsa-mock-interviewer, Property 5: Edge Case Accuracy Computation
  // **Validates: Requirements 22.6**

  describe('Property 5: Edge Case Accuracy Computation', () => {
    it('accuracy equals correct count divided by total count', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ correct: fc.boolean() }), { minLength: 1, maxLength: 50 }),
          (results) => {
            const accuracy = computeEdgeCaseAccuracy(results);
            const correctCount = results.filter((r) => r.correct === true).length;
            const expected = correctCount / results.length;
            expect(accuracy).toBeCloseTo(expected);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('accuracy is always between 0 and 1 inclusive', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ correct: fc.boolean() }), { minLength: 1, maxLength: 50 }),
          (results) => {
            const accuracy = computeEdgeCaseAccuracy(results);
            expect(accuracy).toBeGreaterThanOrEqual(0);
            expect(accuracy).toBeLessThanOrEqual(1);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('returns 1 when all entries are correct', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }),
          (n) => {
            const results = Array.from({ length: n }, () => ({ correct: true }));
            expect(computeEdgeCaseAccuracy(results)).toBe(1);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('returns 0 when no entries are correct', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }),
          (n) => {
            const results = Array.from({ length: n }, () => ({ correct: false }));
            expect(computeEdgeCaseAccuracy(results)).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('returns 0 for empty arrays', () => {
      expect(computeEdgeCaseAccuracy([])).toBe(0);
    });

    it('accuracy increases or stays the same when a correct entry is added', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ correct: fc.boolean() }), { minLength: 1, maxLength: 49 }),
          (results) => {
            const before = computeEdgeCaseAccuracy(results);
            const after = computeEdgeCaseAccuracy([...results, { correct: true }]);
            expect(after).toBeGreaterThanOrEqual(before - Number.EPSILON);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

describe('generateReplayFilename', () => {
  // --- Unit Tests ---

  it('converts a simple two-word title', () => {
    expect(generateReplayFilename('2026-04-04', 'Two Sum')).toBe('2026-04-04-two-sum.md');
  });

  it('converts a long multi-word title', () => {
    expect(generateReplayFilename('2026-05-12', 'Longest Substring Without Repeating Characters'))
      .toBe('2026-05-12-longest-substring-without-repeating-characters.md');
  });

  it('converts a title with uppercase abbreviation', () => {
    expect(generateReplayFilename('2026-06-01', 'LRU Cache')).toBe('2026-06-01-lru-cache.md');
  });

  it('handles special characters in title', () => {
    expect(generateReplayFilename('2026-01-01', 'Two Sum (II)')).toBe('2026-01-01-two-sum-ii.md');
  });

  it('collapses consecutive special characters into a single hyphen', () => {
    expect(generateReplayFilename('2026-01-01', 'A --- B')).toBe('2026-01-01-a-b.md');
  });

  it('removes leading and trailing special characters from title', () => {
    expect(generateReplayFilename('2026-01-01', '  Two Sum  ')).toBe('2026-01-01-two-sum.md');
  });

  it('handles title with digits', () => {
    expect(generateReplayFilename('2026-03-15', '3Sum')).toBe('2026-03-15-3sum.md');
  });

  it('handles title that is a single word', () => {
    expect(generateReplayFilename('2026-07-20', 'Permutations')).toBe('2026-07-20-permutations.md');
  });

  it('handles title with mixed special characters', () => {
    expect(generateReplayFilename('2026-02-28', 'Valid Parentheses (Stack-Based)'))
      .toBe('2026-02-28-valid-parentheses-stack-based.md');
  });

  it('handles empty title by producing date-.md', () => {
    expect(generateReplayFilename('2026-01-01', '')).toBe('2026-01-01-.md');
  });

  // --- Property-Based Tests ---
  // Feature: dsa-mock-interviewer, Property 6: Session Replay Filename Format
  // **Validates: Requirements 23.2**

  describe('Property 6: Session Replay Filename Format', () => {
    // Arbitrary for YYYY-MM-DD date strings
    const dateArb = fc.tuple(
      fc.integer({ min: 2000, max: 2099 }),
      fc.integer({ min: 1, max: 12 }),
      fc.integer({ min: 1, max: 28 }),
    ).map(([y, m, d]) =>
      `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    );

    // Arbitrary for problem titles (non-empty strings with letters, digits, spaces, and some special chars)
    const titleArb = fc.array(
      fc.constantFrom(
        ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -()&:'.split('')
      ),
      { minLength: 1, maxLength: 60 },
    ).map((chars) => chars.join(''));

    it('filename always starts with the date string', () => {
      fc.assert(
        fc.property(dateArb, titleArb, (dateStr, title) => {
          const filename = generateReplayFilename(dateStr, title);
          expect(filename.startsWith(dateStr + '-')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('filename always ends with .md', () => {
      fc.assert(
        fc.property(dateArb, titleArb, (dateStr, title) => {
          const filename = generateReplayFilename(dateStr, title);
          expect(filename.endsWith('.md')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('kebab portion contains only lowercase letters, digits, and single hyphens', () => {
      fc.assert(
        fc.property(dateArb, titleArb, (dateStr, title) => {
          const filename = generateReplayFilename(dateStr, title);
          // Extract the kebab portion between the date and .md
          const kebab = filename.slice(dateStr.length + 1, -3);
          // Should only contain lowercase letters, digits, and hyphens
          expect(kebab).toMatch(/^[a-z0-9-]*$/);
          // Should not contain consecutive hyphens
          expect(kebab).not.toMatch(/--/);
        }),
        { numRuns: 100 },
      );
    });

    it('kebab portion has no leading or trailing hyphens', () => {
      fc.assert(
        fc.property(dateArb, titleArb, (dateStr, title) => {
          const filename = generateReplayFilename(dateStr, title);
          const kebab = filename.slice(dateStr.length + 1, -3);
          if (kebab.length > 0) {
            expect(kebab[0]).not.toBe('-');
            expect(kebab[kebab.length - 1]).not.toBe('-');
          }
        }),
        { numRuns: 100 },
      );
    });

    it('filename matches the pattern {date}-{kebab}.md', () => {
      fc.assert(
        fc.property(dateArb, titleArb, (dateStr, title) => {
          const filename = generateReplayFilename(dateStr, title);
          // Full pattern: date-kebab.md where kebab is lowercase alphanumeric with hyphens
          const pattern = new RegExp(`^${dateStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-[a-z0-9]+([a-z0-9-]*[a-z0-9])?\\.md$`);
          expect(filename).toMatch(pattern);
        }),
        { numRuns: 100 },
      );
    });

    it('all alphabetic characters in the kebab portion are lowercase', () => {
      fc.assert(
        fc.property(dateArb, titleArb, (dateStr, title) => {
          const filename = generateReplayFilename(dateStr, title);
          const kebab = filename.slice(dateStr.length + 1, -3);
          expect(kebab).toBe(kebab.toLowerCase());
        }),
        { numRuns: 100 },
      );
    });
  });
});
