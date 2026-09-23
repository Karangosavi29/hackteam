import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/api/team.api';
import { requestApi } from '@/api/request.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Users, ArrowLeft, LogOut, UserMinus, Send, LayoutDashboard } from 'lucide-react';
import { getRoleBadgeColor } from '@/lib/utils';
import { useState } from 'react';

export default function TeamDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamApi.getById(id!),
    enabled: !!id,
  });

  const team = data?.data?.team;
  const isLeader = user?._id === team?.leader?._id;
  const isMember = team?.members?.some((m: any) => m._id === user?._id);

  const { mutate: sendRequest, isPending: isSending } = useMutation({
    mutationFn: () => requestApi.send({ type: 'join', teamId: id!, message }),
    onSuccess: () => {
      alert('Join request sent!');
      setMessage('');
    },
    onError: (err: any) => alert(err?.response?.data?.message || 'Failed to send request'),
  });

  const { mutate: leaveTeam } = useMutation({
    mutationFn: () => teamApi.leave(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      navigate('/teams');
    },
  });

  const { mutate: removeMember } = useMutation({
    mutationFn: (memberId: string) => teamApi.removeMember(id!, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', id] }),
  });

  const { mutate: disbandTeam } = useMutation({
    mutationFn: () => teamApi.disband(id!),
    onSuccess: () => navigate('/teams'),
  });

  if (isLoading) return (
    <div className="max-w-3xl mx-auto py-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );

  if (!team) return (
    <div className="text-center py-20 text-slate-400">Team not found.</div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-4">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Team Header */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{team.name}</h1>
              {team.hackathon && (
                <Link to={`/hackathons/${team.hackathon._id}`}
                  className="text-sm text-violet-600 hover:underline mt-1 block">
                  {team.hackathon.title}
                </Link>
              )}
              <Badge
                variant="outline"
                className={`mt-2 ${team.isOpen ? 'border-green-300 text-green-600' : 'border-slate-200 text-slate-400'}`}
              >
                {team.isOpen ? '● Open' : '● Closed'}
              </Badge>
            </div>

            {/* Leader actions */}
            {isLeader && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => confirm('Disband this team?') && disbandTeam()}
              >
                Disband Team
              </Button>
            )}
          </div>

          {isMember && (
            <Link to={`/teams/${id}/dashboard`} className="mt-3 inline-block">
              <Button size="sm" variant="outline" className="gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" /> Open Team Dashboard
              </Button>
            </Link>
          )}

          {team.description && (
            <p className="text-slate-600 mt-3 text-sm leading-relaxed">{team.description}</p>
          )}
          {team.projectIdea && (
            <div className="mt-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
              <p className="text-xs text-violet-500 font-medium mb-1">Project Idea</p>
              <p className="text-sm text-slate-700">{team.projectIdea}</p>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Members */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({team.members?.length}/{team.maxSize})
          </h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {team.members?.map((member: any) => (
            <div key={member._id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold">
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link to={`/profile/${member._id}`}
                      className="text-sm font-medium text-slate-800 hover:text-violet-600">
                      {member.name}
                    </Link>
                    {member._id === team.leader._id && (
                      <Crown className="h-3.5 w-3.5 text-amber-500" />
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Skills preview */}
              <div className="hidden sm:flex flex-wrap gap-1 max-w-xs justify-end">
                {member.skills?.slice(0, 3).map((s: string) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>

              {/* Leader can remove non-leader members */}
              {isLeader && member._id !== team.leader._id && (
                <button
                  onClick={() => confirm(`Remove ${member.name}?`) && removeMember(member._id)}
                  className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Required Roles */}
      {team.requiredRoles?.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-slate-600 mb-2">Looking for:</p>
            <div className="flex flex-wrap gap-2">
              {team.requiredRoles.map((role: string) => (
                <span key={role} className={`text-sm px-3 py-1 rounded-full font-medium ${getRoleBadgeColor(role)}`}>
                  {role}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join Request */}
      {!isMember && user && team.isOpen && (
        <Card className="shadow-sm border-violet-100">
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">Want to join this team?</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself — your skills, what you bring to the team..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
            <Button
              onClick={() => sendRequest()}
              disabled={isSending}
              className="w-full bg-violet-600 hover:bg-violet-700 gap-1"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Sending...' : 'Send Join Request'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Leave Team */}
      {isMember && !isLeader && (
        <Button
          variant="outline"
          className="w-full text-red-500 border-red-200 hover:bg-red-50 gap-1"
          onClick={() => confirm('Leave this team?') && leaveTeam()}
        >
          <LogOut className="h-4 w-4" /> Leave Team
        </Button>
      )}
    </div>
  );
}