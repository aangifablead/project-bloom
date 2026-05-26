import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LinkRepoModal } from './LinkRepoModal';
import { RepoTabs } from '@/components/repository/RepoTabs';
import { GitBranch, Settings } from 'lucide-react';

interface RepositoryViewProps {
  projectId: string;
  owner?: string;
  repo?: string;
  onRefresh: () => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
  projectId, owner, repo, onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!owner || !repo) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-border rounded-xl text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <GitBranch className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">No repository linked</p>
          <p className="text-sm text-muted-foreground mt-1">
            Connect a GitHub repository to view commits, branches, and pipelines.
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsModalOpen(true)}>
          Link Repository
        </Button>
        <LinkRepoModal
          projectId={projectId}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={() => { setIsModalOpen(false); onRefresh(); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Change repo button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground gap-1.5"
          onClick={() => setIsModalOpen(true)}
        >
          <Settings className="w-3.5 h-3.5" />
          Change Repository
        </Button>
      </div>

      <RepoTabs owner={owner} repo={repo} />

      <LinkRepoModal
        projectId={projectId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        currentOwner={owner}
        currentRepo={repo}
        onSuccess={() => { setIsModalOpen(false); onRefresh(); }}
      />
    </div>
  );
};
