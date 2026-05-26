import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isToday, isYesterday } from 'date-fns';
import { Search, ChevronDown, GitCommitHorizontal, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { gitApi } from '@/api';
import { CIStatusBadge } from './CIStatusBadge';
import { DiffViewer } from './DiffViewer';

interface CommitsTabProps {
  owner: string;
  repo: string;
  branches: string[];
  defaultBranch: string;
}

const formatDateHeader = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'M/d/yyyy');
};

const groupByDate = (commits: any[]) => {
  const groups: Record<string, any[]> = {};
  commits.forEach(c => {
    const key = format(new Date(c.commit.author.date), 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });
  return groups;
};

const AuthorAvatar: React.FC<{ name: string; avatarUrl?: string }> = ({ name, avatarUrl }) => {
  const initials = name?.slice(0, 2).toUpperCase() || '??';
  const colors = ['bg-orange-500', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-pink-500'];
  const color = colors[name?.charCodeAt(0) % colors.length] || 'bg-zinc-500';
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover" />;
  }
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  );
};

const PER_PAGE = 30;

export const CommitsTab: React.FC<CommitsTabProps> = ({ owner, repo, branches, defaultBranch }) => {
  const qc = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState(defaultBranch);
  const [page, setPage] = useState(1);
  const [allCommits, setAllCommits] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSha, setSelectedSha] = useState<string | null>(null);

  const { isLoading, isFetching } = useQuery({
    queryKey: ['git', owner, repo, 'commits', selectedBranch, page],
    queryFn: async () => {
      const data = await gitApi.getCommits(owner, repo, { page, per_page: PER_PAGE, sha: selectedBranch });
      const newCommits: any[] = Array.isArray(data) ? data : [];
      if (page === 1) setAllCommits(newCommits);
      else setAllCommits(prev => [...prev, ...newCommits]);
      // If we got fewer than PER_PAGE results, there are no more pages
      setHasMore(newCommits.length === PER_PAGE);
      return newCommits;
    },
    staleTime: 2 * 60_000,
    retry: false,
    gcTime: 0,
  });

  const { data: commitDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['git', owner, repo, 'commit', selectedSha],
    queryFn: () => gitApi.getCommit(owner, repo, selectedSha!),
    enabled: !!selectedSha,
    staleTime: 5 * 60_000,
  });

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    setPage(1);
    setAllCommits([]);
    setHasMore(true);
  };

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ['git', owner, repo, 'commits'] });
    setPage(1);
    setAllCommits([]);
    setHasMore(true);
  };

  const filtered = allCommits.filter(c =>
    c.commit.message.toLowerCase().includes(search.toLowerCase()) ||
    (c.author?.login || '').toLowerCase().includes(search.toLowerCase())
  );

  const grouped = groupByDate(filtered);

  return (
    <div className="flex flex-col gap-4">
      {/* toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search commits..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* branch selector */}
        <div className="relative">
          <select
            value={selectedBranch}
            onChange={e => handleBranchChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-md border border-border bg-background text-sm text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {branches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-xs text-muted-foreground">
          Refresh
        </Button>
      </div>

      {isLoading && allCommits.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading commits...
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateKey, commits]) => (
            <div key={dateKey}>
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">
                {formatDateHeader(commits[0].commit.author.date)}
              </p>
              <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                {commits.map((c: any) => (
                  <CommitRow
                    key={c.sha}
                    commit={c}
                    owner={owner}
                    repo={repo}
                    onClick={() => setSelectedSha(c.sha)}
                  />
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground py-8 text-sm">No commits found.</p>
          )}

          {/* Only show Load more if there might be more pages */}
          {hasMore && filtered.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={isFetching}
              >
                {isFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Load more
              </Button>
            </div>
          )}
        </div>
      )}

      {/* commit detail sheet */}
      <Sheet open={!!selectedSha} onOpenChange={open => !open && setSelectedSha(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2 text-sm font-mono">
              <GitCommitHorizontal className="w-4 h-4" />
              {selectedSha?.slice(0, 7)}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-6 space-y-4">
              {detailLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading diff...
                </div>
              ) : commitDetail ? (
                <>
                  <div>
                    <p className="font-semibold text-base">{commitDetail.commit?.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {commitDetail.commit?.author?.name} · {commitDetail.commit?.author?.date && format(new Date(commitDetail.commit.author.date), 'PPpp')}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="text-emerald-400">+{commitDetail.stats?.additions}</span>
                    <span className="text-red-400">-{commitDetail.stats?.deletions}</span>
                    <span className="text-muted-foreground">{commitDetail.files?.length} files</span>
                  </div>
                  <div className="space-y-3">
                    {commitDetail.files?.map((f: any) => (
                      <DiffViewer
                        key={f.filename}
                        filename={f.filename}
                        patch={f.patch}
                        additions={f.additions}
                        deletions={f.deletions}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// ── CommitRow ─────────────────────────────────────────────────────────────────
const CommitRow: React.FC<{ commit: any; owner: string; repo: string; onClick: () => void }> = ({
  commit: c, owner, repo, onClick,
}) => {
  const { data: checks } = useQuery({
    queryKey: ['git', owner, repo, 'checks', c.sha],
    queryFn: () => gitApi.getCheckRuns(owner, repo, c.sha),
    staleTime: 2 * 60_000,
    retry: false,
  });

  const latestCheck = checks?.check_runs?.[0];
  const authorName = c.author?.login || c.commit?.author?.name || 'Unknown';
  const avatarUrl = c.author?.avatar_url;
  const shortSha = c.sha?.slice(0, 7);

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
      <AuthorAvatar name={authorName} avatarUrl={avatarUrl} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{c.commit.message.split('\n')[0]}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {authorName}
          {c.stats && (
            <>
              {' · '}
              <span className="text-emerald-400">+{c.stats.additions}</span>
              {' '}
              <span className="text-red-400">-{c.stats.deletions}</span>
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <CIStatusBadge status={latestCheck?.status} conclusion={latestCheck?.conclusion} />
        <button
          onClick={onClick}
          className="font-mono text-xs text-blue-400 hover:text-blue-300 hover:underline"
        >
          {shortSha}
        </button>
      </div>
    </div>
  );
};
