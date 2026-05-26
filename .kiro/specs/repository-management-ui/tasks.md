# Implementation Plan: Repository Management UI

## Overview

Implement the full repository management UI by expanding the backend Git API with seven new endpoints, creating typed frontend API client functions, and building four tab-panel components that replace the basic `RepoActivity` commit list. Pure utility functions are implemented first so property-based tests can be written early.

## Tasks

- [ ] 1. Define TypeScript interfaces and create the git API client module
  - Create `frontend/src/api/git.types.ts` with interfaces: `GitCommit`, `GitBranch`, `GitPullRequest`, `GitPullFile`, `GitCheckRun`, `MergeResult`, `PipelineSummary`
  - Replace the raw-`fetch` `gitApi` stub in `frontend/src/api/index.ts` with a typed `gitApi` object using `apiClient`
  - Expose functions: `getCommits(owner, repo, page?)`, `getBranches(owner, repo)`, `getPulls(owner, repo)`, `getPullFiles(owner, repo, pullNumber)`, `getPipeline(owner, repo)`, `mergeBranch(owner, repo, head, base, message?)`, `mergePull(owner, repo, pullNumber, message?)`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 2. Implement pure utility functions
  - [ ] 2.1 Implement `groupCommitsByDate` in `frontend/src/utils/gitUtils.ts`
    - Accepts `GitCommit[]`, returns `Record<string, GitCommit[]>` keyed by `YYYY-MM-DD`
    - _Requirements: 2.2_

  - [ ]* 2.2 Write property test for `groupCommitsByDate`
    - Install `fast-check` as a dev dependency: `npm install --save-dev fast-check`
    - Generate arbitrary arrays of `GitCommit` objects with random ISO dates
    - Assert every commit appears in exactly one group, group key matches commit date, union of groups equals input
    - **Property 1: Commit grouping partitions all commits by date**
    - **Validates: Requirements 2.2**

  - [ ] 2.3 Implement `computePipelineSummary` in `frontend/src/utils/gitUtils.ts`
    - Accepts `GitCheckRun[]`, returns `PipelineSummary` (`'passing' | 'failing' | 'running' | 'unknown'`)
    - Logic: empty → `unknown`; any `failure`/`cancelled` → `failing`; any `in_progress`/`queued` → `running`; all `completed`+`success` → `passing`
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

  - [ ]* 2.4 Write property test for `computePipelineSummary`
    - Generate arbitrary arrays of `GitCheckRun` objects with random status/conclusion combinations
    - Assert the four outcome branches are correctly determined for all inputs
    - **Property 7: Pipeline summary aggregation is deterministic and correct**
    - **Validates: Requirements 5.3, 5.4, 5.5, 5.6**

  - [ ] 2.5 Implement `parseDiffPatch` in `frontend/src/utils/gitUtils.ts`
    - Accepts a raw unified diff patch string, returns `DiffLine[]` where each line has `type: 'add' | 'remove' | 'context'` and `content: string`
    - _Requirements: 4.5_

