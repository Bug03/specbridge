import { readFile, readdir } from 'node:fs/promises';
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

async function markdownFiles(directory) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(fullPath);
  }
  return files;
}

export async function findSpecReferences(repositoryRoot) {
  const specsRoot = path.join(repositoryRoot, 'openspec', 'specs');
  const files = await markdownFiles(specsRoot);
  const references = [];
  for (const fullPath of files) {
    const markdown = await readFile(fullPath, 'utf8');
    const headings = [...markdown.matchAll(/^#{1,6}\s+(Requirement:\s*.+?)\s*#*\s*$/gim)];
    for (const match of headings) {
      const heading = match[1].trim();
      const section = sectionForHeading(markdown, heading);
      if (section) references.push({ file: path.relative(repositoryRoot, fullPath), heading: section.heading });
    }
  }
  return references.sort((a, b) => a.file.localeCompare(b.file) || a.heading.localeCompare(b.heading));
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

function jiraHeaders(auth) {
  return {
    authorization: `Basic ${Buffer.from(`${auth.email}:${auth.token}`).toString('base64')}`,
    accept: 'application/json'
  };
}

async function verifyJiraAuthentication(auth) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(`${auth.baseUrl}/rest/api/3/myself`, {
      method: 'GET',
      headers: jiraHeaders(auth),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Jira authentication check timed out after 15 seconds.');
    throw new Error(`Could not reach Jira: ${error.message}`);
  } finally {
    clearTimeout(timer);
  }
  if (response.status === 401) {
    const reason = response.headers.get('x-seraph-loginreason');
    if (reason === 'AUTHENTICATION_DENIED') {
      throw new Error('Jira rejected the login attempt. Check whether the account is temporarily blocked, then try again.');
    }
    throw new Error('Jira rejected the configured email/API token (HTTP 401). Check that SPECBRIDGE_JIRA_EMAIL is the Atlassian account email and replace SPECBRIDGE_JIRA_API_TOKEN with a valid API token.');
  }
  if (response.status === 403) {
    throw new Error('Jira authenticated the account but denied access to the current-user endpoint (HTTP 403). Check the token type and account access.');
  }
  if (!response.ok) throw new Error(`Jira authentication check failed with HTTP ${response.status}.`);
}

async function fetchIssue(issueKey, config) {
  const auth = credentials(config);
  await verifyJiraAuthentication(auth);
  const url = `${auth.baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,description,status,issuetype,labels,project`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: jiraHeaders(auth),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Jira request timed out after 15 seconds.');
    throw new Error(`Could not reach Jira: ${error.message}`);
  } finally {
    clearTimeout(timer);
  }
  if (response.status === 404) throw new Error(`Could not read ${issueKey} (HTTP 404). Check that the issue key exists and the authenticated account has Browse Projects permission.`);
  if (response.status === 403) throw new Error(`Could not read ${issueKey} (HTTP 403). The authenticated Jira account may not have Browse Projects permission.`);
  if (!response.ok) throw new Error(`Could not read ${issueKey}. Jira returned HTTP ${response.status}.`);
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

export async function buildContext({ issueKey, config, configPath, references: selectedReferences }) {
  if (!config || typeof config !== 'object') throw new Error('Configuration must be a JSON object.');
  const mapping = config.links?.[issueKey];
  if (mapping && !Array.isArray(mapping)) throw new Error(`Config links.${issueKey} must be an array.`);
  const configDir = path.dirname(path.resolve(configPath));
  const root = config.repositoryRoot ? path.resolve(configDir, config.repositoryRoot) : configDir;
  const references = selectedReferences || mapping || [];
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
