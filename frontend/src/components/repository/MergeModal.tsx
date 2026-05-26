import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, GitMerge, Loader2 } from 'lucide-react';
import { gitApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

interface MergeModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  owner: string;
  repo: string;
  sourceBranch: string;
  branches: string[];
  onSuccess: () => void;
}

export const MergeModal: React.FC<MergeModalProps> = ({
  open, onOpenChange, owner, repo, sourceBranch, branches, onSuccess,
}) => {
  const { toast } = useToast();
  const [targetBranch, setTargetBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState(`Merge ${sourceBranch} into main`);
  const [mergeMethod, setMergeMethod] = useState('merge');
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState<{ files?: string[]; message?: string } | null>(null);

  const availableTargets = branches.filter(b => b !== sourceBranch);

  const handleTargetChange = (val: string) => {
    setTargetBranch(val);
    setCommitMessage(`Merge ${sourceBranch} into ${val}`);
    setConflict(null);
  };

  const handleMerge = async () => {
    setLoading(true);
    setConflict(null);
    try {
      const result = await gitApi.merge(owner, repo, {
        head: sourceBranch,
        base: targetBranch,
        commitMessage,
        mergeMethod,
      });

      if (result.conflict) {
        setConflict({ message: result.message });
        return;
      }

      toast({ title: 'Merged successfully', description: `SHA: ${result.sha?.slice(0, 7)}` });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Merge failed', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="w-4 h-4" />
            Merge Branch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-0.5 rounded bg-muted font-mono text-xs">{sourceBranch}</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-0.5 rounded bg-muted font-mono text-xs">{targetBranch}</span>
          </div>

          <div className="space-y-1.5">
            <Label>Target Branch</Label>
            <Select value={targetBranch} onValueChange={handleTargetChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTargets.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Merge Strategy</Label>
            <Select value={mergeMethod} onValueChange={setMergeMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merge">Merge commit</SelectItem>
                <SelectItem value="squash">Squash and merge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Commit Message</Label>
            <Input value={commitMessage} onChange={e => setCommitMessage(e.target.value)} />
          </div>

          {conflict && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/30 border border-red-800/50 text-sm text-red-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Merge conflict detected</p>
                <p className="text-xs mt-0.5 text-red-400">{conflict.message || 'Resolve conflicts before merging.'}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleMerge} disabled={loading || !!conflict}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitMerge className="w-4 h-4 mr-2" />}
            Merge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