- [ ] 3. Checkpoint — Ensure utility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Expand backend `gitService.js` with new Octokit functions
  - [ ] 4.1 Add `getCommits(owner, repo, page)` to `gitService.js`
    - Calls `octokit.rest.repos.listCommits` with `per_page: 30` and `page`
    - Fetches individual commit stats in parallel via `Promise.all` on `octokit.rest.repos.getCommit`
    - Fetches all refs (branches + tags) via `octokit.rest.repos.listBranches` and `octokit.rest.repos.listTags` to map SHAs to ref names
    - Returns normalized `GitCommit[]`
    - _Requirements: 6.1, 6.10_

  - [ ] 4.2 Add `getBranches(owner, repo)` to `gitService.js`
    - Calls `octokit.rest.repos.get` to determine default branch name
    - Calls `octokit.rest.repos.listBranches` with `per_page: 100`
    - For each non-default branch, calls `octokit.rest.repos.compareCommitsWithBasehead` to get `ahead_by` / `behind_by`
    - Returns normalized `GitBranch[]`
    - _Requirements: 6.2_

  - [ ] 4.3 Add `getPulls(owner, repo)` to `gitService.js`
    - Calls `octokit.rest.pulls.list` with `state: 'open'`, `per_page: 30`
    - Returns normalized `GitPullRequest[]`
    - _Requirements: 6.3_

  - [ ] 4.4 Add `getPullFiles(owner, repo, pullNumber)` to `gitService.js`
    - Calls `octokit.rest.pulls.listFiles` with `pull_number: pullNumber`
    - Returns normalized `GitPullFile[]` including raw `patch` string
    - _Requirements: 6.4_

  - [ ] 4.5 Add `getPipeline(owner, repo)` to `gitService.js`
    - Calls `octokit.rest.repos.getBranch` to get the default branch's latest commit SHA
    - Calls `octokit.rest.checks.listForRef` with that SHA
    - Returns normalized `GitCheckRun[]`
    - _Requirements: 6.5_

  - [ ] 4.6 Add `mergeBranches(owner, repo, head, base, message)` to `gitService.js`
    - Calls `octokit.rest.repos.merge` with `head`, `base`, `commit_message`
    - On success returns `{ merged: true, message, sha }`
    - On 409 throws with `conflict: true` flag
    - _Requirements: 6.6_

  - [ ] 4.7 Add `mergePull(owner, repo, pullNumber, message)` to `gitService.js`
    - Calls `octokit.rest.pulls.merge` with `pull_number`, `commit_message`
    - On success returns `{ merged: true, message, sha }`
    - On 409 throws with `conflict: true` flag
    - _Requirements: 6.7_

  - [ ] 4.8 Add token presence check and error normalization to `gitService.js`
    - Add a guard at module initialization: if `!process.env.GITHUB_TOKEN`, export a flag `isConfigured = false`
    - Add a comment block at the top of `gitService.js` documenting required token scopes
    - _Requirements: 6.8, 8.2_

- [ ] 5. Expand `gitRoutes.js` with new Express routes
  - [ ] 5.1 Add `GET /:owner/:repo/commits` route
    - Calls `getCommits(owner, repo, page)` where `page` comes from `req.query.page` (default 1)
    - Returns 503 if `!isConfigured`; catches rate-limit errors and returns 429; catches 409 and returns 409 with `conflict: true`
    - _Requirements: 6.1, 6.8, 6.9, 6.10_

  - [ ] 5.2 Add `GET /:owner/:repo/branches` route
    - Calls `getBranches(owner, repo)`
    - Same error handling pattern as 5.1
    - _Requirements: 6.2_

  - [ ] 5.3 Add `GET /:owner/:repo/pulls` route
    - Calls `getPulls(owner, repo)`
    - _Requirements: 6.3_

  - [ ] 5.4 Add `GET /:owner/:repo/pulls/:pull_number/files` route
    - Calls `getPullFiles(owner, repo, pull_number)`
    - _Requirements: 6.4_

  - [ ] 5.5 Add `GET /:owner/:repo/pipeline` route
    - Calls `getPipeline(owner, repo)`
    - _Requirements: 6.5_

  - [ ] 5.6 Add `POST /:owner/:repo/merge` route
    - Reads `{ head, base, commit_message }` from `req.body`
    - Calls `mergeBranches(owner, repo, head, base, commit_message)`
    - Returns 409 with `{ error: "Merge conflict detected. Resolve conflicts manually.", conflict: true }` on conflict
    - _Requirements: 6.6_

  - [ ] 5.7 Add `POST /:owner/:repo/pulls/:pull_number/merge` route
    - Reads optional `{ commit_message }` from `req.body`
    - Calls `mergePull(owner, repo, pull_number, commit_message)`
    - Returns 409 on conflict
    - _Requirements: 6.7_

