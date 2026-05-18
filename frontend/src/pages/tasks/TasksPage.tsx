import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MoreHorizontal,
  GripVertical,
  CheckSquare,
  Clock,
  User2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/types';
import { tasksService, usersService } from '@/services/api';
import { PriorityBadge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const columns: { id: Task['status']; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-muted-foreground' },
  { id: 'todo', title: 'To Do', color: 'bg-primary' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-info' },
  { id: 'review', title: 'Review', color: 'bg-warning' },
  { id: 'done', title: 'Done', color: 'bg-success' },
];

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps & { style?: React.CSSProperties; listeners?: any; attributes?: any }>(
  ({ task, isDragging, style, listeners, attributes, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        {...props}
        className={cn(
          'bg-card border border-border rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all duration-200',
          isDragging && 'shadow-lg opacity-90 ring-2 ring-primary'
        )}
      >
        <div className="flex items-start gap-2">
          <div {...listeners} {...attributes}>
            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground mb-2 line-clamp-2">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge priority={task.priority} />
              {task.labels.slice(0, 2).map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: `${label.color}20`, color: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                {task.assignee && (
                  <Avatar src={task.assignee.avatar} name={task.assignee.name} size="sm" />
                )}
                {task.subtasks.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckSquare className="w-3 h-3" />
                    {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                  </span>
                )}
              </div>
              {task.dueDate && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TaskCard.displayName = 'TaskCard';

const SortableTaskCard = ({ task }: { task: Task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TaskCard
      ref={setNodeRef}
      task={task}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDragging={isDragging}
    />
  );
};

interface DroppableColumnProps {
  column: typeof columns[number];
  tasks: Task[];
}

const DroppableColumn = ({ column, tasks }: DroppableColumnProps) => {
  return (
    <div className="flex flex-col min-w-[300px] w-[300px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', column.color)} />
          <h3 className="font-semibold text-foreground">{column.title}</h3>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 space-y-3 min-h-[200px] p-2 rounded-lg bg-muted/30">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    status: 'backlog' as Task['status'],
  });
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await tasksService.getAll();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter((task) => task.status === column.id);
      return acc;
    }, {} as Record<Task['status'], Task[]>);
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overTask = tasks.find((t) => t.id === over.id);

    if (!activeTask) return;

    // If dropping over another task, get its status
    if (overTask && activeTask.status !== overTask.status) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === active.id ? { ...t, status: overTask.status } : t
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Check if dropped over a column
    const overColumn = columns.find((c) => c.id === over.id);
    if (overColumn && activeTask.status !== overColumn.id) {
      try {
        await tasksService.updateStatus(activeTask.id, overColumn.id);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === active.id ? { ...t, status: overColumn.id } : t
          )
        );
        toast({
          title: 'Task updated',
          description: `Moved to ${overColumn.title}`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update task status',
        });
      }
    }
  };

  const handleCreateTask = async () => {
    try {
      const task = await tasksService.create(newTask);
      setTasks([...tasks, task]);
      setIsCreateModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'backlog',
      });
      toast({
        title: 'Task created',
        description: `"${task.title}" has been added to backlog.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create task.',
      });
    }
  };

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop to organize your workflow
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new task</DialogTitle>
              <DialogDescription>Add a new task to your backlog.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: Task['priority']) =>
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newTask.status}
                    onValueChange={(value: Task['status']) =>
                      setNewTask({ ...newTask, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-w-max">
            {columns.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                tasks={tasksByStatus[column.id] || []}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
