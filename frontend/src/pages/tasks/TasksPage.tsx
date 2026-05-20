import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';

import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import {
  Plus,
  Search,
  Filter,
  GripVertical,
  MoreHorizontal,
  Trash2,
  Edit,
  Clock,
  CheckSquare,
  ArrowLeft,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Task } from '@/types';
import { taskApi } from '@/api/task.api';

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

// ======================================================
// TASK CARD
// ======================================================

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
}

const TaskCard = React.forwardRef<
  HTMLDivElement,
  TaskCardProps & {
    style?: React.CSSProperties;
    listeners?: any;
    attributes?: any;
  }
>(
  (
    {
      task,
      style,
      listeners,
      attributes,
      isDragging,
      onDelete,
      onEdit,
      ...props
    },
    ref
  ) => {
    if (!task) return null;

    const taskId = task.id || task._id;

    return (
      <div
        ref={ref}
        style={style}
        {...props}
        className={cn(
          'bg-card border border-border rounded-xl p-4 shadow-sm transition-all duration-200 group',
          isDragging && 'opacity-40 shadow-xl ring-2 ring-primary/30'
        )}
      >
        <div className="flex gap-3">
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing mt-1"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-medium text-sm line-clamp-2">
                {task.title}
              </h4>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(task)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onDelete?.(taskId)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap mt-3">
              <PriorityBadge priority={task.priority} />
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t">
              <div className="flex items-center gap-2">
                {task.assigneeId && (
                  <Avatar
                    name={(task.assigneeId as any)?.name || 'User'}
                    size="sm"
                  />
                )}

                {task.subtasks?.length > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" />

                    {
                      task.subtasks.filter((sub) => sub.completed).length
                    }/{task.subtasks.length}
                  </span>
                )}
              </div>

              {task.dueDate && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />

                  {new Date(task.dueDate).toLocaleDateString()}
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

// ======================================================
// SORTABLE CARD
// ======================================================

const SortableTaskCard = ({
  task,
  onDelete,
  onEdit,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}) => {
  const taskId = task.id || task._id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: taskId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TaskCard
      ref={setNodeRef}
      task={task}
      style={style}
      listeners={listeners}
      attributes={attributes}
      isDragging={isDragging}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
};

// ======================================================
// COLUMN
// ======================================================

const DroppableColumn = ({
  column,
  tasks,
  onDeleteTask,
  onEditTask,
}: {
  column: typeof columns[number];
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="min-w-[320px] w-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              column.color
            )}
          />

          <h3 className="font-semibold">{column.title}</h3>

          <span className="text-xs bg-muted px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="bg-muted/30 rounded-xl p-3 min-h-[500px] space-y-3"
      >
        <SortableContext
          items={tasks.map((task) => task.id || task._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id || task._id}
              task={task}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

// ======================================================
// MAIN PAGE
// ======================================================

interface TaskFormData {
  title: string;
  description: string;
  priority: Task['priority'];
  status: Task['status'];
  projectId: string;
}

export const TasksPage: React.FC = () => {
  const navigate = useNavigate();

  const { projectId } = useParams<{
    projectId: string;
  }>();

  const isProjectTasksPage = !!projectId;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [activeTask, setActiveTask] =
    useState<Task | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [taskFormData, setTaskFormData] =
    useState<TaskFormData>({
      title: '',
      description: '',
      priority: 'medium',
      status: 'backlog',
      projectId: projectId || '',
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

  // ======================================================
  // FETCH TASKS
  // ======================================================

  const fetchTasks = React.useCallback(async () => {
    try {
      setIsLoading(true);

      let data: Task[] = [];

      if (projectId) {
        data = await taskApi.getAll({
          projectId,
        });
      } else {
        data = await taskApi.getAll();
      }

      const normalized = Array.isArray(data)
        ? data.map((task) => ({
            ...task,
            id: task.id || task._id,
          }))
        : [];

      setTasks(normalized);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch tasks',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ======================================================
  // FILTERED TASKS
  // ======================================================

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) =>
      task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  // ======================================================
  // TASKS BY STATUS
  // ======================================================

  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter(
        (task) => task.status === column.id
      );

      return acc;
    }, {} as Record<Task['status'], Task[]>);
  }, [filteredTasks]);

  // ======================================================
  // DRAG START
  // ======================================================

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(
      (task) =>
        String(task.id || task._id) ===
        String(event.active.id)
    );

    if (task) setActiveTask(task);
  };

  // ======================================================
  // DRAG OVER
  // ======================================================

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const activeIndex = tasks.findIndex(
      (task) => String(task.id || task._id) === activeId
    );

    const overIndex = tasks.findIndex(
      (task) => String(task.id || task._id) === overId
    );

    if (activeIndex !== -1 && overIndex !== -1) {
      setTasks((prev) =>
        arrayMove(prev, activeIndex, overIndex)
      );
    }
  };

  // ======================================================
  // DRAG END
  // ======================================================

  const handleDragEnd = async (
    event: DragEndEvent
  ) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeTask = tasks.find(
      (task) =>
        String(task.id || task._id) === activeId
    );

    if (!activeTask) return;

    let targetStatus: Task['status'] =
      activeTask.status;

    const targetColumn = columns.find(
      (column) => column.id === overId
    );

    if (targetColumn) {
      targetStatus = targetColumn.id;
    }

    const targetTask = tasks.find(
      (task) =>
        String(task.id || task._id) === overId
    );

    if (targetTask) {
      targetStatus = targetTask.status;
    }

    const previousTasks = [...tasks];

    setTasks((prev) =>
      prev.map((task) =>
        String(task.id || task._id) === activeId
          ? {
              ...task,
              status: targetStatus,
            }
          : task
      )
    );

    if (activeTask.status !== targetStatus) {
      try {
        await taskApi.updateStatus(
          activeId,
          targetStatus
        );

        toast({
          title: 'Task Updated',
          description: `Moved to ${targetStatus}`,
        });
      } catch (error) {
        setTasks(previousTasks);

        toast({
          variant: 'destructive',
          title: 'Update Failed',
        });
      }
    }
  };

  // ======================================================
  // SAVE TASK
  // ======================================================

  const handleSaveTask = async () => {
    try {
      if (editingTask) {
        const taskId =
          editingTask.id || editingTask._id;

        const updated = await taskApi.update(
          taskId,
          taskFormData
        );

        setTasks((prev) =>
          prev.map((task) =>
            (task.id || task._id) === taskId
              ? {
                  ...updated,
                  id: taskId,
                }
              : task
          )
        );

        toast({
          title: 'Task Updated',
        });
      } else {
        const created = await taskApi.create(
          taskFormData
        );

        setTasks((prev) => [
          ...prev,
          {
            ...created,
            id: created.id || created._id,
          },
        ]);

        toast({
          title: 'Task Created',
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
      });
    }
  };

  // ======================================================
  // DELETE TASK
  // ======================================================

  const handleDeleteTask = async (
    taskId: string
  ) => {
    const rollback = [...tasks];

    setTasks((prev) =>
      prev.filter(
        (task) =>
          (task.id || task._id) !== taskId
      )
    );

    try {
      await taskApi.delete(taskId);

      toast({
        title: 'Task Deleted',
      });
    } catch (error) {
      setTasks(rollback);

      toast({
        variant: 'destructive',
        title: 'Delete Failed',
      });
    }
  };

  // ======================================================
  // OPEN CREATE MODAL
  // ======================================================

  const openCreateModal = () => {
    setEditingTask(null);

    setTaskFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'backlog',
      projectId: projectId || '',
    });

    setIsModalOpen(true);
  };

  // ======================================================
  // OPEN EDIT MODAL
  // ======================================================

  const openEditModal = (task: Task) => {
    setEditingTask(task);

    setTaskFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      projectId: projectId || '',
    });

    setIsModalOpen(true);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {isProjectTasksPage && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}

          <div>
            <h1 className="text-3xl font-bold">
              {isProjectTasksPage
                ? 'Project Tasks'
                : 'All Tasks'}
            </h1>

            <p className="text-muted-foreground mt-1">
              {isProjectTasksPage
                ? 'Manage project tasks visually'
                : 'Manage all workspace tasks'}
            </p>
          </div>
        </div>

        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* ====================================================== */}
      {/* SEARCH */}
      {/* ====================================================== */}

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <Input
            className="pl-10"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
          />
        </div>

        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* ====================================================== */}
      {/* BOARD */}
      {/* ====================================================== */}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          Loading tasks...
        </div>
      ) : (
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
                  tasks={
                    tasksByStatus[column.id] || []
                  }
                  onDeleteTask={handleDeleteTask}
                  onEditTask={openEditModal}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <TaskCard
                  task={activeTask}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* ====================================================== */}
      {/* MODAL */}
      {/* ====================================================== */}

      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask
                ? 'Edit Task'
                : 'Create Task'}
            </DialogTitle>

            <DialogDescription>
              Manage your task information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>

              <Input
                value={taskFormData.title}
                onChange={(e) =>
                  setTaskFormData({
                    ...taskFormData,
                    title: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Description</Label>

              <Textarea
                value={taskFormData.description}
                onChange={(e) =>
                  setTaskFormData({
                    ...taskFormData,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>

                <Select
                  value={taskFormData.priority}
                  onValueChange={(
                    value: Task['priority']
                  ) =>
                    setTaskFormData({
                      ...taskFormData,
                      priority: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="low">
                      Low
                    </SelectItem>

                    <SelectItem value="medium">
                      Medium
                    </SelectItem>

                    <SelectItem value="high">
                      High
                    </SelectItem>

                    <SelectItem value="urgent">
                      Urgent
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>

                <Select
                  value={taskFormData.status}
                  onValueChange={(
                    value: Task['status']
                  ) =>
                    setTaskFormData({
                      ...taskFormData,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem
                        key={column.id}
                        value={column.id}
                      >
                        {column.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setIsModalOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              onClick={handleSaveTask}
              disabled={
                !taskFormData.title.trim()
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};