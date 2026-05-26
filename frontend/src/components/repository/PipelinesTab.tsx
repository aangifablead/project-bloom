import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2, Circle, ExternalLink, Clock } from 'lucide-react';
import { gitApi } from '@/api';
import { formatDistanceToNow } from 'date-fns';

interface PipelinesTabProps {
  owner: string;
  repo: string;
  defaultBranch: string;
}

const StepIcon: React.FC<{ status: string; conclusion: string | null }> = ({ status, conclusion }) => {
  const effective = conclusion || status;
  if (effective === 'success') return (
    <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center shrink-0">
      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    </div>
  );
  if (effective === 'failure' || effective === 'timed_out') return (
    <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center shrink-0">
      <XCircle className="w-4 h-4 text-red-400" />
    </div>
  );
  if (effective === 'in_progress' || effective === 'queued') return (
    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center shrink-0">
      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
    </div>
  );
  return (
    <div className="w-8 h-8 rounded-full bg-zinc-600/20 border border-zinc-600/40 flex items-center justify-center shrink-0">
      <Circle className="w-4 h-4 text-zinc-400" />
    </div>
  );
};

const formatDuration = (startedAt: string | null, completedAt: string | null) => {
  if (!startedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const secs = Math.round((end - start) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}m ${rem}s`;
};

export const PipelinesTab: React.FC<PipelinesTabProps> = ({ owner, repo, defaultBranch }) => {
  const { data: commitsData } = useQuery({
    queryKey: ['git', owner, repo, 'commits', defaultBranch, 1],
    queryFn: () => gitApi.getCommits(owner, repo, { page: 1, per_page: 1, sha: defaultBranch }),
  });

  const latestSha = commitsData?.[0]?.sha;
  const latestCommitMsg = commitsData?.[0]?.commit?.message?.split('\n')[0];
  const latestCommitDate = commitsData?.[0]?.commit?.author?.date;

  const hasRunning = (checks: any[]) =>
    checks.some(c => c.status === 'in_progress' || c.status === 'queued');

  const { data: checksData, isLoading } = useQuery({
    queryKey: ['git', owner, repo, 'checks', latestSha],
    queryFn: () => gitApi.getCheckRuns(owner, repo, latestSha!),
    enabled: !!latestSha,
    refetchInterval: (data) => {
      const checks = (data as any)?.check_runs || [];
      return hasRunning(checks) ? 15_000 : false;
    },
  });

  const checkRuns: any[] = checksData?.check_runs || [];

  const overallStatus = () => {
    if (!checkRuns.length) return null;
    if (checkRuns.some(c => c.status === 'in_progress' || c.status === 'queued')) return 'running';
    if (checkRuns.every(c => c.conclusion === 'success')) return 'passed';
    return 'failed';
  };

  const status = overallStatus();

  const statusHeader = () => {
    if (status === 'passed') return (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span className="font-semibold">Pipeline: <span className="text-emerald-400">Passed</span></span>
      </div>
    );
    if (status === 'failed') return (
      <div className="flex items-center gap-2">
        <XCircle className="w-5 h-5 text-red-400" />
        <span className="font-semibold">Pipeline: <span className="text-red-400">Failed</span></span>
      </div>
    );
    if (status === 'running') return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        <span className="font-semibold">Pipeline: <span className="text-blue-400">Running</span></span>
      </div>
    );
    return (
      <div className="flex items-center gap-2">
        <Circle className="w-5 h-5 text-muted-foreground" />
        <span className="font-semibold text-muted-foreground">No pipeline data</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading pipeline...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between">
        {statusHeader()}
        <div className="text-xs text-muted-foreground text-right">
          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{defaultBranch}</span>
          {latestCommitDate && (
            <span className="ml-2">{formatDistanceToNow(new Date(latestCommitDate), { addSuffix: true })}</span>
          )}
        </div>
      </div>

      {latestCommitMsg && (
        <p className="text-xs text-muted-foreground">Latest commit: <span className="text-foreground">{latestCommitMsg}</span></p>
      )}

      {checkRuns.length === 0 ? (
        <div className="border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
          No CI/CD checks configured for this repository.
        </div>
      ) : (
        <div className="space-y-2">
          {checkRuns.map((check: any) => (
            <div
              key={check.id}
              className="flex items-center gap-3 p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors"
            >
              <StepIcon status={check.status} conclusion={check.conclusion} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{check.name}</p>
                {check.output?.title && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{check.output.title}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {formatDuration(check.started_at, check.completed_at) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDuration(check.started_at, check.completed_at)}
                  </div>
                )}
                {check.html_url && (
                  <a
                    href={check.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
