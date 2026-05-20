import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Users,
  Settings,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Archive,
  Copy,
  Flag,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Project, Task } from '@/types';
import { projectApi, taskApi, Milestone } from '@/api';
import { StatusBadge } from '@/components/common/Badge';
import { AvatarGroup, Avatar } from '@/components/common/Avatar';
import { CardSkeleton } from '@/components/common/Skeleton';
import { useToast } from '@/hooks/use-toast';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { MilestoneTimeline } from '@/components/projects/MilestoneTimeline';

const usePermissionCheck = () => {
  return (permission: string) => true;
};

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const hasPermission = usePermissionCheck();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [projectData, tasksData, milestonesData] = await Promise.all([
          projectApi.getById(id),
          taskApi.getAll({ projectId: id }),
          projectApi.getMilestones(id),
        ]);
        setProject(projectData);
        setTasks(tasksData);
        setMilestones(milestonesData);
      } catch (error) {
        console.error('Failed to fetch project:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load project details.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!isEditModalOpen && !isDeleteDialogOpen && !isArchiveDialogOpen) {
      document.body.style.pointerEvents = 'auto';
    }
  }, [isEditModalOpen, isDeleteDialogOpen, isArchiveDialogOpen]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await projectApi.delete(id);
      toast({
        title: 'Project deleted',
        description: 'The project has been permanently deleted.',
      });
      navigate('/projects');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete project.',
      });
    }
  };

  const handleArchive = async () => {
    if (!id || !project) return;
    try {
      const updated = project.status === 'archived'
        ? await projectApi.restore(id)
        : await projectApi.archive(id);
      setProject(updated);
      toast({
        title: project.status === 'archived' ? 'Project restored' : 'Project archived',
        description: project.status === 'archived'
          ? 'The project is now active again.'
          : 'The project has been archived.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update project.',
      });
    }
    setIsArchiveDialogOpen(false);
  };

  const handleClone = async () => {
    if (!id || !project) return;
    try {
      const cloned = await projectApi.clone(id, `${project.name} (Copy)`);
      toast({
        title: 'Project cloned',
        description: `"${cloned.name}" has been created.`,
      });
      navigate(`/projects/${cloned.id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clone project.',
      });
    }
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const tasksByStatus = {
    backlog: tasks.filter(t => t.status === 'backlog').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const showClone = hasPermission('project:update');
  const showArchive = hasPermission('project:archive');
  const showDelete = hasPermission('project:delete');
  const hasDropdownItems = showClone || showArchive || showDelete;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-border pb-6">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')} className="mt-1 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight truncate">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground mt-1.5 text-sm sm:text-base line-clamp-2">{project.description}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          {hasPermission('project:update') && (
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="h-9">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}

          {hasDropdownItems && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" aria-label="More options">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 z-50">
                {showClone && (
                  <DropdownMenuItem onClick={handleClone}>
                    <Copy className="w-4 h-4 mr-2" />
                    Clone Project
                  </DropdownMenuItem>
                )}
                {showArchive && (
                  <DropdownMenuItem onClick={() => setIsArchiveDialogOpen(true)}>
                    <Archive className="w-4 h-4 mr-2" />
                    {project.status === 'archived' ? 'Restore' : 'Archive'}
                  </DropdownMenuItem>
                )}
                {showDelete && (
                  <>
                    {(showClone || showArchive) && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{project.progress}%</p>
                <p className="text-sm text-muted-foreground">Progress</p>
              </div>
            </div>
            <Progress value={project.progress} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Flag className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{project.tasksCount}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{project.completedTasksCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Array.isArray(project.members) ? project.members.length : 0}</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Layout Container */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Backlog', count: tasksByStatus.backlog, color: 'bg-muted-foreground' },
                  { label: 'To Do', count: tasksByStatus.todo, color: 'bg-primary' },
                  { label: 'In Progress', count: tasksByStatus.inProgress, color: 'bg-blue-500' },
                  { label: 'Review', count: tasksByStatus.review, color: 'bg-amber-500' },
                  { label: 'Done', count: tasksByStatus.done, color: 'bg-emerald-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="flex-1 text-sm">{item.label}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {project.endDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created By</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{project.createdBy?.name || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">
                    {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>All Tasks</CardTitle>
              <Button
                size="sm"
                onClick={() => navigate(`/projects/${project._id || project.id}/tasks`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No tasks yet. Create your first task to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 10).map((task, index) => (
                    <div
                      key={task.id || task._id || index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' :
                            task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-muted text-muted-foreground'
                          }`}>
                          {task.status}
                        </span>
                        <span className="font-medium">{task.title}</span>
                      </div>
                      {task.assignee && (
                        <Avatar src={task.assignee.avatar} name={task.assignee.name || task.assignee.email || 'Team Member'} size="sm" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <MilestoneTimeline
            milestones={milestones || []}
            projectId={project.id}
            onUpdate={setMilestones}
          />
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Team Members</CardTitle>
              {hasPermission('project:manage_members') && (
                <Button size="sm" onClick={() => navigate('/team')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(project.members || []).map((member, index) => (
                  <div
                    key={member._id || member.id || member.email || index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border"
                  >
                    <Avatar src={member.avatar} name={member.name || member.email || 'Team Member'} size="md" />
                    <div>
                      <p className="font-medium">{member.name || 'Team Member'}</p>
                      <p className="text-sm text-muted-foreground">{member.email || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <EditProjectModal
        project={project}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUpdate={handleProjectUpdate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              "{project.name}" and all associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {project.status === 'archived' ? 'Restore Project?' : 'Archive Project?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {project.status === 'archived'
                ? 'This will restore the project and make it active again.'
                : 'Archived projects are hidden from the main view but can be restored later.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              {project.status === 'archived' ? 'Restore' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};