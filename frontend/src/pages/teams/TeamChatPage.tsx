import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { teamApi } from '@/api/team.api';
import { useAuthStore } from '@/store/auth.store';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import ChatWindow from '@/components/chat/ChatWindow';

export default function TeamChatPage() {
  const { teamId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: teamData, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamApi.getById(teamId!),
    enabled: !!teamId,
  });

  const team = teamData?.data?.team;
  const isMember = team?.members?.some((m: any) => m._id === user?._id);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[70vh] w-full rounded-xl" />
      </div>
    );
  }

  if (!team) {
    return <div className="text-center py-20 text-slate-400">Team not found.</div>;
  }

  if (!isMember) {
    return (
      <div className="text-center py-20 text-slate-400 space-y-2">
        <p>You need to be a member of this team to view its chat.</p>
        <Link to={`/teams/${teamId}`} className="text-violet-600 text-sm hover:underline">
          View public team page →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-violet-600" /> {team.name} — Chat
      </h1>

      <ChatWindow teamId={teamId!} currentUserId={user!._id} />
    </div>
  );
}