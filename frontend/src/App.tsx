import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import Navbar from '@/components/layout/Navbar';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import EditProfilePage from '@/pages/profile/EditProfilePage';
import HackathonListPage from '@/pages/hackathons/HackathonListPage';
import HackathonDetailPage from '@/pages/hackathons/HackathonDetailPage';
import CreateHackathonPage from '@/pages/hackathons/CreateHackathonPage';
import TeamListPage from '@/pages/teams/TeamListPage';
import TeamDetailPage from '@/pages/teams/TeamDetailPage';
import CreateTeamPage from '@/pages/teams/CreateTeamPage';
import RequestsPage from '@/pages/requests/RequestsPage';
import MatchPage from '@/pages/match/MatchPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hackathons" element={<HackathonListPage />} />
          <Route path="/hackathons/:id" element={<HackathonDetailPage />} />
          <Route path="/teams" element={<TeamListPage />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/hackathons/create" element={<ProtectedRoute><CreateHackathonPage /></ProtectedRoute>} />
          <Route path="/teams/create" element={<ProtectedRoute><CreateTeamPage /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
          <Route path="/match" element={<ProtectedRoute><MatchPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}