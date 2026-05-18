import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Clock,
  MessageSquare,
  UserPlus,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Notification } from '@/types';
import { notificationApi } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/common/EmptyState';
import { CardSkeleton } from '@/components/common/Skeleton';
import { cn } from '@/lib/utils';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationApi.getAll({ unreadOnly: filter === 'unread' });
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [filter]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_assigned':
        return <UserPlus className="w-5 h-5 text-primary" />;
      case 'comment_added':
        return <MessageSquare className="w-5 h-5 text-info" />;
      case 'mention':
        return <Bell className="w-5 h-5 text-warning" />;
      case 'deadline':
        return <Calendar className="w-5 h-5 text-destructive" />;
      case 'project_update':
        return <AlertCircle className="w-5 h-5 text-success" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark notification as read.',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast({
        title: 'All caught up!',
        description: 'All notifications marked as read.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark all as read.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast({
        title: 'Notification deleted',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete notification.',
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationApi.clearAll();
      setNotifications([]);
      toast({
        title: 'Notifications cleared',
        description: 'All notifications have been removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clear notifications.',
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You\'re all caught up!'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={filter === 'unread' ? "You've read all your notifications" : "You don't have any notifications yet"}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                'transition-colors',
                !notification.read && 'border-primary/50 bg-primary/5'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      notification.read ? 'bg-muted' : 'bg-primary/10'
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={cn(
                            'text-sm',
                            notification.read ? 'text-foreground' : 'font-semibold text-foreground'
                          )}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        {notification.link && (
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
