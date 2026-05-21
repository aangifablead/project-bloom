import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { projectApi, teamApi } from '@/api';

interface AddMemberModalProps {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ projectId, isOpen, onClose, onSuccess }) => {
    const [allTeamMembers, setAllTeamMembers] = useState<any[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const team = await teamApi.getAll();
                    setAllTeamMembers(team);
                    const currentMembers = await projectApi.getMembers(projectId);
                    const existingUserIds = currentMembers.filter((m: any) => m.user?._id).map((m: any) => m.user._id);
                    setSelectedUserIds(existingUserIds);
                } catch (error) {
                    console.error('Failed to fetch members:', error);
                }
            };
            fetchData();
        }
    }, [isOpen, projectId]);

    const handleToggleMember = (userId: string) => {
        setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    const handleSave = async () => {
        if (selectedUserIds.length === 0) {
            toast({ variant: 'destructive', title: 'Action Required', description: 'You must select at least one team member.' });
            return;
        }
        try {
            const currentMembers = await projectApi.getMembers(projectId);
            const existingIds = currentMembers.map((m: any) => m.user?._id || m.user);
            const newMembersToAdd = selectedUserIds.filter(id => !existingIds.includes(id));
            const membersToRemove = existingIds.filter(id => !selectedUserIds.includes(id));

            await Promise.all([
                ...newMembersToAdd.map(uId => projectApi.addMember(projectId, { userId: uId, role: 'member' })),
                ...membersToRemove.map(uId => projectApi.removeMember(projectId, uId))
            ]);

            toast({ title: 'Success', description: 'Members updated.' });
            onSuccess();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update members.' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>Manage Project Members</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4 max-h-[300px] overflow-y-auto">
                    {allTeamMembers.map((user) => {
                        const userId = user.id || user._id;
                        return (
                            <div key={userId} className="flex items-center space-x-2">
                                <Checkbox id={userId} checked={selectedUserIds.includes(userId)} onCheckedChange={() => handleToggleMember(userId)} />
                                <Label htmlFor={userId}>{user.name || user.email}</Label>
                            </div>
                        );
                    })}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};