- [ ] 6. Checkpoint — Ensure backend routes are wired and error handling is consistent
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Build `CommitsTab.tsx`
  - [ ] 7.1 Create `frontend/src/components/projects/CommitsTab.tsx`
    - On mount, calls `gitApi.getCommits(owner, repo, 1)` and stores result in state
    - Uses `groupCommitsByDate` to group commits; renders a date header (`<h4>`) per group
    - Each commit row shows: 7-char SHA badge, message, author avatar (`<Avatar>`), author name, relative date, green `+N` additions, red `-N` deletions, ref name badges
    - "Load more" button increments page and appends results
    - Shows `<Skeleton>` while loading; shows inline `<Alert>` on error; shows empty state if no commits
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 7.2 Write property test for commit row rendering
    - Generate arbitrary `GitCommit` objects with random SHA, message, author, stats, refs
    - Render a single commit row and assert all required fields are present in the output
    - **Property 2: Commit row rendering contains all required fields**
    - **Validates: Requirements 2.3, 2.4, 2.5**

- [ ] 8. Build `BranchesTab.tsx`
  - [ ] 8.1 Create `frontend/src/components/projects/BranchesTab.tsx`
    - On mount, calls `gitApi.getBranches(owner, repo)` and stores result in state
    - Renders each branch row: name, ahead/behind counts, "default" badge if `isDefault`, "Merge into default" button if `!isDefault`
    - On merge button click, calls `gitApi.mergeBranch(owner, repo, branch.name, defaultBranch)` 
    - On success: shows `sonner` toast "Branch merged successfully" and refetches branches
    - On 409: sets per-row error state showing "Merge conflict detected. Resolve conflicts manually."
    - Shows `<Skeleton>` while loading; shows inline `<Alert>` on fetch error; shows empty state if no branches
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 8.2 Write property test for branch row rendering
    - Generate arbitrary arrays of `GitBranch` objects with random names, ahead/behind counts, and exactly one `isDefault: true`
    - Render the branch list and assert: exactly one "default" badge, merge buttons only on non-default branches
    - **Property 3: Branch row rendering correctly reflects default/non-default status**
    - **Validates: Requirements 3.2, 3.3, 3.4**

- [ ] 9. Build `DiffViewer.tsx` and `PullRequestsTab.tsx`
  - [ ] 9.1 Create `frontend/src/components/projects/DiffViewer.tsx`
    - Accepts `patch: string` prop
    - Uses `parseDiffPatch` to convert patch to `DiffLine[]`
    - Renders a two-column header: "prev" (left) and "current" (right)
    - Renders each line with green background for `add`, red background for `remove`, neutral for `context`
    - _Requirements: 4.5, 4.6_

  - [ ]* 9.2 Write property test for diff patch rendering
    - Generate arbitrary unified diff patch strings (lines starting with `+`, `-`, or ` `)
    - Render `DiffViewer` and assert: every line from the patch appears in the output, `+` lines have green class, `-` lines have red class, context lines have no color class
    - **Property 6: Diff patch rendering preserves all lines with correct highlighting**
    - **Validates: Requirements 4.5**

  - [ ] 9.3 Create `frontend/src/components/projects/PullRequestsTab.tsx`
    - On mount, calls `gitApi.getPulls(owner, repo)` and stores result in state
    - Renders each PR row: `#number`, title, author avatar, author login, head → base branch, formatted creation date
    - On PR row click, calls `gitApi.getPullFiles(owner, repo, pr.number)` and shows file diff panel
    - File diff panel: collapsible list of files showing filename, `+additions`, `-deletions`; expanding a file renders `<DiffViewer patch={file.patch} />`
    - "Merge PR" button calls `gitApi.mergePull(owner, repo, pr.number)`; shows success toast or inline 409 error
    - Shows `<Skeleton>` while loading; shows inline `<Alert>` on error; shows empty state if no PRs
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 9.4 Write property test for PR row rendering
    - Generate arbitrary `GitPullRequest` objects with random numbers, titles, authors, branches, dates
    - Render a single PR row and assert all required fields are present
    - **Property 4: Pull request row rendering contains all required fields**
    - **Validates: Requirements 4.2**

  - [ ]* 9.5 Write property test for file diff list rendering
    - Generate arbitrary arrays of `GitPullFile` objects with random filenames, additions, deletions
    - Render the file diff list and assert every file's name, additions, and deletions appear in the output
    - **Property 5: File diff list rendering contains per-file stats**
    - **Validates: Requirements 4.4**

