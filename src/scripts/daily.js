#!/usr/bin/env node

/**
 * Daily problem suggestion based on weakness data and past sessions.
 * Reads the weakness log and session replays to suggest what to practice today.
 *
 * Usage: node src/scripts/daily.js [--new] [--topic TOPIC]
 *   --new    Suggest an entirely new problem (not from past sessions)
 *   --topic  Force a specific topic
 *
 * @module scripts/daily
 */

import { readFileSync, readdirSync, existsSync } from 'fs';

const REPLAYS_DIR = 'src/session-replays';
const WEAKNESS_LOG = 'src/weakness-log.md';
const PROBLEM_BANK = 'src/scripts/problem-bank.json';

/**
 * Curated problem bank organized by topic and difficulty.
 * Add your own problems here over time.
 */
const DEFAULT_PROBLEMS = {
  'Arrays': {
    Easy: ['Two Sum', 'Best Time to Buy and Sell Stock', 'Contains Duplicate', 'Maximum Subarray'],
    Medium: ['3Sum', 'Product of Array Except Self', 'Container With Most Water', 'Subarray Sum Equals K'],
    Hard: ['Trapping Rain Water', 'Sliding Window Maximum', 'First Missing Positive', 'Median of Two Sorted Arrays'],
  },
  'Trees': {
    Easy: ['Maximum Depth of Binary Tree', 'Invert Binary Tree', 'Same Tree', 'Symmetric Tree'],
    Medium: ['Binary Tree Level Order Traversal', 'Validate BST', 'Lowest Common Ancestor', 'Path Sum III'],
    Hard: ['Binary Tree Maximum Path Sum', 'Serialize and Deserialize Binary Tree', 'Recover BST'],
  },
  'DP': {
    Easy: ['Climbing Stairs', 'House Robber', 'Maximum Subarray'],
    Medium: ['Longest Increasing Subsequence', 'Coin Change', 'Word Break', 'Unique Paths'],
    Hard: ['Edit Distance', 'Regular Expression Matching', 'Burst Balloons', 'Longest Valid Parentheses'],
  },
  'Graphs': {
    Easy: ['Flood Fill', 'Find if Path Exists'],
    Medium: ['Number of Islands', 'Course Schedule', 'Clone Graph', 'Pacific Atlantic Water Flow'],
    Hard: ['Word Ladder', 'Alien Dictionary', 'Critical Connections', 'Shortest Path in Grid'],
  },
  'Strings': {
    Easy: ['Valid Anagram', 'Valid Palindrome', 'Longest Common Prefix'],
    Medium: ['Longest Substring Without Repeating Characters', 'Group Anagrams', 'Longest Palindromic Substring'],
    Hard: ['Minimum Window Substring', 'Palindrome Pairs', 'Wildcard Matching'],
  },
  'Linked Lists': {
    Easy: ['Reverse Linked List', 'Merge Two Sorted Lists', 'Linked List Cycle'],
    Medium: ['Add Two Numbers', 'Remove Nth Node From End', 'Reorder List', 'Copy List with Random Pointer'],
    Hard: ['Merge K Sorted Lists', 'Reverse Nodes in K-Group'],
  },
  'Backtracking': {
    Easy: ['Binary Watch'],
    Medium: ['Permutations', 'Subsets', 'Combination Sum', 'Letter Combinations of Phone Number'],
    Hard: ['N-Queens', 'Sudoku Solver', 'Word Search II'],
  },
  'Heap': {
    Easy: ['Last Stone Weight', 'Kth Largest Element in a Stream'],
    Medium: ['Top K Frequent Elements', 'Kth Largest Element in Array', 'Task Scheduler'],
    Hard: ['Find Median from Data Stream', 'Merge K Sorted Lists', 'Course Schedule III'],
  },
};

/**
 * Extract past problem titles from session replays.
 * @returns {Set<string>} Set of problem titles already solved
 */
function getPastProblems() {
  const solved = new Set();
  if (!existsSync(REPLAYS_DIR)) return solved;

  const files = readdirSync(REPLAYS_DIR).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const content = readFileSync(`${REPLAYS_DIR}/${file}`, 'utf8');
    const roundRegex = /## Round \d+ — (.+?) \(/g;
    let match;
    while ((match = roundRegex.exec(content)) !== null) {
      solved.add(match[1].trim());
    }
    // Single session title
    const titleMatch = content.match(/# Session Replay[:\s—]+(.+)/);
    if (titleMatch) solved.add(titleMatch[1].trim());
  }
  return solved;
}

/**
 * Parse weakness log to find weak topics.
 * @returns {{topic: string, count: number}[]} Sorted by count descending
 */
function getWeakTopics() {
  if (!existsSync(WEAKNESS_LOG)) return [];

  const content = readFileSync(WEAKNESS_LOG, 'utf8');
  const topicCounts = {};

  // Map weakness categories to topics
  const topicKeywords = {
    'Arrays': ['array', 'subarray', 'sliding window', 'two pointer'],
    'Trees': ['tree', 'bst', 'binary tree', 'traversal', 'path'],
    'DP': ['dp', 'dynamic programming', 'state transition', 'memoization'],
    'Graphs': ['graph', 'bfs', 'dfs', 'traversal', 'cycle'],
    'Strings': ['string', 'substring', 'palindrome', 'anagram'],
    'Linked Lists': ['linked list', 'pointer', 'node'],
    'Backtracking': ['backtracking', 'permutation', 'combination', 'subset'],
    'Heap': ['heap', 'priority queue', 'top k', 'schedule'],
  };

  const catRegex = /\*\*Category:\*\*\s*(.+)/g;
  let match;
  while ((match = catRegex.exec(content)) !== null) {
    const cat = match[1].toLowerCase();
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((kw) => cat.includes(kw))) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }
  }

  return Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get current difficulty level from past sessions.
 * @returns {string} Easy, Medium, or Hard
 */
