import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { teamApi } from '@/api/team.api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, BarChart3, CheckCircle2, AlertTriangle, Users,
  CalendarClock, ListTodo, Activity,
} from 'lucide-react';
import { getScoreColor } from '@/lib/utils';

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const STATUS_LABEL: Record<string, string> = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
const STATUS_COLOR: Record<string, string> = { TODO: 'bg-slate-300', IN_PROGRESS: 'bg-amber-400', DONE: 'bg-green-500' };

export default function TeamAnalyticsPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['team', 'analytics', teamId],
    queryFn: () => teamApi.getAnalytics(teamId!),
    enabled: !!teamId,
  });

  const analytics = data?.data;

  if (isLoading) {
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

  if (isError || !analytics) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="mb-3">Unable to load team analytics.</p>
        <button onClick={() => refetch()} className="text-violet-600 text-sm hover:underline">
          Try Again
        </button>
      </div>
    );
  }

  const { taskCounts } = analytics;
  const segments = [
    { key: 'todo', value: taskCounts.todo },
    { key: 'inProgress', value: taskCounts.inProgress },
    { key: 'done', value: taskCounts.done },
  ];
  const maxWorkload = Math.max(1, ...analytics.memberWorkload.map((m) => m.total));

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-violet-600" /> {analytics.teamName} — Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          <Link to={`/teams/${teamId}/dashboard`} className="hover:text-violet-600 hover:underline">
            Back to Team Dashboard
          </Link>
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-slate-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Progress</p>
            <p className={`text-xl font-bold mt-1 ${getScoreColor(analytics.progressPercent).split(' ')[0]}`}>
              {analytics.progressPercent}%
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-slate-400 flex items-center gap-1"><ListTodo className="h-3.5 w-3.5" /> Total Tasks</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{taskCounts.total}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-slate-400 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Overdue</p>
            <p className={`text-xl font-bold mt-1 ${analytics.overdueCount > 0 ? 'text-red-500' : 'text-slate-800'}`}>
              {analytics.overdueCount}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-slate-400 flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {analytics.deadline.label}</p>
            <p className="text-xl font-bold text-slate-800 mt-1">
              {analytics.deadline.daysLeft != null ? `${analytics.deadline.daysLeft}d` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Task breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <ListTodo className="h-4 w-4" /> Task Breakdown
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {taskCounts.total === 0 ? (
              <p className="text-sm text-slate-400 italic">No tasks yet.</p>
            ) : (
              <>
                <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                  {segments.map((s) => (
                    s.value > 0 && (
                      <div
                        key={s.key}
                        className={STATUS_COLOR[s.key === 'inProgress' ? 'IN_PROGRESS' : s.key === 'done' ? 'DONE' : 'TODO']}
                        style={{ width: `${(s.value / taskCounts.total) * 100}%` }}
                      />
                    )
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /> To Do: {taskCounts.todo}</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> In Progress: {taskCounts.inProgress}</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" /> Done: {taskCounts.done}</span>
                </div>
                {analytics.unassignedCount > 0 && (
                  <p className="text-xs text-amber-600">⚠ {analytics.unassignedCount} task(s) unassigned</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Skill coverage */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Skill Coverage
            </h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.skillCoverage.coverage.length === 0 ? (
              <p className="text-sm text-slate-400 italic">This hackathon hasn't listed required skills yet.</p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${analytics.skillCoverage.percentage}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 w-10 text-right">{analytics.skillCoverage.percentage}%</span>
                </div>
                <div className="space-y-1">
                  {analytics.skillCoverage.coverage.map((c) => (
                    <div key={c.skill} className="flex items-center gap-2 text-sm">
                      {c.covered ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      <span className={c.covered ? 'text-slate-700' : 'text-slate-500'}>{c.skill}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Member workload */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4" /> Member Workload
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.memberWorkload.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No members yet.</p>
            ) : (
              analytics.memberWorkload.map((m) => (
                <div key={m.userId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{m.name}</span>
                    <span className="text-xs text-slate-400">{m.total} task{m.total !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                    {m.todo > 0 && <div className="bg-slate-300" style={{ width: `${(m.todo / maxWorkload) * 100}%` }} />}
                    {m.inProgress > 0 && <div className="bg-amber-400" style={{ width: `${(m.inProgress / maxWorkload) * 100}%` }} />}
                    {m.done > 0 && <div className="bg-green-500" style={{ width: `${(m.done / maxWorkload) * 100}%` }} />}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Recent Activity
            </h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No activity yet.</p>
            ) : (
              analytics.recentActivity.map((a) => (
                <div key={a.taskId} className="flex items-start justify-between text-sm gap-2">
                  <div>
                    <span className="text-slate-700">{a.title}</span>
                    <span className="text-slate-400"> — {STATUS_LABEL[a.status]}</span>
                    {a.assignedToName && <span className="text-slate-400"> · {a.assignedToName}</span>}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{timeAgo(a.updatedAt)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}