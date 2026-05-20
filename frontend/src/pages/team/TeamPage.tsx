import React, { useEffect, useMemo, useState } from 'react';
import { socket } from "@/socket";
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Mail, MoreHorizontal, Pencil, Search, Trash2, UserPlus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { User } from '@/types';
import { teamApi } from '@/api/team.api';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { CardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

type ModalMode = 'add' | 'edit' | 'profile' | null;
type TeamUser = User & { status?: 'active' | 'pending' };
type FormDataType = {
  id?: string;
  name: string;
  email: string;
  role: User['role'];
  avatar: string;
};

const initialFormState: FormDataType = {
  name: '',
  email: '',
  role: 'member',
  avatar: '',
};

const getUserId = (user: Partial<User>) => {
  return user.id || user._id || '';
};

export const TeamPage: React.FC = () => {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [formData, setFormData] = useState<FormDataType>(initialFormState);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleInviteUpdated = (data: any) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.email === data.email ? { ...u, status: data.status } : u
        )
      );

      toast({
        title: `Team updated`,
        description: `${data.email} is now ${data.status}`,
      });
    };

    socket.on("team:invite-updated", handleInviteUpdated);

    return () => {
      socket.off("team:invite-updated", handleInviteUpdated);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      const [members, invites] = await Promise.all([
        teamApi.getAll(),
        teamApi.getInvites(),
      ]);

      const formattedMembers = (members || []).map((member: any) => ({
        ...member,
        status: 'active',
      }));

      const formattedInvites = (invites || []).map((invite: any) => ({
        ...invite,
        status: 'pending',
      }));

      setUsers([...formattedMembers, ...formattedInvites]);
    } catch (error) {
      console.error(error);

      toast({
        variant: 'destructive',
        title: 'Failed to fetch team data',
      });

      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return users.filter((user) => {
      const name = user?.name?.toLowerCase?.() || '';
      const email = user?.email?.toLowerCase?.() || '';

      return name.includes(query) || email.includes(query);
    });
  }, [users, searchQuery]);

   const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setModalMode('add');
  };

  const handleOpenEditModal = (user: TeamUser) => {
    setSelectedUser(user);

    setFormData({
      id: getUserId(user),
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'member',
      avatar: user?.avatar || '',
    });

    setModalMode('edit');
  };

  const handleOpenProfileModal = (user: TeamUser) => {
    setSelectedUser(user);
    setModalMode('profile');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedUser(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Please fill all required fields',
      });

      return;
    }

    // ADD MEMBER
    if (modalMode === 'add') {
      const rollback = [...users];

      const optimisticUser: TeamUser = {
        id: String(Date.now()),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: formData.avatar,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      setUsers((prev) => [optimisticUser, ...prev]);

      try {
        await teamApi.invite({
          name: formData.name,
          email: formData.email,
          role: formData.role,
        });

        toast({ title: 'Member invited successfully' });
        handleCloseModal();
        fetchUsers();
      } catch (error: any) {
        console.error(error);
        setUsers(rollback);
        toast({
          variant: 'destructive',
          title: error?.response?.data?.message || 'Failed to invite member',
        });
      }
    }

    // UPDATE MEMBER
    if (modalMode === 'edit' && selectedUser) {
      const rollback = [...users];

      setUsers((prev) =>
        prev.map((user) =>
          getUserId(user) === formData.id
            ? {
                ...user,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                avatar: formData.avatar,
              }
            : user
        )
      );

      try {
        await teamApi.update(String(formData.id), {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          avatar: formData.avatar,
        });

        toast({ title: 'Member updated successfully' });
        handleCloseModal();
        fetchUsers();
      } catch (error: any) {
        console.error(error);
        setUsers(rollback);
        toast({
          variant: 'destructive',
          title: error?.response?.data?.message || 'Update failed',
        });
      }
    }
  };

const handleDeleteMember = async (user: TeamUser) => {
  const rollback = [...users];

  // 1. Optimistic UI update
  setUsers((prev) =>
    prev.filter((item) => getUserId(item) !== getUserId(user))
  );

  try {
    if (user.status === 'pending') {
      await teamApi.cancelInvite(String(getUserId(user)));
      toast({ title: 'Invite cancelled successfully' });
    } else {
      await teamApi.remove(String(getUserId(user)));
      toast({ title: 'Member deleted successfully' });
    }

    // 2. CRITICAL FIX: Fetch fresh data from the server 
    // to ensure the record is truly gone before a new invite is attempted.
    await fetchUsers();
    
  } catch (error: any) {
    console.error(error);
    setUsers(rollback);
    toast({
      variant: 'destructive',
      title: error?.response?.data?.message || 'Delete failed',
    });
  }
};

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your team members and invitations
          </p>
        </div>

        <Button onClick={handleOpenAddModal} className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search members..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* USER GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No team members found"
          description={
            searchQuery ? 'Try adjusting your search' : 'Start by adding members'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((user, index) => {
            const userName = user?.name || 'Unknown User';

            return (
              <motion.div
                key={getUserId(user) || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <Card className="border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <Avatar src={user?.avatar} name={userName} size="xl" />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => handleOpenProfileModal(user)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          {user.status !== 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleOpenEditModal(user)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Member
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => handleDeleteMember(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {user.status === 'pending'
                              ? 'Cancel Invite'
                              : 'Delete Member'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="truncate text-lg font-semibold">
                      {userName}
                    </h3>
                    <div className="mb-4 mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{user?.email}</span>
                    </div>

                    <Badge
                      variant={
                        user.status === 'pending'
                          ? 'secondary'
                          : (getRoleBadgeVariant(user.role) as any)
                      }
                      className="capitalize"
                    >
                      {user.status === 'pending' ? 'Pending' : user.role}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {(modalMode === 'add' || modalMode === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {modalMode === 'add' ? 'Add Member' : 'Edit Member'}
                </h2>
                <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as User['role'],
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {modalMode === 'add' ? 'Invite Member' : 'Update Member'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROFILE MODAL */}
      <AnimatePresence>
        {modalMode === 'profile' && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Profile</h2>
                <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col items-center text-center">
                <Avatar
                  src={selectedUser.avatar}
                  name={selectedUser.name}
                  size="xl"
                />
                <h3 className="mt-4 text-xl font-semibold">
                  {selectedUser.name}
                </h3>
                <p className="mt-2 text-muted-foreground">{selectedUser.email}</p>
                <div className="mt-4">
                  <Badge className="capitalize">
                    {selectedUser.status === 'pending'
                      ? 'Pending'
                      : selectedUser.role}
                  </Badge>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};