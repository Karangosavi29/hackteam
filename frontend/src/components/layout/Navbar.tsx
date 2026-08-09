import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { authApi } from '@/api/auth.api';
import { Users, Trophy, UserCheck, Sparkles, Bell } from 'lucide-react';

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
                <Bell className="h-4 w-4" /> Requests
              </Link>
            </>
          )}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
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