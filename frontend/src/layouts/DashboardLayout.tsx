import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Moon,
  Sun,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { setTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const checkIsActive = (href: string) => {
    if (href === '/tasks') return currentPath.includes('/tasks');
    if (href === '/projects') return currentPath.startsWith('/projects') && !currentPath.includes('/tasks');
    return currentPath.startsWith(href);
  };

  const breadcrumbs = currentPath
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: '/' + arr.slice(0, index + 1).join('/'),
    }));

  const handleAuthClick = () => {
    if (user) {
      logout();
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out h-full shrink-0',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            {sidebarOpen && <span className="text-lg font-bold text-sidebar-foreground truncate">ProjectFlow</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronRight className={cn('w-5 h-5 transition-transform', !sidebarOpen && 'rotate-180')} />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = checkIsActive(item.href);
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium truncate">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent transition-colors',
                  !sidebarOpen && 'justify-center'
                )}
              >
                {user ? (
                  <>
                    <Avatar src={user?.avatar} name={user?.name || 'User'} size="md" />
                    {sidebarOpen && (
                      <>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-sidebar-foreground truncate capitalize">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                    {sidebarOpen && (
                      <div className="flex-1 space-y-2 text-left">
                        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                        <div className="h-2 w-32 bg-muted rounded animate-pulse" />
                      </div>
                    )}
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            {user && (
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/settings/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAuthClick} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay and Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border z-50 lg:hidden flex, flex-col"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
                <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-sidebar-foreground">ProjectFlow</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="text-sidebar-foreground">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex-1 overflow-y-auto py-6 px-3">
                <ul className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = checkIsActive(item.href);
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                            isActive
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent'
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-lg shrink-0">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>

            <nav className="hidden md:flex items-center text-sm min-w-0">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">Home</Link>
              {breadcrumbs.map((crumb) => (
                <React.Fragment key={crumb.href}>
                  <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground shrink-0" />
                  <Link to={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                    {crumb.name}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="search" placeholder="Search projects..." className="pl-10 bg-muted/50 border-0 focus-visible:ring-1" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background/50">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};