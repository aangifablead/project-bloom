import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, GitBranch, ArrowUp, ArrowDown, Trash2, GitMerge, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { gitApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { MergeModal } from './MergeModal';
import { formatDistanceToNow } from 'date-fns';

interface BranchesTabProps {
  owner: string;
  repo: string;
}

const branchStatusBadge = (ahead: number, behind: number, isDefault: boolean) => {
  if (isDefault) return <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-700/40 text-xs">Default</Badge>;
  const daysSinceActive = 0; // we'd need last commit date for this
  if (ahead > 0 && behind === 0) return <Badge className="bg-blue-600/20 text-blue-400 border-blue-700/40 text-xs">Active</Badge>;
  if (behind > 3) return <Badge className="bg-amber-600/20 text-amber-400 border-amber-700/40 text-xs">Stale</Badge>;
  return <Badge className="bg-zinc-600/20 text-zinc-400 border-zinc-700/40 text-xs">Active</Badge>;
};

const BranchAvatar: React.FC<{ name: string }> = ({ name }) => {
  const colors = [
    'bg-orange-500', 'bg-purple-500', 'bg-blue-500',
    'bg-emerald-500', 'bg-pink-500', 'bg-red-500',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}>
      <GitBranch className="w-4 h-4 text-white" />
    </div>
  );
};

export const BranchesTab: React.FC<BranchesTabProps> = ({ owner, repo }) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [mergeSource, setMergeSource] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['git', owner, repo, 'branches'],
    queryFn: () => gitApi.getBranches(owner, repo),
    staleTime: 0,      // always re-fetch on mount so new branches appear
    gcTime: 0,
    retry: false,
  });

  const branches: any[] = data?.branches || [];
  const defaultBranch: string = data?.defaultBranch || 'main';
  const branchNames = branches.map((b: any) => b.name);

  const filtered = branches.filter((b: any) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await gitApi.deleteBranch(owner, repo, deleteTarget);
      toast({ title: 'Branch deleted', description: deleteTarget });
      qc.invalidateQueries({ queryKey: ['git', owner, repo, 'branches'] });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Delete failed', description: err.message });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading branches...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-foreground">{branches.length} branches</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search branches..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
        {filtered.map((branch: any) => (
          <div key={branch.name} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
            <BranchAvatar name={branch.name} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{branch.name}</span>
                {branchStatusBadge(branch.ahead, branch.behind, branch.isDefault)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {branch.commit?.commit?.author?.date
                  ? `Updated ${formatDistanceToNow(new Date(branch.commit.commit.author.date), { addSuffix: true })}`
                  : ''}
                {!branch.isDefault && ` · ${branch.ahead + branch.behind} commits`}
              </p>
            </div>

            {!branch.isDefault && (
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 text-xs">
                  <ArrowUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">{branch.ahead}</span>
                  <ArrowDown className="w-3 h-3 text-amber-400 ml-1" />
                  <span className="text-amber-400">{branch.behind}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => setMergeSource(branch.name)}
                >
                  <GitMerge className="w-3 h-3" /> Merge
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteTarget(branch.name)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">No branches found.</p>
        )}
      </div>

      {mergeSource && (
        <MergeModal
          open={!!mergeSource}
          onOpenChange={open => !open && setMergeSource(null)}
          owner={owner}
          repo={repo}
          sourceBranch={mergeSource}
          branches={branchNames}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['git', owner, repo, 'branches'] });
            qc.invalidateQueries({ queryKey: ['git', owner, repo, 'commits'] });
          }}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete branch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
