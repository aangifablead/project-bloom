// Use native https instead of Octokit to avoid any throttling/quota plugins
const https = require('https');

const GITHUB_TOKEN = () => process.env.GITHUB_TOKEN;
const BASE = 'api.github.com';

// ── Simple HTTP helper ────────────────────────────────────────────────────────
const ghGet = (path) => new Promise((resolve, reject) => {
  const options = {
    hostname: BASE,
    path,
    method: 'GET',
    headers: {
      Authorization: `token ${GITHUB_TOKEN()}`,
      'User-Agent': 'project-bloom',
      Accept: 'application/vnd.github.v3+json',
    },
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try { resolve(JSON.parse(body)); }
        catch { resolve(body); }
      } else {
        let parsed = {};
        try { parsed = JSON.parse(body); } catch {}
        const err = new Error(parsed.message || `GitHub API error ${res.statusCode}`);
        err.status = res.statusCode;
        reject(err);
      }
    });
  });

  req.on('error', reject);
  req.end();
});

const ghPost = (path, data) => new Promise((resolve, reject) => {
  const body = JSON.stringify(data);
  const options = {
    hostname: BASE,
    path,
    method: 'POST',
    headers: {
      Authorization: `token ${GITHUB_TOKEN()}`,
      'User-Agent': 'project-bloom',
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const req = https.request(options, (res) => {
    let b = '';
    res.on('data', chunk => b += chunk);
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try { resolve(JSON.parse(b)); } catch { resolve(b); }
      } else {
        let parsed = {};
        try { parsed = JSON.parse(b); } catch {}
        const err = new Error(parsed.message || `GitHub API error ${res.statusCode}`);
        err.status = res.statusCode;
        reject(err);
      }
    });
  });

  req.on('error', reject);
  req.write(body);
  req.end();
});

const ghDelete = (path) => new Promise((resolve, reject) => {
  const options = {
    hostname: BASE,
    path,
    method: 'DELETE',
    headers: {
      Authorization: `token ${GITHUB_TOKEN()}`,
      'User-Agent': 'project-bloom',
      Accept: 'application/vnd.github.v3+json',
    },
  };

  const req = https.request(options, (res) => {
    let b = '';
    res.on('data', chunk => b += chunk);
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ deleted: true });
      } else {
        let parsed = {};
        try { parsed = JSON.parse(b); } catch {}
        const err = new Error(parsed.message || `GitHub API error ${res.statusCode}`);
        err.status = res.statusCode;
        reject(err);
      }
    });
  });

  req.on('error', reject);
  req.end();
});

// ── Cache (2 min TTL, errors never cached) ────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 2 * 60_000;

const cached = async (key, fn) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;
  const data = await fn();
  cache.set(key, { data, ts: Date.now() });
  return data;
};

// ── legacy ────────────────────────────────────────────────────────────────────
const getRepoActivity = async (owner, repo) => {
  return cached(`activity:${owner}:${repo}`, async () => {
    const [commits, pulls] = await Promise.all([
      ghGet(`/repos/${owner}/${repo}/commits?per_page=5`),
      ghGet(`/repos/${owner}/${repo}/pulls?state=all&per_page=5`),
    ]);
    return { commits, pulls };
  });
};

// ── commits ───────────────────────────────────────────────────────────────────
const getCommits = async (owner, repo, { page = 1, per_page = 30, sha } = {}) => {
  const key = `commits:${owner}:${repo}:${sha || 'default'}:${page}`;
  return cached(key, async () => {
    let path = `/repos/${owner}/${repo}/commits?per_page=${per_page}&page=${page}`;
    if (sha) path += `&sha=${sha}`;
    return ghGet(path);
  });
};

const getCommit = async (owner, repo, sha) => {
  return cached(`commit:${owner}:${repo}:${sha}`, () =>
    ghGet(`/repos/${owner}/${repo}/commits/${sha}`)
  );
};