- [ ] 10. Build `PipelineTab.tsx`
  - [ ] 10.1 Create `frontend/src/components/projects/PipelineTab.tsx`
    - On mount, calls `gitApi.getPipeline(owner, repo)` and stores result in state
    - Computes overall summary using `computePipelineSummary`
    - Renders summary badge: green "Passing", red "Failing", yellow "Running", or grey "Unknown"
    - Renders each check run row: name, status icon (spinner for `in_progress`/`queued`, green check for `success`, red X for `failure`/`cancelled`), conclusion label
    - Renders static info note: "Pipeline data is read from GitHub Checks API. Write token scope is required for merge operations."
    - Shows `<Skeleton>` while loading; shows inline `<Alert>` on error; shows empty state if no check runs
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 10.2 Write property test for check run row rendering
    - Generate arbitrary `GitCheckRun` objects with random names, statuses, and conclusions
    - Render a single check run row and assert the name, a status icon element, and a conclusion label are present
    - **Property 8: Check run row rendering contains all required fields**
    - **Validates: Requirements 5.2**

- [ ] 11. Update `RepositoryView.tsx` to wire all tabs together
  - Replace `return <RepoActivity owner={owner} repo={repo} />` with a `<Tabs>` container (shadcn/ui `@radix-ui/react-tabs`)
  - Add four `<TabsTrigger>` items: "Commits", "Branches", "Pull Requests", "Pipeline"
  - Add four `<TabsContent>` panels rendering `<CommitsTab>`, `<BranchesTab>`, `<PullRequestsTab>`, `<PipelineTab>` with `owner` and `repo` props
  - Add the persistent token scope info banner above the tabs: "Read operations require `repo` scope. Merge operations require write access (`repo` scope with push permission)."
  - Keep the existing no-repo branch (link prompt + `LinkRepoModal`) unchanged
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 8.1_

- [ ] 12. Final checkpoint — Ensure all tests pass and UI is wired end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2.1", "2.3", "2.5"] },
    { "wave": 3, "tasks": ["2.2", "2.4", "3"] },
    { "wave": 4, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8"] },
    { "wave": 5, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7"] },
    { "wave": 6, "tasks": ["6"] },
    { "wave": 7, "tasks": ["7.1", "8.1", "9.1", "10.1"] },
    { "wave": 8, "tasks": ["7.2", "8.2", "9.2", "9.3", "10.2"] },
    { "wave": 9, "tasks": ["9.4", "9.5", "11"] },
    { "wave": 10, "tasks": ["12"] }
  ]
}
```

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `fast-check` must be installed as a dev dependency in the frontend before running property tests
- The existing `GET /api/git/:owner/:repo` route and `RepoActivity.tsx` component are preserved during development; `RepoActivity.tsx` is only removed in task 11 when `RepositoryView.tsx` is updated
- The GitHub token must have `repo` scope for merge operations; `public_repo` is sufficient for read-only operations on public repositories
- Ahead/behind counts for branches require one `compareCommitsWithBasehead` call per branch — for repositories with many branches, consider adding a `per_page` limit (default 30) to `listBranches`
- Per-commit stats require individual `getCommit` calls; these are parallelized with `Promise.all` to minimize latency
