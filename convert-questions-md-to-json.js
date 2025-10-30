#!/usr/bin/env node
/*
  Converts questions.md → questions.json in the SurveyJS schema used by this project.
  - Parses sections separated by ---
  - Supports question types: "Multiple Choice (Single Answer)", "Multiple Choice (Multiple Answers)"
  - Defaults when missing in markdown:
    title = "Quiz"
    startSurveyText = "Let's get started!"
    showProgressBar = "bottom"
    showNavigationButtons = false
    isRequired = true
*/
const fs = require('fs');
const path = require('path');

const WORKDIR = __dirname;

function parseCliArgs(argv) {
  const args = { input: null, output: null, help: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { args.help = true; continue; }
    if (a === '-i' || a === '--input') { args.input = argv[++i]; continue; }
    if (a === '-o' || a === '--output') { args.output = argv[++i]; continue; }
    if (!args.input) { args.input = a; continue; }
    if (!args.output) { args.output = a; continue; }
  }
  return args;
}

function resolvePathMaybe(p) {
  if (!p) return null;
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err.message);
    process.exit(1);
  }
}

function writeFileSafe(filePath, data) {
  try {
    fs.writeFileSync(filePath, data, 'utf8');
  } catch (err) {
    console.error(`Failed to write ${filePath}:`, err.message);
    process.exit(1);
  }
}

function toCamelName(title) {
  if (!title) return 'question';
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 6); // cap to keep names short
  if (words.length === 0) return 'question';
  const [first, ...rest] = words;
  return [first, ...rest.map((w) => w.charAt(0).toUpperCase() + w.slice(1))].join('');
}

function parseList(lines, startIdx) {
  const items = [];
  let i = startIdx;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    if (line.startsWith('__') || line === '---') break;
    if (line.startsWith('- ')) {
      items.push(line.slice(2).trim());
      i++;
      continue;
    }
    break;
  }
  return { items, nextIdx: i };
}

function extractAfterLabel(lines, label, startIdx) {
  const labelIdx = lines.findIndex((l, idx) => idx >= startIdx && l.trim().toLowerCase() === label.toLowerCase());
  if (labelIdx === -1) return { value: null, index: startIdx };
  let i = labelIdx + 1;
  while (i < lines.length && !lines[i].trim()) i++;
  if (i >= lines.length) return { value: null, index: labelIdx + 1 };
  return { value: lines[i].trim(), index: i + 1 };
}

function extractListAfterLabel(lines, label, startIdx) {
  const labelIdx = lines.findIndex((l, idx) => idx >= startIdx && l.trim().toLowerCase() === label.toLowerCase());
  if (labelIdx === -1) return { items: [], index: startIdx };
  let i = labelIdx + 1;
  // skip empty lines
  while (i < lines.length && !lines[i].trim()) i++;
  const { items, nextIdx } = parseList(lines, i);
  return { items, index: nextIdx };
}

function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);

  // Title: first H1
  let title = 'Quiz';
  for (const line of lines) {
    const m = line.match(/^#\s+(.+)/);
    if (m) { title = m[1].trim(); break; }
  }

  // Start text: first H2 that is not "Questions"
  let startSurveyText = "Let's get started!";
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)/);
    if (m) {
      const val = m[1].trim();
      if (val.toLowerCase() !== 'questions') { startSurveyText = val; break; }
    }
  }

  // Split questions by ---
  const blocks = md
    .split(/\n-{3,}\n/g)
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
    .slice(1); // drop preface section before first question divider if present

  const elements = [];

  for (const block of blocks) {
    const blines = block.split(/\r?\n/);
    // Question Type
    const qTypeLabel = '__Question Type__';
    let { value: qType } = extractAfterLabel(blines, qTypeLabel, 0);
    qType = (qType || '').toLowerCase();

    let type = 'radiogroup';
    let multiple = false;
    if (qType.includes('multiple answers')) { type = 'checkbox'; multiple = true; }
    else if (qType.includes('single answer')) { type = 'radiogroup'; multiple = false; }

    // Question text
    const { value: questionText } = extractAfterLabel(blines, '__Question__', 0);
    // Options
    const { items: options } = extractListAfterLabel(blines, '__Options__', 0);
    // Answers
    const answersLabel = multiple ? '__Correct Answers__' : '__Correct Answer__';
    let { items: correctItems } = extractListAfterLabel(blines, answersLabel, 0);

    // Fallbacks
    const titleText = questionText || 'Question';
    const name = toCamelName(titleText);
    const isRequired = true;

    const base = {
      type,
      name,
      title: titleText,
    };

    if (Array.isArray(options) && options.length) {
      base.choices = options;
    } else {
      base.choices = [];
    }

    base.isRequired = isRequired;

    if (multiple) {
      base.correctAnswer = correctItems && correctItems.length ? correctItems : [];
    } else {
      const ans = correctItems && correctItems.length ? correctItems[0] : '';
      base.correctAnswer = ans;
    }

    elements.push(base);
  }

  const result = {
    title,
    showProgressBar: 'bottom',
    startSurveyText,
    showNavigationButtons: false,
    elements,
  };

  return result;
}

function printHelp() {
  console.log(`Usage: node convert-questions-md-to-json.js [options] [input.md] [output.json]

Options:
  -i, --input   Path to input markdown (default: questions.md)
  -o, --output  Path to output json   (default: questions.json)
  -h, --help    Show this help
`);
}

function main() {
  const args = parseCliArgs(process.argv);
  if (args.help) { printHelp(); process.exit(0); }

  const inputPath = resolvePathMaybe(args.input) || path.join(WORKDIR, 'questions.md');
  const outputPath = resolvePathMaybe(args.output) || path.join(WORKDIR, 'questions.json');

  const md = readFileSafe(inputPath);
  const json = parseMarkdown(md);
  const output = JSON.stringify(json, null, 2);
  writeFileSafe(outputPath, output + '\n');
  console.log(`Converted ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
}

if (require.main === module) {
  main();
}


