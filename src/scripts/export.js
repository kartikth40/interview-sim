#!/usr/bin/env node

/**
 * Export a beautiful shareable interview progress report as PDF.
 * Generates a styled PDF optimized for sharing on X/LinkedIn.
 *
 * Usage: node src/scripts/export.js [--sessions N] [--output path]
 *
 * Validates: N/A — utility script, not a correctness property
 *
 * @module scripts/export
 */

import { readFileSync, readdirSync, existsSync, createWriteStream } from 'fs';
import PDFDocument from 'pdfkit';

const REPLAYS_DIR = 'src/session-replays';
const WEAKNESS_LOG = 'src/weakness-log.md';
const DEFAULT_OUTPUT = 'src/interview-report.pdf';

// Color palette
const COLORS = {
  bg: '#FFFFFF',
  primary: '#1A1A2E',
  accent: '#4361EE',
  green: '#2ECC71',
  yellow: '#F39C12',
  red: '#E74C3C',
  gray: '#95A5A6',
  lightGray: '#ECF0F1',
  darkGray: '#7F8C8D',
  white: '#FFFFFF',
};

/**
 * Parse a session replay markdown file into structured data.
 * @param {string} content - Raw markdown content
 * @param {string} filename - Filename for date extraction
 * @returns {object} Parsed session data
 */
function parseReplay(content, filename) {
  const session = { filename, date: '', mode: '', rounds: [], verdict: '', avg: 0 };

  const dateMatch = content.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) session.date = dateMatch[1];

  const modeMatch = content.match(/\*\*Mode:\*\*\s*(\w+)/);
  if (modeMatch) session.mode = modeMatch[1];

  const roundRegex = /## Round \d+ — (.+?) \((.+?)\)[\s\S]*?\*\*Verdict:\*\*\s*(\w+)\s*\|\s*\*\*Avg:\*\*\s*([\d.]+)/g;
  let match;
  while ((match = roundRegex.exec(content)) !== null) {
    session.rounds.push({
      problem: match[1],
      difficulty: match[2],
      verdict: match[3],
      avg: parseFloat(match[4]),
    });
  }

  const verdictMatch = content.match(/\*\*Overall Verdict:\*\*\s*(.+)/);
  if (verdictMatch) {
    session.verdict = verdictMatch[1].trim();
  } else {
    const singleVerdict = content.match(/\*\*Verdict:\*\*\s*(\w+)/);
    if (singleVerdict) session.verdict = singleVerdict[1];
  }

  if (session.rounds.length > 0) {
    session.avg = session.rounds.reduce((sum, r) => sum + r.avg, 0) / session.rounds.length;
  }

  return session;
}

/**
 * Parse weakness log into structured categories.
 * @param {string} content - Raw weakness log markdown
 * @returns {Array<{category: string, count: number, status: string}>}
 */
