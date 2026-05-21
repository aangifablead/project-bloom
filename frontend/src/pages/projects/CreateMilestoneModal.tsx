import { useState } from 'react';
import { projectApi, Milestone } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const CreateMilestoneModal = ({ projectId, open, onClose, onSuccess }) => {
  const [data, setData] = useState({
    name: '',
    description: '',
    dueDate: '',
    status: 'pending' as Milestone['status'] // Cast this to the expected union type
  }); const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !data.name || !data.dueDate) return;

    try {
      await projectApi.createMilestone(projectId, data);
      setData({ name: '', description: '', dueDate: '', status: 'pending' });
      onSuccess();
      toast({ title: 'Success', description: 'Milestone created.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Milestone</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input required placeholder="Name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
          <Input placeholder="Description" value={data.description} onChange={e => setData({ ...data, description: e.target.value })} />
          <Input required type="date" value={data.dueDate} onChange={e => setData({ ...data, dueDate: e.target.value })} />
          <Button type="submit">Save Milestone</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};