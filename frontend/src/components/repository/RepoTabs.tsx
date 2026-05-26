import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitCommitHorizontal, GitBranch, GitPullRequest, PlayCircle, Loader2 } from 'lucide-react';
import { gitApi } from '@/api';
import { CommitsTab } from './CommitsTab';
import { BranchesTab } from './BranchesTab';
import { MergeRequestsTab } from './MergeRequestsTab';
import { PipelinesTab } from './PipelinesTab';
import { CIStatusBadge } from './CIStatusBadge';

type Tab = 'commits' | 'branches' | 'pulls' | 'pipelines';

interface RepoTabsProps {
  owner: string;
  repo: string;
}

export const RepoTabs: React.FC<RepoTabsProps> = ({ owner, repo }) => {
  const [activeTab, setActiveTab] = useState<Tab>('commits');

  // Fetch branch/commit counts for sidebar badges
  const { data: branchData, isLoading: branchLoading, error: branchError } = useQuery({
    queryKey: ['git', owner, repo, 'branches'],
    queryFn: () => gitApi.getBranches(owner, repo),
    staleTime: 2 * 60_000,
    retry: false,
    gcTime: 0,
  });

  const { data: commitsData } = useQuery({
    queryKey: ['git', owner, repo, 'commits', branchData?.defaultBranch || 'main', 1],
    queryFn: () => gitApi.getCommits(owner, repo, { page: 1, per_page: 1, sha: branchData?.defaultBranch || 'main' }),
    enabled: !!branchData,
    staleTime: 2 * 60_000,
    retry: false,
    gcTime: 0,
  });

  const { data: pullsData } = useQuery({
    queryKey: ['git', owner, repo, 'pulls', 'open'],
    queryFn: () => gitApi.getPulls(owner, repo, 'open'),
    staleTime: 2 * 60_000,
    retry: false,
    gcTime: 0,
  });

  // pipeline status for sidebar badge
  const latestSha = commitsData?.[0]?.sha;
  const { data: checksData } = useQuery({
    queryKey: ['git', owner, repo, 'checks', latestSha],
    queryFn: () => gitApi.getCheckRuns(owner, repo, latestSha!),
    enabled: !!latestSha,
    staleTime: 60_000,
    retry: 1,
  });

  const branches: any[] = branchData?.branches || [];
  const defaultBranch: string = branchData?.defaultBranch || 'main';
  const branchNames = branches.map((b: any) => b.name);
  const pullCount = Array.isArray(pullsData) ? pullsData.length : 0;

  // Show a top-level error if the repo can't be reached
  if (branchError) {
    const msg = (branchError as any)?.response?.data?.error || (branchError as Error).message;
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-border rounded-xl text-center">
        <p className="font-medium text-destructive">Failed to load repository</p>
        <p className="text-sm text-muted-foreground max-w-sm">{msg}</p>
      </div>
    );
  }

  const latestCheck = checksData?.check_runs?.[0];
  const pipelineStatus = (() => {
    const runs = checksData?.check_runs || [];
    if (!runs.length) return null;
    if (runs.some((c: any) => c.status === 'in_progress' || c.status === 'queued')) return 'in_progress';
    if (runs.every((c: any) => c.conclusion === 'success')) return 'success';
    return 'failure';
  })();

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      id: 'commits',
      label: 'Commits',
      icon: <GitCommitHorizontal className="w-4 h-4" />,
      badge: <span className="ml-auto text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">24</span>,
    },
    {
      id: 'branches',
      label: 'Branches',
      icon: <GitBranch className="w-4 h-4" />,
      badge: branchLoading
        ? <Loader2 className="ml-auto w-3 h-3 animate-spin text-muted-foreground" />
        : <span className="ml-auto text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{branches.length}</span>,
    },
    {
      id: 'pulls',
      label: 'Merge Requests',
      icon: <GitPullRequest className="w-4 h-4" />,
      badge: <span className="ml-auto text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{pullCount}</span>,
    },
  ];

  return (
    <div className="flex gap-0 min-h-[500px] border border-border rounded-xl overflow-hidden bg-card">
      {/* ── sidebar ── */}
      <div className="w-52 shrink-0 border-r border-border bg-card/60 p-3 space-y-4">
        {/* repo name + branch indicator */}
        <div className="px-2 pt-1">
          <p className="text-sm font-semibold text-foreground">{repo}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <GitBranch className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{defaultBranch}</span>
          </div>
        </div>

        {/* CODE section */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1">Code</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {item.icon}
              {item.label}
              {item.badge}
            </button>
          ))}
        </div>

        {/* BUILD section */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1">Build</p>
          <button
            onClick={() => setActiveTab('pipelines')}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'pipelines'
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            Pipelines
            <span className="ml-auto">
              <CIStatusBadge status={pipelineStatus as any} conclusion={pipelineStatus === 'success' ? 'success' : pipelineStatus === 'failure' ? 'failure' : undefined} />
            </span>
          </button>
        </div>
      </div>

      {/* ── main content ── */}
      <div className="flex-1 p-5 overflow-auto">
        {activeTab === 'commits' && (
          <CommitsTab
            owner={owner}
            repo={repo}
            branches={branchNames}
            defaultBranch={defaultBranch}
          />
        )}
        {activeTab === 'branches' && (
          <BranchesTab owner={owner} repo={repo} />
        )}
        {activeTab === 'pulls' && (
          <MergeRequestsTab owner={owner} repo={repo} />
        )}
        {activeTab === 'pipelines' && (
          <PipelinesTab owner={owner} repo={repo} defaultBranch={defaultBranch} />
        )}
      </div>
    </div>
  );
};
