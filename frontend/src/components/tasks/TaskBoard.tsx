import { Task } from '@/types';
import TaskCard from './TaskCard';

const COLUMNS: { status: Task['status']; label: string }[] = [
  { status: 'TODO', label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'DONE', label: 'Done' },
];

interface TaskBoardProps {
  tasks: Task[];
  currentUserId: string;
  isLeader: boolean;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskBoard({ tasks, currentUserId, isLeader, onStatusChange, onDelete }: TaskBoardProps) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className="bg-slate-50 rounded-xl p-3 space-y-3 min-h-[200px]">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{col.label}</p>
              <span className="text-xs text-slate-400 bg-white rounded-full px-2 py-0.5 border">
                {columnTasks.length}
              </span>
            </div>

            {columnTasks.length === 0 ? (
              <p className="text-xs text-slate-300 italic px-1">No tasks here yet.</p>
            ) : (
              <div className="space-y-2">
                {columnTasks.map((task) => {
                  const isAssignee = task.assignedTo?._id === currentUserId;
                  return (
                    <TaskCard
                      key={task._id}
                      task={task}
                      canChangeStatus={isLeader || isAssignee}
                      canDelete={isLeader}
                      onStatusChange={(status) => onStatusChange(task._id, status)}
                      onDelete={() => onDelete(task._id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}