import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, CheckSquare, CheckCircle2, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types';
import { analyticsApi } from '@/api/analytics.api';
import { StatCardSkeleton } from '@/components/common/Skeleton';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/context/AuthContext';
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,PieChart,Pie,Cell} from 'recharts';

/* -------------------- COLOR MAP (FIXED TAILWIND ISSUE) -------------------- */
const colorMap = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  info: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
  },
  success: {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-500',
  },
} as const;

/* -------------------- STAT CARDS CONFIG -------------------- */

const statCards = [
  {
    title: 'Total Projects',
    key: 'totalProjects' as const,
    icon: FolderKanban,
    color: 'primary' as const,
    trend: '+12%',
    trendUp: true,
  },
  {
    title: 'Total Tasks',
    key: 'totalTasks' as const,
    icon: CheckSquare,
    color: 'info' as const,
    trend: '+8%',
    trendUp: true,
  },
  {
    title: 'Completed',
    key: 'completedTasks' as const,
    icon: CheckCircle2,
    color: 'success' as const,
    trend: '+23%',
    trendUp: true,
  },
  {
    title: 'Overdue',
    key: 'overdueTasks' as const,
    icon: AlertTriangle,
    color: 'warning' as const,
    trend: '-5%',
    trendUp: false,
  },
];

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

/* -------------------- COMPONENT -------------------- */

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  console.log(stats, 'statsstats')
  /* -------------------- FETCH DATA -------------------- */

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, activityData] = await Promise.all([
          analyticsApi.getDashboardStats(),
          analyticsApi.getRecentActivity(5) // Fetch the last 5
        ]);

        setStats({ ...statsData, recentActivity: activityData });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* ---------------- HEADER ---------------- */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-foreground"
        >
          Welcome back, {user?.name?.split(' ')[0]}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-1"
        >
          Here's what's happening with your projects today.
        </motion.p>
      </div>

      {/* ---------------- STATS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))
          : statCards.map((stat, index) => {
            const color = colorMap[stat.color];

            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">

                    {/* TITLE + ICON */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </span>

                      <div className={`p-2 rounded-lg ${color.bg}`}>
                        <stat.icon className={`w-5 h-5 ${color.text}`} />
                      </div>
                    </div>

                    {/* VALUE + TREND */}
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold text-foreground">
                        {stats?.[stat.key] ?? 0}
                      </div>

                      <div
                        className={`flex items-center text-sm ${stat.trendUp ? 'text-green-500' : 'text-yellow-500'
                          }`}
                      >
                        {stat.trendUp ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {stat.trend}
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </div>

      {/* ---------------- CHARTS ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* BAR CHART */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tasks by Status
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.tasksByStatus || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* PIE CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Tasks by Priority</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.tasksByPriority || []}
                      dataKey="count"
                      nameKey="priority"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                    >
                      {stats?.tasksByPriority?.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ---------------- ACTIVITY ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">

              {stats?.recentActivity?.length ? (
                stats.recentActivity.map((activity) => {
                  return (
                    <div
                      key={activity._id || activity.id}
                      className="flex items-start gap-4"
                    >
                      <Avatar
                        src={activity.userId?.avatar || ''}
                        name={activity.userId?.name || 'System'}
                        size="md"
                      />

                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {activity.message}
                        </p>

                        <span className="text-xs text-muted-foreground/70">
                          {new Date(
                            activity.createdAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
};