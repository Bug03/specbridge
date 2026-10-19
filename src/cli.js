#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { buildContext } from './context.js';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  return `SpecBridge — create a source-linked context brief for a Jira issue

Usage:
  specbridge init [--config PATH]
  specbridge context ISSUE-123 [--config PATH] [--format md|json] [--output PATH]

Environment:
  SPECBRIDGE_JIRA_BASE_URL   Jira Cloud site URL
  SPECBRIDGE_JIRA_EMAIL      Jira account email
  SPECBRIDGE_JIRA_API_TOKEN  Jira API token

Run "specbridge context --help" for context command options.`;
}

function parseArgs(args) {
  const options = { format: 'md', config: 'specbridge.config.json' };
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--config') options.config = args[++i];
    else if (arg === '--format') options.format = args[++i];
    else if (arg === '--output' || arg === '-o') options.output = args[++i];
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else positional.push(arg);
  }
  if (!options.config || (options.output === undefined && args.includes('--output'))) {
    throw new Error('An option is missing its value.');
  }
  return { options, positional };
}

async function init(configPath) {
  try {
    await readFile(configPath, 'utf8');
    throw new Error(`${configPath} already exists; move it first if you want to replace it.`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const template = await readFile(path.join(here, '..', 'specbridge.example.json'), 'utf8');
  await writeFile(configPath, template, { flag: 'wx' });
  console.log(`Created ${configPath}. Add Jira issue links and set Jira credentials in your environment.`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h') {
    console.log(usage());
    return;
  }
  const { options, positional } = parseArgs(args);
  if (options.help) {
    console.log(command === 'context'
      ? `Usage: specbridge context ISSUE-123 [--config PATH] [--format md|json] [--output PATH]\n\nReads Jira issue fields and configured OpenSpec sections. It does not write to Jira.`
      : usage());
    return;
  }
  if (command === 'init') {
    await init(options.config);
    return;
  }
  if (command !== 'context') throw new Error(`Unknown command: ${command}\n\n${usage()}`);
  const issueKey = positional[0];
  if (!issueKey || positional.length > 1) throw new Error('Provide one Jira issue key, for example PROJ-123.');
  if (!['md', 'json'].includes(options.format)) throw new Error('--format must be md or json.');

  const config = JSON.parse(await readFile(options.config, 'utf8'));
  const result = await buildContext({ issueKey, config, configPath: options.config });
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
