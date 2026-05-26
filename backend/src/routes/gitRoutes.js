const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getRepoActivity,
  getCommits,
  getCommit,
  getBranches,
  getPulls,
  getPull,
  getCheckRuns,
  mergeBranches,
  deleteBranch,
  clearCache,
} = require('../services/gitService');

const handle = (fn) => async (req, res) => {
  try {
    const data = await fn(req);
    res.json(data);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
};

// ── Cache clear ───────────────────────────────────────────────────────────────
router.post('/cache/clear', (req, res) => {
  clearCache();
  res.json({ cleared: true });
});

// ── All routes require auth ───────────────────────────────────────────────────
router.use(authenticate);

// commits
router.get('/:owner/:repo/commits', handle(req =>
  getCommits(req.params.owner, req.params.repo, req.query)
));

// checks — MUST be before /:sha
router.get('/:owner/:repo/commits/:ref/checks', handle(req =>
  getCheckRuns(req.params.owner, req.params.repo, req.params.ref)
));

router.get('/:owner/:repo/commits/:sha', handle(req =>
  getCommit(req.params.owner, req.params.repo, req.params.sha)
));

// branches
router.get('/:owner/:repo/branches', handle(req =>
  getBranches(req.params.owner, req.params.repo)
));

router.delete('/:owner/:repo/branches/:branch', handle(req =>
  deleteBranch(req.params.owner, req.params.repo, req.params.branch)
));

// pull requests
router.get('/:owner/:repo/pulls', handle(req =>
  getPulls(req.params.owner, req.params.repo, req.query.state)
));

router.get('/:owner/:repo/pulls/:pull_number', handle(req =>
  getPull(req.params.owner, req.params.repo, req.params.pull_number)
));

// merge
router.post('/:owner/:repo/merge', handle(req =>
  mergeBranches(req.params.owner, req.params.repo, req.body)
));

// legacy — kept last so specific routes match first
router.get('/:owner/:repo', handle(req =>
  getRepoActivity(req.params.owner, req.params.repo)
));

module.exports = router;
