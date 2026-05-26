import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { projectApi } from '@/api';
import { Loader2, GitBranch } from 'lucide-react';

interface LinkRepoModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
  currentOwner?: string;
  currentRepo?: string;
}

export const LinkRepoModal = ({
  projectId, open, onOpenChange, onSuccess,
  currentOwner, currentRepo,
}: LinkRepoModalProps) => {
  const [repoInput, setRepoInput] = useState(
    currentOwner && currentRepo ? `${currentOwner}/${currentRepo}` : ''
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRelink = !!(currentOwner && currentRepo);

  const handleLink = async () => {
    setError('');
    const parts = repoInput.trim().split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setError('Please use the format: owner/repo  (e.g. aangifablead/project-bloom)');
      return;
    }
    const [owner, repo] = parts;
    setLoading(true);
    try {
      await projectApi.update(projectId, { repoOwner: owner, repoName: repo } as any);
      // Clear backend cache for old and new repo
      await fetch('http://localhost:5000/api/git/cache/clear', { method: 'POST' }).catch(() => {});
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to link repository.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            {isRelink ? 'Change Repository' : 'Link GitHub Repository'}
          </DialogTitle>
          <DialogDescription>
            Enter the GitHub repository in <code className="text-xs bg-muted px-1 rounded">owner/repo</code> format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {isRelink && (
            <p className="text-xs text-muted-foreground">
              Currently linked: <span className="font-mono text-foreground">{currentOwner}/{currentRepo}</span>
            </p>
          )}
          <div className="space-y-1.5">
            <Label>Repository</Label>
            <Input
              placeholder="e.g. aangifablead/project-bloom"
              value={repoInput}
              onChange={e => { setRepoInput(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLink()}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleLink} disabled={loading || !repoInput.trim()}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isRelink ? 'Update Repository' : 'Link Repository'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