function parseWeaknessLog(content) {
  const categories = {};
  const catRegex = /\*\*Category:\*\*\s*(.+)/g;
  let match;
  while ((match = catRegex.exec(content)) !== null) {
    const cat = match[1].trim();
    categories[cat] = (categories[cat] || 0) + 1;
  }
  return Object.entries(categories)
    .map(([category, count]) => ({
      category,
      count,
      status: count >= 3 ? 'recurring' : count >= 2 ? 'watch' : 'new',
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get verdict color.
 * @param {string} verdict
 * @returns {string} hex color
 */
function verdictColor(verdict) {
  const v = verdict.toLowerCase();
  if (v.includes('hire') && !v.includes('no')) return COLORS.green;
  if (v.includes('borderline')) return COLORS.yellow;
  return COLORS.red;
}

/**
 * Get difficulty color.
 * @param {string} diff
 * @returns {string} hex color
 */
function diffColor(diff) {
  const d = diff.toLowerCase();
  if (d.includes('hard')) return COLORS.red;
  if (d.includes('medium')) return COLORS.yellow;
  return COLORS.green;
}

/**
 * Draw a horizontal line.
 * @param {PDFDocument} doc
 * @param {number} y
 */
function drawLine(doc, y) {
  doc.strokeColor(COLORS.lightGray).lineWidth(1)
    .moveTo(50, y).lineTo(545, y).stroke();
}

/**
 * Draw a progress bar.
 * @param {PDFDocument} doc
 * @param {number} x
 * @param {number} y
 * @param {number} value - 0 to max
 * @param {number} max
 * @param {number} width
 * @param {number} height
 */
function drawProgressBar(doc, x, y, value, max, width, height) {
  const fillWidth = (value / max) * width;
  // Background
  doc.roundedRect(x, y, width, height, 3).fill(COLORS.lightGray);
  // Fill
  const color = value >= 4 ? COLORS.green : value >= 3 ? COLORS.yellow : COLORS.red;
  if (fillWidth > 0) {
    doc.roundedRect(x, y, Math.max(fillWidth, 6), height, 3).fill(color);
  }
}

/**
 * Draw a stat card.
 * @param {PDFDocument} doc
 * @param {number} x
 * @param {number} y
 * @param {string} label
 * @param {string} value
 * @param {string} color
 */
function drawStatCard(doc, x, y, label, value, color) {
  const cardW = 115;
  const cardH = 60;
  doc.roundedRect(x, y, cardW, cardH, 6).fill(COLORS.lightGray);
  doc.fontSize(10).fillColor(COLORS.darkGray).text(label, x, y + 10, { width: cardW, align: 'center' });
  doc.fontSize(18).fillColor(color).text(value, x, y + 28, { width: cardW, align: 'center' });
}

/**
 * Draw a table row.
 * @param {PDFDocument} doc
 * @param {number} y
 * @param {Array<{text: string, width: number, color?: string, align?: string}>} cols
 * @param {boolean} isHeader
 */
function drawTableRow(doc, y, cols, isHeader = false) {
  let x = 50;
  if (isHeader) {
    doc.rect(50, y - 2, 495, 18).fill(COLORS.primary);
  }
  for (const col of cols) {
    doc.fontSize(isHeader ? 9 : 8.5)
      .fillColor(isHeader ? COLORS.white : (col.color || COLORS.primary))
      .text(col.text, x + 4, y + 2, { width: col.width - 8, align: col.align || 'left' });
    x += col.width;
  }
}

/**
 * Generate the PDF report.
 * @param {number} maxSessions
 * @param {string} outputPath
 */
function generatePDF(maxSessions, outputPath) {
  if (!existsSync(REPLAYS_DIR)) {
    console.log('No session replays found. Complete a session first.');
    process.exit(0);
  }

  const files = readdirSync(REPLAYS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .reverse()
    .slice(0, maxSessions);

  if (files.length === 0) {
    console.log('No session replays found.');
    process.exit(0);
  }

  const sessions = files.map((f) => {
    const content = readFileSync(`${REPLAYS_DIR}/${f}`, 'utf8');
    return parseReplay(content, f);
  });

  let weaknesses = [];
  if (existsSync(WEAKNESS_LOG)) {
    weaknesses = parseWeaknessLog(readFileSync(WEAKNESS_LOG, 'utf8'));
  }

  const totalSessions = sessions.length;
  const hireCount = sessions.filter((s) => {
    const v = s.verdict.toLowerCase();
    return v.includes('hire') && !v.includes('no');
  }).length;
  const hireRate = totalSessions > 0 ? Math.round((hireCount / totalSessions) * 100) : 0;
  const overallAvg = totalSessions > 0
    ? (sessions.reduce((sum, s) => sum + s.avg, 0) / totalSessions)
    : 0;

  // Create PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = createWriteStream(outputPath);
  doc.pipe(stream);

  // ── Header ──
  doc.rect(0, 0, 595, 100).fill(COLORS.primary);
  doc.fontSize(24).fillColor(COLORS.white)
    .text('DSA Interview Progress Report', 50, 30, { width: 495 });
  doc.fontSize(10).fillColor(COLORS.gray)
    .text(`Generated ${new Date().toISOString().split('T')[0]}  |  ${totalSessions} session${totalSessions !== 1 ? 's' : ''} tracked`, 50, 62, { width: 495 });

  // ── Stat Cards ──
  let y = 120;
  drawStatCard(doc, 50, y, 'Sessions', `${totalSessions}`, COLORS.accent);
  drawStatCard(doc, 178, y, 'Hire Rate', `${hireRate}%`, hireRate >= 70 ? COLORS.green : hireRate >= 50 ? COLORS.yellow : COLORS.red);
  drawStatCard(doc, 306, y, 'Avg Score', `${overallAvg.toFixed(1)}/5`, overallAvg >= 4 ? COLORS.green : overallAvg >= 3 ? COLORS.yellow : COLORS.red);
  drawStatCard(doc, 434, y, 'Latest', sessions[0]?.verdict.split('(')[0].trim() || 'N/A', verdictColor(sessions[0]?.verdict || ''));

  // ── Score bar ──
  y = 195;
  doc.fontSize(9).fillColor(COLORS.darkGray).text('Overall Progress', 50, y);
  drawProgressBar(doc, 50, y + 14, overallAvg, 5, 495, 10);

  // ── Session History ──
  y = 235;
  doc.fontSize(14).fillColor(COLORS.primary).text('Session History', 50, y);
  y += 25;
  drawLine(doc, y);
  y += 8;

  const colWidths = [30, 75, 170, 80, 80, 60];
  drawTableRow(doc, y, [
    { text: '#', width: colWidths[0] },
    { text: 'Date', width: colWidths[1] },
    { text: 'Problems', width: colWidths[2] },
    { text: 'Difficulty', width: colWidths[3] },
    { text: 'Verdict', width: colWidths[4] },
    { text: 'Avg', width: colWidths[5], align: 'center' },
  ], true);
  y += 20;

  sessions.forEach((s, i) => {
    if (y > 720) { doc.addPage(); y = 50; }
    const problems = s.rounds.length > 0
      ? s.rounds.map((r) => r.problem).join(', ')
      : s.filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ').replace('.md', '');
    const diff = s.rounds.length > 0
      ? s.rounds.map((r) => r.difficulty).join(' > ')
      : '-';

    if (i % 2 === 0) {
      doc.rect(50, y - 2, 495, 18).fill('#F8F9FA');
    }

    drawTableRow(doc, y, [
      { text: `${i + 1}`, width: colWidths[0], align: 'center' },
      { text: s.date, width: colWidths[1] },
      { text: problems.length > 40 ? problems.substring(0, 37) + '...' : problems, width: colWidths[2] },
      { text: diff, width: colWidths[3], color: diffColor(diff) },
      { text: s.verdict.split('(')[0].trim(), width: colWidths[4], color: verdictColor(s.verdict) },
      { text: s.avg.toFixed(1), width: colWidths[5], align: 'center' },
    ]);
    y += 20;
  });

  // ── Problems Solved ──
  const allProblems = sessions.flatMap((s) => s.rounds.map((r) => ({
    problem: r.problem,
    difficulty: r.difficulty,
    verdict: r.verdict,
  })));

  if (allProblems.length > 0) {
    y += 15;
    if (y > 650) { doc.addPage(); y = 50; }
    doc.fontSize(14).fillColor(COLORS.primary).text('Problems Solved', 50, y);
    y += 25;
    drawLine(doc, y);
    y += 8;

    const probCols = [250, 120, 125];
    drawTableRow(doc, y, [
      { text: 'Problem', width: probCols[0] },
      { text: 'Difficulty', width: probCols[1] },
      { text: 'Result', width: probCols[2] },
    ], true);
    y += 20;

    allProblems.forEach((p, i) => {
      if (y > 720) { doc.addPage(); y = 50; }
      if (i % 2 === 0) {
        doc.rect(50, y - 2, 495, 18).fill('#F8F9FA');
      }
      drawTableRow(doc, y, [
        { text: p.problem, width: probCols[0] },
        { text: p.difficulty, width: probCols[1], color: diffColor(p.difficulty) },
        { text: p.verdict, width: probCols[2], color: verdictColor(p.verdict) },
      ]);
      y += 20;
    });
  }

  // ── Weaknesses ──
  if (weaknesses.length > 0) {
    y += 15;
    if (y > 650) { doc.addPage(); y = 50; }
    doc.fontSize(14).fillColor(COLORS.primary).text('Areas of Focus', 50, y);
    y += 25;
    drawLine(doc, y);
    y += 8;

    const weakCols = [280, 100, 115];
    drawTableRow(doc, y, [
      { text: 'Category', width: weakCols[0] },
      { text: 'Occurrences', width: weakCols[1], align: 'center' },
      { text: 'Status', width: weakCols[2] },
    ], true);
    y += 20;

    weaknesses.forEach((w, i) => {
      if (y > 720) { doc.addPage(); y = 50; }
      if (i % 2 === 0) {
        doc.rect(50, y - 2, 495, 18).fill('#F8F9FA');
      }
      const statusColor = w.status === 'recurring' ? COLORS.red : w.status === 'watch' ? COLORS.yellow : COLORS.green;
      drawTableRow(doc, y, [
        { text: w.category, width: weakCols[0] },
        { text: `${w.count}`, width: weakCols[1], align: 'center' },
        { text: w.status, width: weakCols[2], color: statusColor },
      ]);
      y += 20;
    });
  }

  // ── Footer ──
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor(COLORS.gray)
      .text(
        'Interview Sim — FAANG-level SDE-2 interview simulator',
        50, 780,
        { width: 495, align: 'center' },
      );
  }

  doc.end();

  return new Promise((resolve) => {
    stream.on('finish', resolve);
  });
}

// CLI
const args = process.argv.slice(2);
let maxSessions = 10;
let output = DEFAULT_OUTPUT;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--sessions' && args[i + 1]) {
    maxSessions = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--output' && args[i + 1]) {
    output = args[i + 1];
    i++;
  }
}

generatePDF(maxSessions, output).then(() => {
  console.log(`\n✅ PDF report exported to ${output}`);
  console.log('   Ready to share on LinkedIn/X!\n');
});
