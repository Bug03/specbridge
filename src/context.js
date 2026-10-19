import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function adfToText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(adfToText).filter(Boolean).join('\n');
  const own = value.type === 'text' ? value.text : '';
  const children = Array.isArray(value.content) ? value.content.map(adfToText).filter(Boolean) : [];
  return [own, ...children].filter(Boolean).join(value.type === 'paragraph' || value.type === 'listItem' ? '\n' : ' ');
}

function sectionForHeading(markdown, targetHeading) {
  const lines = markdown.split(/\r?\n/);
  const wanted = targetHeading.trim().replace(/^#+\s*/, '').toLowerCase();
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (match && match[2].trim().toLowerCase() === wanted) {
      start = i;
      level = match[1].length;
      break;
    }
  }
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    const match = lines[i].match(/^(#{1,6})\s+/);
    if (match && match[1].length <= level) {
      end = i;
      break;
    }
  }
  const content = lines.slice(start + 1, end).join('\n').trim();
  const scenarios = [...content.matchAll(/^#{1,6}\s+Scenario:\s*(.+)$/gim)].map((match) => match[1].trim());
  return { heading: lines[start].replace(/^#+\s*/, '').trim(), content: content || '_No details under this heading._', scenarios };
}

async function repositoryRevision(root) {
  try {
    const { stdout } = await execFileAsync('git', ['-C', root, 'rev-parse', 'HEAD'], { timeout: 3000 });
    return stdout.trim();
  } catch {
    return null;
  }
}

function credentials(config) {
  const baseUrl = process.env.SPECBRIDGE_JIRA_BASE_URL || config.jira?.baseUrl;
  const email = process.env.SPECBRIDGE_JIRA_EMAIL;
  const token = process.env.SPECBRIDGE_JIRA_API_TOKEN;
  const missing = [!baseUrl && 'SPECBRIDGE_JIRA_BASE_URL (or jira.baseUrl in config)', !email && 'SPECBRIDGE_JIRA_EMAIL', !token && 'SPECBRIDGE_JIRA_API_TOKEN'].filter(Boolean);
  if (missing.length) throw new Error(`Missing Jira settings: ${missing.join(', ')}. See docs/quickstart.md.`);
  let url;
  try { url = new URL(baseUrl); } catch { throw new Error('Jira base URL is not a valid URL.'); }
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new Error('Jira base URL must use HTTPS.');
  return { baseUrl: url.toString().replace(/\/$/, ''), email, token };
}

async function fetchIssue(issueKey, config) {
  const auth = credentials(config);
  const url = `${auth.baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,description,status,issuetype,labels,project`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        authorization: `Basic ${Buffer.from(`${auth.email}:${auth.token}`).toString('base64')}`,
        accept: 'application/json'
      },
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Jira request timed out after 15 seconds.');
    throw new Error(`Could not reach Jira: ${error.message}`);
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    const details = response.status === 401 || response.status === 403
      ? 'Check the Jira email, API token, and read access.'
      : response.status === 404 ? 'Check the issue key and project access.' : `Jira returned HTTP ${response.status}.`;
    throw new Error(`Could not read ${issueKey}. ${details}`);
  }
  const json = await response.json();
  const fields = json.fields ?? {};
  return {
    key: json.key || issueKey,
    summary: fields.summary || '(No summary)',
    description: adfToText(fields.description).trim(),
    status: fields.status?.name || null,
    type: fields.issuetype?.name || null,
    labels: fields.labels || []
  };
}

export async function buildContext({ issueKey, config, configPath }) {
  if (!config || typeof config !== 'object') throw new Error('Configuration must be a JSON object.');
  const mapping = config.links?.[issueKey];
  if (mapping && !Array.isArray(mapping)) throw new Error(`Config links.${issueKey} must be an array.`);
  const configDir = path.dirname(path.resolve(configPath));
  const root = path.resolve(configDir, config.repositoryRoot || '.');
  const references = mapping || [];
  const requirements = [];
  for (const reference of references) {
    if (!reference.file || !reference.heading) throw new Error(`Each link for ${issueKey} needs both "file" and "heading".`);
    const filePath = path.resolve(root, reference.file);
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) throw new Error('Spec file paths must stay inside repositoryRoot.');
    let markdown;
    try { markdown = await readFile(filePath, 'utf8'); }
    catch (error) {
      if (error.code === 'ENOENT') throw new Error(`OpenSpec file not found: ${reference.file}`);
      throw error;
    }
    const section = sectionForHeading(markdown, reference.heading);
    if (!section) throw new Error(`Heading "${reference.heading}" was not found in ${reference.file}.`);
    requirements.push({ path: path.relative(root, filePath), ...section });
  }
  const issue = await fetchIssue(issueKey, config);
  const jiraBase = (process.env.SPECBRIDGE_JIRA_BASE_URL || config.jira?.baseUrl).replace(/\/$/, '');
  const openQuestions = [];
  if (!references.length) openQuestions.push('No requirement or scenario is linked to this ticket yet. Add an entry under links in the config.');
  if (!issue.description) openQuestions.push('The Jira issue has no description. Confirm expected behavior and acceptance criteria with the ticket owner.');
  return {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    issue,
    requirements,
    openQuestions,
    provenance: {
      jiraUrl: `${jiraBase}/browse/${encodeURIComponent(issue.key)}`,
      repositoryRoot: root,
      repositoryRevision: await repositoryRevision(root)
    }
  };
}
