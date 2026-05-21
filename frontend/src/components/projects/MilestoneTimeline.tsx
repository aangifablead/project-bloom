import React, { useState } from 'react';
import { Calendar, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Milestone, projectApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export const MilestoneTimeline = ({ milestones, projectId, onUpdate }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', dueDate: '' });
  const { toast } = useToast();

  // Helper: Format ISO date string to YYYY-MM-DD for input
  const formatDateForInput = (isoString: string) => isoString ? isoString.split('T')[0] : '';

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const milestoneId = editingMilestone?.id || (editingMilestone as any)?._id;
    
    if (!milestoneId || !projectId) return;
    
    try {
      const updated = await projectApi.updateMilestone(projectId, milestoneId, formData);
      onUpdate(milestones.map(m => ((m as any).id === milestoneId || (m as any)._id === milestoneId) ? updated : m));
      setIsEditOpen(false);
      toast({ title: 'Success', description: 'Milestone updated.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update.' });
    }
  };

  const handleDelete = async (milestone: Milestone) => {
    const milestoneId = (milestone as any).id || (milestone as any)._id;
    if (!milestoneId || !projectId) return;

    try {
      await projectApi.deleteMilestone(projectId, milestoneId);
      onUpdate(milestones.filter(m => ((m as any).id || (m as any)._id) !== milestoneId));
      toast({ title: 'Success', description: 'Milestone deleted.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete.' });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {milestones.map((m) => {
          const mId = (m as any).id || (m as any)._id;
          return (
            <div key={mId} className="flex items-center justify-between border-b pb-4">
              <div>
                <h4 className="font-semibold">{m.name}</h4>
                <p className="text-sm text-muted-foreground">{m.description}</p>
                <p className="text-xs flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(m.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => { 
                  setEditingMilestone(m); 
                  setFormData({name: m.name, description: m.description || '', dueDate: formatDateForInput(m.dueDate)}); 
                  setIsEditOpen(true); 
                }}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(m)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          );
        })}
      </CardContent>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Milestone</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Name" />
            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description" />
            <Input required type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
            <Button type="submit">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};