// ── branches — never cached (always fresh so new branches appear immediately) ──
const getBranches = async (owner, repo) => {
  cache.delete(`branches:${owner}:${repo}`); // always bust before fetching
  return cached(`branches:${owner}:${repo}`, async () => {
    const [repoData, branches] = await Promise.all([
      ghGet(`/repos/${owner}/${repo}`),
      ghGet(`/repos/${owner}/${repo}/branches?per_page=100`),
    ]);
    const defaultBranch = repoData.default_branch;

    // Sequential compare to avoid secondary rate limit
    const enriched = [];
    for (const branch of branches) {
      if (branch.name === defaultBranch) {
        enriched.push({ ...branch, isDefault: true, ahead: 0, behind: 0 });
        continue;
      }
      try {
        const compare = await ghGet(`/repos/${owner}/${repo}/compare/${defaultBranch}...${branch.name}`);
        enriched.push({ ...branch, isDefault: false, ahead: compare.ahead_by, behind: compare.behind_by });
      } catch {
        enriched.push({ ...branch, isDefault: false, ahead: 0, behind: 0 });
      }
    }

    return { branches: enriched, defaultBranch };
  });
};

// ── pull requests ─────────────────────────────────────────────────────────────
const getPulls = async (owner, repo, state = 'open') => {
  return cached(`pulls:${owner}:${repo}:${state}`, () =>
    ghGet(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=50`)
  );
};

const getPull = async (owner, repo, pull_number) => {
  return cached(`pull:${owner}:${repo}:${pull_number}`, async () => {
    const [pr, files] = await Promise.all([
      ghGet(`/repos/${owner}/${repo}/pulls/${pull_number}`),
      ghGet(`/repos/${owner}/${repo}/pulls/${pull_number}/files`),
    ]);
    return { ...pr, files };
  });
};

// ── check runs ────────────────────────────────────────────────────────────────
const getCheckRuns = async (owner, repo, ref) => {
  return cached(`checks:${owner}:${repo}:${ref}`, async () => {
    try {
      return await ghGet(`/repos/${owner}/${repo}/commits/${ref}/check-runs?per_page=50`);
    } catch {
      return { total_count: 0, check_runs: [] };
    }
  });
};

// ── merge ─────────────────────────────────────────────────────────────────────
const mergeBranches = async (owner, repo, { head, base, commitMessage, mergeMethod = 'merge' }) => {
  try {
    if (mergeMethod === 'squash') {
      const pr = await ghPost(`/repos/${owner}/${repo}/pulls`, {
        title: commitMessage || `Squash merge ${head} into ${base}`,
        head, base,
      });
      const merged = await ghPost(`/repos/${owner}/${repo}/pulls/${pr.number}/merge`, {
        merge_method: 'squash',
        commit_title: commitMessage,
      });
      cache.delete(`branches:${owner}:${repo}`);
      cache.delete(`commits:${owner}:${repo}:${base}:1`);
      return { merged: true, sha: merged.sha };
    }

    const result = await ghPost(`/repos/${owner}/${repo}/merges`, {
      base, head,
      commit_message: commitMessage || `Merge ${head} into ${base}`,
    });
    cache.delete(`branches:${owner}:${repo}`);
    cache.delete(`commits:${owner}:${repo}:${base}:1`);
    return { merged: true, sha: result.sha };
  } catch (err) {
    if (err.status === 409) {
      return { merged: false, conflict: true, message: err.message };
    }
    throw err;
  }
};

// ── delete branch ─────────────────────────────────────────────────────────────
const deleteBranch = async (owner, repo, branch) => {
  await ghDelete(`/repos/${owner}/${repo}/git/refs/heads/${branch}`);
  cache.delete(`branches:${owner}:${repo}`);
  return { deleted: true };
};

module.exports = {
  getRepoActivity,
  getCommits,
  getCommit,
  getBranches,
  getPulls,
  getPull,
  getCheckRuns,
  mergeBranches,
  deleteBranch,
  clearCache: () => cache.clear(),
};
