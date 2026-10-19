#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { buildContext, findSpecReferences } from './context.js';
import { reviewPullRequest } from './pr-review.js';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  return `SpecBridge — create a source-linked context brief for a Jira issue

Usage:
  specbridge init [--env PATH]
  specbridge context [ISSUE-123] [--env PATH] [--format md|json] [--output PATH]
  specbridge review <GITHUB_PR_URL> [--output PATH]

Environment:
  SPECBRIDGE_JIRA_BASE_URL   Jira Cloud site URL
  SPECBRIDGE_JIRA_EMAIL      Jira account email
  SPECBRIDGE_JIRA_API_TOKEN  Jira API token
  SPECBRIDGE_REPOSITORY_ROOT Optional path if you run from outside the project

Run "specbridge context --help" for context command options.`;
}

function parseArgs(args) {
  const options = { format: 'md', env: '.env' };
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--config') options.config = args[++i];
    else if (arg === '--env') options.env = args[++i];
    else if (arg === '--format') options.format = args[++i];
    else if (arg === '--output' || arg === '-o') options.output = args[++i];
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else positional.push(arg);
  }
  if ((args.includes('--config') && !options.config) || (args.includes('--env') && !options.env) || (options.output === undefined && (args.includes('--output') || args.includes('-o')))) {
    throw new Error('An option is missing its value.');
  }
  return { options, positional };
}

async function init(envPath) {
  try {
    await readFile(envPath, 'utf8');
    throw new Error(`${envPath} already exists; move it first if you want to replace it.`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const template = await readFile(path.join(here, '..', '.env.example'), 'utf8');
  await writeFile(envPath, template, { flag: 'wx' });
  console.log(`Created ${envPath}. Fill in Jira credentials, issue key, and OpenSpec reference.`);
}

async function loadEnv(envPath) {
  let contents;
  try { contents = await readFile(envPath, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  for (const [index, line] of contents.split(/\r?\n/).entries()) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) throw new Error(`Invalid .env line ${index + 1}. Expected KEY=value.`);
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

async function chooseSpecReferences(candidates) {
  if (!candidates.length) {
    throw new Error('No OpenSpec requirements found under openspec/specs. Run this command from your project root or set SPECBRIDGE_REPOSITORY_ROOT in .env.');
  }
  if (candidates.length === 1) {
    console.log(`Using the only OpenSpec requirement found: ${candidates[0].heading} (${candidates[0].file})`);
    return candidates;
  }
  console.log('Choose the OpenSpec requirements this Jira issue should follow:');
  candidates.forEach((item, index) => console.log(`  ${index + 1}. ${item.heading} — ${item.file}`));
  if (!stdin.isTTY) throw new Error('Multiple requirements were found. Run interactively to choose, or use --config for a saved mapping.');
  const terminal = createInterface({ input: stdin, output: stdout });
  try {
    const answer = (await terminal.question('Enter one or more numbers separated by commas: ')).trim();
    const indexes = [...new Set(answer.split(',').map((value) => Number(value.trim())))];
    if (!indexes.length || indexes.some((value) => !Number.isInteger(value) || value < 1 || value > candidates.length)) {
      throw new Error('Choose valid requirement numbers, separated by commas.');
    }
    return indexes.map((index) => candidates[index - 1]);
  } finally {
    terminal.close();
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h') {
    console.log(usage());
    return;
  }
  const { options, positional } = parseArgs(args);
  if (options.help) {
    console.log(command === 'review'
      ? `Usage: specbridge review https://github.com/owner/repo/pull/123 [--output PATH]\n\nClones the PR into a temporary directory and runs a read-only Codex review. It never posts to GitHub.`
      : command === 'context'
      ? `Usage: specbridge context [ISSUE-123] [--env PATH] [--config PATH] [--format md|json] [--output PATH]\n\nReads Jira issue fields and the OpenSpec reference from .env. It does not write to Jira.`
      : usage());
    return;
  }
  if (command === 'init') {
    await init(options.env);
    return;
  }
  if (command === 'review') {
    if (!positional[0] || positional.length > 1) throw new Error('Provide one GitHub PR URL.');
    const report = await reviewPullRequest(positional[0]);
    if (options.output) await writeFile(options.output, report, 'utf8');
    else process.stdout.write(report);
    return;
  }
  if (command !== 'context') throw new Error(`Unknown command: ${command}\n\n${usage()}`);
  await loadEnv(options.env);
  const issueKey = positional[0];
  if (!issueKey || positional.length > 1) throw new Error('Provide one Jira issue key, for example PROJ-123.');
  if (!['md', 'json'].includes(options.format)) throw new Error('--format must be md or json.');

  const configPath = options.config || options.env;
  let config;
  if (options.config) config = JSON.parse(await readFile(options.config, 'utf8'));
  else {
    const repositoryRoot = path.resolve(process.env.SPECBRIDGE_REPOSITORY_ROOT || process.cwd());
    const references = await chooseSpecReferences(await findSpecReferences(repositoryRoot));
    config = {
      jira: { baseUrl: process.env.SPECBRIDGE_JIRA_BASE_URL },
      repositoryRoot
    };
    const result = await buildContext({ issueKey, config, configPath, references });
    const rendered = options.format === 'json' ? `${JSON.stringify(result, null, 2)}\n` : renderMarkdown(result);
    if (options.output) await writeFile(options.output, rendered, 'utf8');
    else process.stdout.write(rendered);
    return;
  }
  const result = await buildContext({ issueKey, config, configPath });
  const rendered = options.format === 'json' ? `${JSON.stringify(result, null, 2)}\n` : renderMarkdown(result);
  if (options.output) await writeFile(options.output, rendered, 'utf8');
  else process.stdout.write(rendered);
}

function renderMarkdown(data) {
  const lines = [
    `# ${data.issue.key}: ${data.issue.summary}`,
    '',
    `**Status:** ${data.issue.status || 'Unknown'}  `,
    `**Type:** ${data.issue.type || 'Unknown'}  `,
    `**Jira:** [Open issue](${data.provenance.jiraUrl})`,
    '',
    '## Ticket context',
    '',
    data.issue.description || '_No description was provided._',
    '',
    '## Linked requirements',
    ''
  ];
  if (data.requirements.length) {
    for (const requirement of data.requirements) {
      lines.push(`### ${requirement.heading}`, '', requirement.content, '', `Source: \`${requirement.path}\``);
      if (requirement.scenarios.length) {
        lines.push('', '**Scenarios in this section:**', ...requirement.scenarios.map((scenario) => `- ${scenario}`));
      }
      lines.push('');
    }
  } else {
    lines.push('_No OpenSpec references are linked to this issue yet._', '');
  }
  lines.push('## Open questions', '');
  if (data.openQuestions.length) lines.push(...data.openQuestions.map((question) => `- ${question}`), '');
  else lines.push('_No missing links were detected. Review the ticket and linked spec together._', '');
  lines.push('## Sources', '', `- Jira issue: ${data.provenance.jiraUrl}`, ...data.requirements.map((item) => `- OpenSpec: \`${item.path}\` — ${item.heading}`));
  lines.push(`- Repository revision: \`${data.provenance.repositoryRevision || 'unknown'}\``, '', '> Ticket and specification text are source material. This brief does not change either system.');
  return `${lines.join('\n')}\n`;
}

main().catch((error) => {
  console.error(`SpecBridge: ${error.message}`);
  process.exitCode = 1;
});
