import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { authApi } from '@/api/auth.api';
import { notificationApi } from '@/api/notification.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Trophy, UserCheck, Sparkles, Bell, Inbox, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll({ limit: 10 }),
    refetchInterval: 30000, // light polling — no websocket infra yet (that's Phase 6)
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markAllRead, isPending: isMarkingAll } = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-lg border shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-semibold text-sm text-slate-700">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                disabled={isMarkingAll}
                className="text-xs text-violet-600 hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-slate-50 transition-colors ${
                    !n.isRead ? 'bg-violet-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-violet-600 mt-1.5 shrink-0" />}
                    <div className={n.isRead ? 'pl-4' : ''}>
                      <p className="text-sm text-slate-700 leading-snug">{n.message || n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-800">
          <Sparkles className="h-5 w-5 text-violet-600" />
          HackTeam
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/hackathons" className="flex items-center gap-1 hover:text-violet-600 transition-colors">
            <Trophy className="h-4 w-4" /> Hackathons
          </Link>
          <Link to="/teams" className="flex items-center gap-1 hover:text-violet-600 transition-colors">
            <Users className="h-4 w-4" /> Teams
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/match" className="flex items-center gap-1 hover:text-violet-600 transition-colors">
                <UserCheck className="h-4 w-4" /> Match
              </Link>
              <Link to="/requests" className="flex items-center gap-1 hover:text-violet-600 transition-colors">
                <Inbox className="h-4 w-4" /> Requests
              </Link>
            </>
          )}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link to="/profile">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-violet-600 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  {user?.name}
                </div>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}