function getCurrentDifficulty() {
  if (!existsSync(REPLAYS_DIR)) return 'Medium';

  const files = readdirSync(REPLAYS_DIR).filter((f) => f.endsWith('.md')).sort().reverse();
  if (files.length === 0) return 'Medium';

  const latest = readFileSync(`${REPLAYS_DIR}/${files[0]}`, 'utf8');
  const verdictMatch = latest.match(/\*\*(?:Overall )?Verdict:\*\*\s*(.+)/);
  if (!verdictMatch) return 'Medium';

  const verdict = verdictMatch[1].toLowerCase();
  if (verdict.includes('hire') && !verdict.includes('no')) return 'Hard';
  if (verdict.includes('borderline')) return 'Medium';
  return 'Easy';
}

/**
 * Pick a random element from an array.
 * @param {Array} arr
 * @returns {*}
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Load problem bank (custom or default).
 * @returns {object}
 */
function loadProblemBank() {
  if (existsSync(PROBLEM_BANK)) {
    try {
      return JSON.parse(readFileSync(PROBLEM_BANK, 'utf8'));
    } catch {
      // Fall through to default
    }
  }
  return DEFAULT_PROBLEMS;
}

/**
 * Main: suggest today's problem.
 */
function suggestDaily(forceNew, forceTopic) {
  const problems = loadProblemBank();
  const pastProblems = getPastProblems();
  const weakTopics = getWeakTopics();
  const difficulty = getCurrentDifficulty();

  // Pick topic
  let topic;
  if (forceTopic) {
    topic = Object.keys(problems).find((t) => t.toLowerCase() === forceTopic.toLowerCase());
    if (!topic) {
      console.log(`\n❌ Unknown topic: ${forceTopic}`);
      console.log(`   Available: ${Object.keys(problems).join(', ')}\n`);
      process.exit(1);
    }
  } else if (weakTopics.length > 0) {
    // Weighted random: prefer weaker topics
    const weights = weakTopics.map((w) => w.count);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < weakTopics.length; i++) {
      rand -= weights[i];
      if (rand <= 0) {
        topic = weakTopics[i].topic;
        break;
      }
    }
    topic = topic || pickRandom(Object.keys(problems));
  } else {
    topic = pickRandom(Object.keys(problems));
  }

  const topicProblems = problems[topic];
  if (!topicProblems) {
    console.log(`\n❌ No problems found for topic: ${topic}\n`);
    process.exit(1);
  }

  // Get candidates at the right difficulty
  let candidates = topicProblems[difficulty] || topicProblems['Medium'] || [];

  if (forceNew) {
    candidates = candidates.filter((p) => !pastProblems.has(p));
  }

  // Fallback: try other difficulties
  if (candidates.length === 0) {
    for (const diff of ['Medium', 'Easy', 'Hard']) {
      candidates = (topicProblems[diff] || []).filter((p) => !forceNew || !pastProblems.has(p));
      if (candidates.length > 0) break;
    }
  }

  if (candidates.length === 0) {
    console.log(`\n⚠️  No unsolved problems left for ${topic}. Add more to the problem bank!`);
    console.log(`   File: ${PROBLEM_BANK}\n`);
    process.exit(0);
  }

  const problem = pickRandom(candidates);
  const isRepeat = pastProblems.has(problem);
  const weakReason = weakTopics.find((w) => w.topic === topic);

  // Display
  console.log('');
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│          🎯 Today\'s Practice Problem         │');
  console.log('├─────────────────────────────────────────────┤');
  console.log(`│  Problem:    ${problem.padEnd(30)} │`);
  console.log(`│  Topic:      ${topic.padEnd(30)} │`);
  console.log(`│  Difficulty:  ${difficulty === 'Hard' ? '🔴' : difficulty === 'Medium' ? '🟡' : '🟢'} ${difficulty.padEnd(28)} │`);
  console.log(`│  Type:       ${isRepeat ? '🔄 Revisit' : '✨ New'.padEnd(30)}${isRepeat ? ''.padEnd(20) : ''.padEnd(0)} │`);
  console.log('├─────────────────────────────────────────────┤');

  if (weakReason) {
    console.log(`│  📊 Why: "${topic}" appeared in ${weakReason.count}       │`);
    console.log(`│     weakness log entries. Time to work on it. │`);
  } else {
    console.log('│  📊 Why: Random pick — no specific weakness   │');
    console.log('│     detected for this topic.                  │');
  }

  console.log('├─────────────────────────────────────────────┤');
  console.log('│                                             │');
  console.log('│  Start a session with the hook, or paste    │');
  console.log('│  this problem in Candidate Problem Mode.    │');
  console.log('│                                             │');
  console.log('└─────────────────────────────────────────────┘');
  console.log('');
}

// CLI
const args = process.argv.slice(2);
let forceNew = false;
let forceTopic = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--new') {
    forceNew = true;
  } else if (args[i] === '--topic' && args[i + 1]) {
    forceTopic = args[i + 1];
    i++;
  }
}

suggestDaily(forceNew, forceTopic);
