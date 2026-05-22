import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Calendar,
  Users,
  FolderKanban,
  Pencil,
  Trash2,
  Settings,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,  
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Project } from '@/types';
import { projectApi } from '@/api/project.api'; // ⚡ FIX: Aligned with named export from your API file
import { CardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/Badge';
import { AvatarGroup } from '@/components/common/Avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const projectColors = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
  '#f43f5e',
];

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: projectColors[0],
  });
  const { toast } = useToast();
useEffect(() => {
  const fetchProjects = async () => {
    try {
      setIsLoading(true);

      const data = await projectApi.getAll();
      const list = Array.isArray(data) ? data : [];

      // 🔥 FIX: normalize stats WITHOUT changing UI
      const normalized = list.map((p: any) => {
        const tasks = p.tasks || [];

        const totalTasks = p.tasksCount ?? tasks.length;

        const completedTasks =
          p.completedTasksCount ??
          tasks.filter((t: any) => t.status === 'completed').length;

        const progress =
          p.progress ??
          (totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100));

        return {
          ...p,
          tasksCount: totalTasks,
          completedTasksCount: completedTasks,
          progress,
        };
      });

      setProjects(normalized);
    } catch (error) {
      console.error('Failed to fetch projects:', error);

      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load projects from server.',
      });

      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchProjects();
}, [toast]);

  const filteredProjects = projects.filter((project) =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = async () => {
    try {
      const project = await projectApi.create(newProject); // ⚡ API Binding
      setProjects([...projects, project]);
      setIsCreateModalOpen(false);
      setNewProject({ name: '', description: '', color: projectColors[0] });
      toast({
        title: 'Project created',
        description: `"${project.name}" has been created successfully.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create project.',
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await projectApi.delete(id); // ⚡ API Binding
      setProjects(projects.filter((p) => p.id !== id));
      toast({
        title: 'Project deleted',
        description: 'The project has been deleted successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete project.',
      });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your projects in one place
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new project</DialogTitle>
              <DialogDescription>
                Add a new project to start organizing your tasks.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter project description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProject({ ...newProject, color })}
                      className={cn(
                        'w-8 h-8 rounded-full transition-transform',
                        newProject.color === color && 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={!newProject.name.trim()}>
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
          action={
            !searchQuery
              ? {
                label: 'Create Project',
                onClick: () => setIsCreateModalOpen(true),
              }
              : undefined
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div
                  className="h-2"
                  style={{ backgroundColor: project.color }}
                />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Link to={`/projects/${project.id}`} className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/projects/${project.id}`}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/projects/${project.id}/settings`}>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <StatusBadge status={project.status} />
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress ?? 0}%</span>
                    </div>
                    <Progress value={project.progress ?? 0} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <AvatarGroup users={project.members || []} max={4} size="sm" />
                    <div className="text-sm text-muted-foreground">
                      {project.completedTasksCount ?? 0}/{project.tasksCount ?? 0} tasks
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-6">
                  <div
                    className="w-2 h-12 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/projects/${project.id}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                  </div>
                  <StatusBadge status={project.status} />
                  <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {project.members?.length ?? 0}
                  </div>
                  <Progress value={project.progress ?? 0} className="w-32 hidden lg:block" />
                  <div className="text-sm text-muted-foreground">
                    {project.completedTasksCount ?? 0}/{project.tasksCount ?? 0}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/projects/${project.id}`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};