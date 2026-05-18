import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Milestone, projectApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Can } from '@/components/rbac';
import { cn } from '@/lib/utils';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  projectId: string;
  onUpdate: (milestones: Milestone[]) => void;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  projectId,
  onUpdate,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    dueDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-info" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'border-success bg-success/10';
      case 'in-progress':
        return 'border-info bg-info/10';
      default:
        return 'border-muted-foreground bg-muted';
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const milestone = await projectApi.createMilestone(projectId, {
        name: newMilestone.name,
        description: newMilestone.description,
        dueDate: newMilestone.dueDate,
        status: 'pending',
      });
      onUpdate([...milestones, milestone]);
      setIsCreateModalOpen(false);
      setNewMilestone({ name: '', description: '', dueDate: '' });
      toast({
        title: 'Milestone created',
        description: `"${milestone.name}" has been added.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create milestone.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (milestone: Milestone, newStatus: Milestone['status']) => {
    try {
      const updated = await projectApi.updateMilestone(projectId, milestone.id, { status: newStatus });
      onUpdate(milestones.map(m => m.id === milestone.id ? updated : m));
      toast({
        title: 'Status updated',
        description: `"${milestone.name}" is now ${newStatus}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update milestone.',
      });
    }
  };

  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Milestones</CardTitle>
        <Can permission="project:update">
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>
        </Can>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No milestones yet. Add milestones to track project progress.
          </p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {sortedMilestones.map((milestone, index) => (
                <div key={milestone.id} className="relative flex gap-4 pl-4">
                  {/* Timeline node */}
                  <div
                    className={cn(
                      'relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      getStatusColor(milestone.status)
                    )}
                  >
                    {getStatusIcon(milestone.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{milestone.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {milestone.description}
                        </p>
                      )}
                      <Can permission="project:update">
                        <div className="flex gap-2">
                          {milestone.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(milestone, 'completed')}
                            >
                              Mark Complete
                            </Button>
                          )}
                          {milestone.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(milestone, 'in-progress')}
                            >
                              Start
                            </Button>
                          )}
                        </div>
                      </Can>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>
              Create a new milestone to track project progress.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newMilestone.name}
                  onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                  placeholder="e.g., MVP Release"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  placeholder="What needs to be achieved?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !newMilestone.name.trim()}>
                Create Milestone
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
