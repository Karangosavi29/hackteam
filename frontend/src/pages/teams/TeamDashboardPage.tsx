import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/api/team.api';
import { matchApi } from '@/api/match.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Crown, Users, ArrowLeft, CheckCircle2, AlertTriangle, Gauge,
    MessageSquare, ListTodo, Bell, CalendarClock, UserMinus, Repeat,
} from 'lucide-react';
import { getRoleBadgeColor, formatDate, getScoreColor } from '@/lib/utils';
import { useState } from 'react';
import { taskApi } from '@/api/task.api';

export default function TeamDashboardPage() {
    const { teamId } = useParams();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [transferTo, setTransferTo] = useState('');

    const { data: teamData, isLoading: loadingTeam, isError: teamError, refetch: refetchTeam } = useQuery({
        queryKey: ['team', teamId],
        queryFn: () => teamApi.getById(teamId!),
        enabled: !!teamId,
    });

    const team = teamData?.data?.team;
    const isLeader = user?._id === team?.leader?._id;
    const isMember = team?.members?.some((m: any) => m._id === user?._id);

    const { data: coverageData, isLoading: loadingCoverage, isError: coverageError } = useQuery({
        queryKey: ['match', 'team-coverage', teamId],
        queryFn: () => matchApi.getTeamSkillCoverage(teamId!),
        enabled: !!teamId,
    });

    const coverage = coverageData?.data;
    const { data: tasksData } = useQuery({
        queryKey: ['tasks', teamId],
        queryFn: () => taskApi.getForTeam(teamId!),
        enabled: !!teamId,
    });
    const tasks = tasksData?.data?.tasks || [];
    const doneCount = tasks.filter((t) => t.status === 'DONE').length;

    const { mutate: removeMember } = useMutation({
        mutationFn: (memberId: string) => teamApi.removeMember(teamId!, memberId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', teamId] }),
    });

    const { mutate: disbandTeam } = useMutation({
        mutationFn: () => teamApi.disband(teamId!),
        onSuccess: () => navigate('/teams'),
    });

    const { mutate: transferLeadership, isPending: isTransferring } = useMutation({
        mutationFn: () => teamApi.transferLeadership(teamId!, transferTo),
        onSuccess: () => {
            setTransferTo('');
            queryClient.invalidateQueries({ queryKey: ['team', teamId] });
        },
        onError: (err: any) => alert(err?.response?.data?.message || 'Failed to transfer leadership'),
    });

    if (loadingTeam) {
        return (
            <div className="max-w-5xl mx-auto py-8 space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (teamError) {
        return (
            <div className="text-center py-20 text-slate-400">
                <p className="mb-3">Unable to load this team.</p>
                <button onClick={() => refetchTeam()} className="text-violet-600 text-sm hover:underline">
                    Try Again
                </button>
            </div>
        );
    }

    if (!team) {
        return <div className="text-center py-20 text-slate-400">Team not found.</div>;
    }

    if (!isMember) {
        return (
            <div className="text-center py-20 text-slate-400 space-y-2">
                <p>You need to be a member of this team to view its dashboard.</p>
                <Link to={`/teams/${teamId}`} className="text-violet-600 text-sm hover:underline">
                    View public team page →
                </Link>
            </div>
        );
    }

    // Days until the nearer of start/end date, for the "Upcoming Deadline" stat
    const now = new Date();
    const startDate = team.hackathon?.startDate ? new Date(team.hackathon.startDate) : null;
    const endDate = (team.hackathon as any)?.endDate ? new Date((team.hackathon as any).endDate) : null;
    const targetDate = startDate && startDate > now ? startDate : endDate;
    const daysLeft = targetDate ? Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / 86400000)) : null;
    const deadlineLabel = startDate && startDate > now ? 'Until hackathon starts' : 'Until hackathon ends';

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{team.name}</h1>
                    {team.hackathon && (
                        <Link
                            to={`/hackathons/${team.hackathon._id}`}
                            className="text-sm text-violet-600 hover:underline mt-1 inline-block"
                        >
                            {team.hackathon.title}
                        </Link>
                    )}
                </div>
                <div className="flex gap-2">
                    <Link to={`/teams/${teamId}`}>
                        <Button variant="outline" size="sm">Public Team Page</Button>
                    </Link>
                    {isLeader && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => confirm('Disband this team? This cannot be undone.') && disbandTeam()}
                        >
                            Disband Team
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3">
                        <p className="text-xs text-slate-400 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Members</p>
                        <p className="text-xl font-bold text-slate-800 mt-1">{team.members.length}/{team.maxSize}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3">
                        <p className="text-xs text-slate-400 flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> Compatibility</p>
                        {loadingCoverage ? (
                            <Skeleton className="h-6 w-14 mt-1" />
                        ) : (
                            <p className={`text-xl font-bold mt-1 ${coverage?.compatibilityScore != null ? getScoreColor(coverage.compatibilityScore).split(' ')[0] : 'text-slate-400'}`}>
                                {coverage?.compatibilityScore != null ? `${coverage.compatibilityScore}%` : '—'}
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3">
                        <p className="text-xs text-slate-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Skill Coverage</p>
                        {loadingCoverage ? (
                            <Skeleton className="h-6 w-14 mt-1" />
                        ) : (
                            <p className={`text-xl font-bold mt-1 ${coverage ? getScoreColor(coverage.percentage).split(' ')[0] : 'text-slate-400'}`}>
                                {coverage ? `${coverage.percentage}%` : '—'}
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-3">
                        <p className="text-xs text-slate-400 flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {deadlineLabel}</p>
                        <p className="text-xl font-bold text-slate-800 mt-1">
                            {daysLeft != null ? `${daysLeft}d` : '—'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Overview */}
                <Card className="shadow-sm md:col-span-2">
                    <CardHeader className="pb-2">
                        <h2 className="font-semibold text-slate-700">Overview</h2>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {team.description ? (
                            <p className="text-sm text-slate-600 leading-relaxed">{team.description}</p>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No description yet.</p>
                        )}
                        {team.projectIdea && (
                            <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
                                <p className="text-xs text-violet-500 font-medium mb-1">Project Idea</p>
                                <p className="text-sm text-slate-700">{team.projectIdea}</p>
                            </div>
                        )}
                        {team.requiredRoles?.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-slate-500 mb-1.5">Still looking for:</p>
                                <div className="flex flex-wrap gap-2">
                                    {team.requiredRoles.map((role: string) => (
                                        <span key={role} className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(role)}`}>
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Members */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Members
                        </h2>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                        {team.members.map((member: any) => (
                            <div key={member._id} className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-8 w-8 shrink-0 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                                        {member.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <Link to={`/profile/${member._id}`} className="text-sm font-medium text-slate-800 hover:text-violet-600 truncate">
                                                {member.name}
                                            </Link>
                                            {member._id === team.leader._id && <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                        </div>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(member.role)}`}>
                                                {member._id === team.leader._id ? 'Team Leader' : member.role}
                                            </span>
                                            {member.skills?.slice(0, 2).map((s: string) => (
                                                <span key={s} className="text-[10px] text-slate-400">• {s}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {isLeader && member._id !== team.leader._id && (
                                    <button
                                        onClick={() => confirm(`Remove ${member.name}?`) && removeMember(member._id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                        title="Remove member"
                                    >
                                        <UserMinus className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}

                        {isLeader && team.members.length > 1 && (
                            <div className="pt-2 border-t space-y-2">
                                <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                    <Repeat className="h-3.5 w-3.5" /> Transfer leadership
                                </p>
                                <div className="flex gap-2">
                                    <select
                                        value={transferTo}
                                        onChange={(e) => setTransferTo(e.target.value)}
                                        className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs"
                                    >
                                        <option value="">Select a member...</option>
                                        {team.members
                                            .filter((m: any) => m._id !== team.leader._id)
                                            .map((m: any) => (
                                                <option key={m._id} value={m._id}>{m.name}</option>
                                            ))}
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={!transferTo || isTransferring}
                                        onClick={() => confirm('Transfer leadership? You will become a regular member.') && transferLeadership()}
                                    >
                                        Transfer
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Skill Coverage */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Team Skill Coverage
                        </h2>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loadingCoverage ? (
                            <Skeleton className="h-32 w-full" />
                        ) : coverageError ? (
                            <p className="text-sm text-slate-400">Unable to load skill coverage.</p>
                        ) : !coverage || coverage.requiredSkills.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">
                                This hackathon hasn't listed required skills yet.
                            </p>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all"
                                            style={{ width: `${coverage.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 w-10 text-right">{coverage.percentage}%</span>
                                </div>

                                <div className="space-y-1.5">
                                    {coverage.coverage.map((c) => (
                                        <div key={c.skill} className="flex items-center gap-2 text-sm">
                                            {c.covered ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                                            )}
                                            <span className={c.covered ? 'text-slate-700' : 'text-slate-500'}>{c.skill}</span>
                                        </div>
                                    ))}
                                </div>

                                {coverage.missingSkills.length > 0 && (
                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                        <p className="text-xs font-medium text-amber-700 mb-1">Missing Skills</p>
                                        <p className="text-xs text-amber-600">
                                            Find a teammate with {coverage.missingSkills.join(', ')} experience.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Hackathon Info */}
                {team.hackathon && (
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                                <CalendarClock className="h-4 w-4" /> Hackathon Info
                            </h2>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {startDate && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Start date</span>
                                    <span className="text-slate-700 font-medium">{formatDate(team.hackathon.startDate)}</span>
                                </div>
                            )}
                            {endDate && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Submission deadline</span>
                                    <span className="text-slate-700 font-medium">{formatDate((team.hackathon as any).endDate)}</span>
                                </div>
                            )}
                            {coverage?.requiredSkills?.length ? (
                                <div className="pt-2 border-t">
                                    <span className="text-slate-400 text-xs">Required skills</span>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {coverage.requiredSkills.map((s) => (
                                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                )}

                {/* Tasks */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <ListTodo className="h-4 w-4" /> Tasks
                        </h2>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {tasks.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No tasks yet.</p>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-violet-500 rounded-full transition-all"
                                        style={{ width: `${Math.round((doneCount / tasks.length) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 shrink-0">
                                    {doneCount}/{tasks.length} done
                                </span>
                            </div>
                        )}
                        <Link to={`/teams/${teamId}/tasks`}>
                            <Button size="sm" variant="outline" className="w-full">Open Task Board</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Chat */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Team Chat
                        </h2>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-400 italic mb-3">Jump in and talk to your team in real time.</p>
                        <Link to={`/teams/${teamId}/chat`}>
                            <Button size="sm" variant="outline" className="w-full">Open Chat</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Notifications — placeholder, wired in Phase 4 */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Bell className="h-4 w-4" /> Recent Activity
                        </h2>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-400 italic">Team notifications are coming soon.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}