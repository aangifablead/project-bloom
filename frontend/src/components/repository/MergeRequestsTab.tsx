import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GitPullRequest, GitMerge, XCircle, Loader2, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { gitApi } from '@/api';
import { DiffViewer } from './DiffViewer';
import { MergeModal } from './MergeModal';
import { formatDistanceToNow } from 'date-fns';

interface MergeRequestsTabProps {
  owner: string;
  repo: string;
}

const PRStatusBadge: React.FC<{ state: string; merged: boolean }> = ({ state, merged }) => {
  if (merged) return <Badge className="bg-purple-600/20 text-purple-400 border-purple-700/40 text-xs gap-1"><GitMerge className="w-3 h-3" />Merged</Badge>;
  if (state === 'open') return <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-700/40 text-xs gap-1"><GitPullRequest className="w-3 h-3" />Open</Badge>;
  return <Badge className="bg-zinc-600/20 text-zinc-400 border-zinc-700/40 text-xs gap-1"><XCircle className="w-3 h-3" />Closed</Badge>;
};

export const MergeRequestsTab: React.FC<MergeRequestsTabProps> = ({ owner, repo }) => {
  const [stateFilter, setStateFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [selectedPR, setSelectedPR] = useState<number | null>(null);
  const [mergeSource, setMergeSource] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: pulls = [], isLoading } = useQuery({
    queryKey: ['git', owner, repo, 'pulls', stateFilter],
    queryFn: () => gitApi.getPulls(owner, repo, stateFilter),
  });

  const { data: prDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['git', owner, repo, 'pull', selectedPR],
    queryFn: () => gitApi.getPull(owner, repo, selectedPR!),
    enabled: !!selectedPR,
  });

  const { data: branchData } = useQuery({
    queryKey: ['git', owner, repo, 'branches'],
    queryFn: () => gitApi.getBranches(owner, repo),
  });
  const branchNames: string[] = (branchData?.branches || []).map((b: any) => b.name);

  if (selectedPR) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedPR(null)}>
          <ChevronLeft className="w-4 h-4" /> Back to Merge Requests
        </Button>

        {detailLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : prDetail ? (
          <PRDetailView
            pr={prDetail}
            owner={owner}
            repo={repo}
            branchNames={branchNames}
            onMerge={() => setMergeSource(prDetail.head?.ref)}
            onMergeSuccess={() => {
              qc.invalidateQueries({ queryKey: ['git', owner, repo, 'pulls'] });
              setSelectedPR(null);
            }}
          />
        ) : null}

        {mergeSource && (
          <MergeModal
            open={!!mergeSource}
            onOpenChange={open => !open && setMergeSource(null)}
            owner={owner}
            repo={repo}
            sourceBranch={mergeSource}
            branches={branchNames}
            onSuccess={() => {
              qc.invalidateQueries({ queryKey: ['git', owner, repo, 'pulls'] });
              setSelectedPR(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['open', 'closed', 'all'] as const).map(s => (
          <Button
            key={s}
            size="sm"
            variant={stateFilter === s ? 'secondary' : 'ghost'}
            className="capitalize"
            onClick={() => setStateFilter(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
          {(pulls as any[]).map((pr: any) => (
            <div
              key={pr.number}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setSelectedPR(pr.number)}
            >
              <GitPullRequest className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">{pr.title}</span>
                  <PRStatusBadge state={pr.state} merged={pr.merged_at !== null} />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono text-xs bg-muted px-1 rounded">{pr.head?.ref}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-mono text-xs bg-muted px-1 rounded">{pr.base?.ref}</span>
                  <span className="ml-1">· {pr.user?.login} · {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">#{pr.number}</span>
            </div>
          ))}
          {(pulls as any[]).length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">No merge requests found.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ── PR Detail ─────────────────────────────────────────────────────────────────
const PRDetailView: React.FC<{
  pr: any; owner: string; repo: string; branchNames: string[];
  onMerge: () => void; onMergeSuccess: () => void;
}> = ({ pr, onMerge }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const stats = pr.files?.reduce(
    (acc: any, f: any) => ({ additions: acc.additions + f.additions, deletions: acc.deletions + f.deletions }),
    { additions: 0, deletions: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{pr.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <PRStatusBadge state={pr.state} merged={pr.merged_at !== null} />
            <span>{pr.user?.login}</span>
            <span>·</span>
            <span className="font-mono bg-muted px-1 rounded">{pr.head?.ref}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="font-mono bg-muted px-1 rounded">{pr.base?.ref}</span>
          </div>
        </div>
        {pr.state === 'open' && (
          <Button size="sm" className="gap-1 shrink-0" onClick={onMerge}>
            <GitMerge className="w-4 h-4" /> Merge
          </Button>
        )}
      </div>

      {/* stats bar */}
      <div className="flex gap-3 text-sm">
        <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">
          {pr.commits} commits ahead
        </span>
        <span className="px-2 py-1 rounded bg-emerald-950/40 text-emerald-400 text-xs">
          +{stats?.additions} additions
        </span>
        <span className="px-2 py-1 rounded bg-red-950/40 text-red-400 text-xs">
          -{stats?.deletions} deletions
        </span>
        <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">
          {pr.files?.length} files changed
        </span>
      </div>

      <Tabs defaultValue="files">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files Changed</TabsTrigger>
          <TabsTrigger value="commits">Commits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {pr.body || 'No description provided.'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <div className="flex gap-4 h-[500px]">
            {/* file list */}
            <div className="w-56 shrink-0 border border-border rounded-lg overflow-hidden">
              <ScrollArea className="h-full">
                {pr.files?.map((f: any) => (
                  <button
                    key={f.filename}
                    onClick={() => setSelectedFile(f.filename)}
                    className={`w-full text-left px-3 py-2 text-xs font-mono truncate hover:bg-muted/50 transition-colors border-b border-border last:border-0 flex items-center justify-between gap-1 ${selectedFile === f.filename ? 'bg-muted' : ''}`}
                  >
                    <span className="truncate">{f.filename.split('/').pop()}</span>
                    <span className="shrink-0">
                      <span className="text-emerald-400">+{f.additions}</span>
                      {' '}
                      <span className="text-red-400">-{f.deletions}</span>
                    </span>
                  </button>
                ))}
              </ScrollArea>
            </div>

            {/* diff panel */}
            <div className="flex-1 overflow-auto">
              {selectedFile ? (
                (() => {
                  const file = pr.files?.find((f: any) => f.filename === selectedFile);
                  return file ? (
                    <DiffViewer
                      filename={file.filename}
                      patch={file.patch}
                      additions={file.additions}
                      deletions={file.deletions}
                    />
                  ) : null;
                })()
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Select a file to view diff
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="commits" className="mt-4">
          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
            {pr.commits_url && (
              <p className="text-xs text-muted-foreground p-4">
                {pr.commits} commit{pr.commits !== 1 ? 's' : ''} in this merge request.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
