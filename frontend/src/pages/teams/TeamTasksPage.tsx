import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { teamApi } from '@/api/team.api';
import { taskApi } from '@/api/task.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, ListTodo } from 'lucide-react';
import TaskBoard from '@/components/tasks/TaskBoard';
import CreateTaskDialog from '@/components/tasks/CreateTaskDialog';
import { Task } from '@/types';

export default function TeamTasksPage() {
  const { teamId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: teamData, isLoading: loadingTeam } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamApi.getById(teamId!),
    enabled: !!teamId,
  });

  const team = teamData?.data?.team;
  const isMember = team?.members?.some((m: any) => m._id === user?._id);
  const isLeader = user?._id === team?.leader?._id;

  const { data: tasksData, isLoading: loadingTasks, isError: tasksError, refetch } = useQuery({
    queryKey: ['tasks', teamId],
    queryFn: () => taskApi.getForTeam(teamId!),
    enabled: !!teamId && !!isMember,
  });

  const tasks = tasksData?.data?.tasks || [];

  const { mutate: createTask, isPending: isCreating } = useMutation({
    mutationFn: (data: Parameters<typeof taskApi.create>[1]) => taskApi.create(teamId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', teamId] });
      setDialogOpen(false);
    },
    onError: (err: any) => alert(err?.response?.data?.message || 'Failed to create task'),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task['status'] }) =>
      taskApi.update(taskId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', teamId] }),
    onError: (err: any) => alert(err?.response?.data?.message || 'Failed to update task'),
  });

  const { mutate: deleteTask } = useMutation({
    mutationFn: (taskId: string) => taskApi.remove(taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', teamId] }),
    onError: (err: any) => alert(err?.response?.data?.message || 'Failed to delete task'),
  });

  if (loadingTeam) {
    return (
      <div className="max-w-5xl mx-auto py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!team) {
    return <div className="text-center py-20 text-slate-400">Team not found.</div>;
  }

  if (!isMember) {
    return (
      <div className="text-center py-20 text-slate-400 space-y-2">
        <p>You need to be a member of this team to view its tasks.</p>
        <Link to={`/teams/${teamId}`} className="text-violet-600 text-sm hover:underline">
          View public team page →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-violet-600" /> {team.name} — Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track what needs to get done before the deadline</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-violet-600 hover:bg-violet-700 gap-1.5">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {loadingTasks ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : tasksError ? (
        <div className="text-center py-16 text-slate-400">
          <p className="mb-3">Unable to load tasks.</p>
          <button onClick={() => refetch()} className="text-violet-600 text-sm hover:underline">
            Try Again
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ListTodo className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No tasks yet.</p>
          <p className="text-xs mt-1">Create the first task to get the team organized.</p>
        </div>
      ) : (
        <TaskBoard
          tasks={tasks}
          currentUserId={user!._id}
          isLeader={isLeader}
          onStatusChange={(taskId, status) => updateStatus({ taskId, status })}
          onDelete={(taskId) => confirm('Delete this task?') && deleteTask(taskId)}
        />
      )}

      <CreateTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        members={team.members.map((m: any) => ({ _id: m._id, name: m.name }))}
        isPending={isCreating}
        onCreate={createTask}
      />
    </div>
  );
}