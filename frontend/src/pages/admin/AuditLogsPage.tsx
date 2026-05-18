import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  FileText,
  Settings,
  Trash2,
  Edit,
  Plus,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { teamApi, AuditLog } from '@/api';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { CardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { AdminOnly } from '@/components/rbac';

const actionIcons: Record<string, React.ElementType> = {
  'project.created': Plus,
  'project.updated': Edit,
  'project.deleted': Trash2,
  'task.created': Plus,
  'task.updated': Edit,
  'task.deleted': Trash2,
  'user.login': User,
  'user.logout': User,
  'settings.updated': Settings,
};

const actionColors: Record<string, string> = {
  created: 'bg-success/10 text-success',
  updated: 'bg-info/10 text-info',
  deleted: 'bg-destructive/10 text-destructive',
  login: 'bg-primary/10 text-primary',
  logout: 'bg-muted text-muted-foreground',
};

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await teamApi.getAuditLogs({
          action: actionFilter !== 'all' ? actionFilter : undefined,
          resource: resourceFilter !== 'all' ? resourceFilter : undefined,
        });
        setLogs(response.logs);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [actionFilter, resourceFilter]);

  const getActionBadge = (action: string) => {
    const actionType = action.split('.')[1] || action;
    const colorClass = actionColors[actionType] || 'bg-muted text-muted-foreground';
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
        {action}
      </span>
    );
  };

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredLogs = logs.filter(log => 
    log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminOnly
      fallback={
        <div className="p-6 lg:p-8">
          <EmptyState
            icon={Activity}
            title="Access Denied"
            description="You don't have permission to view audit logs."
          />
        </div>
      }
    >
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground mt-1">
              Track all system activities and changes ({total} total entries)
            </p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search logs..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No logs found"
            description="No audit logs match your current filters."
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-border"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar src={log.user.avatar} name={log.user.name} size="sm" />
                          <div>
                            <p className="font-medium text-sm">{log.user.name}</p>
                            <p className="text-xs text-muted-foreground">{log.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          {getActionBadge(log.action)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {log.resource} / {log.resourceId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {JSON.stringify(log.details).slice(0, 50)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatTime(log.createdAt)}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminOnly>
  );
};
