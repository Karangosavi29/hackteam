import { Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS: { value: Task['status']; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

interface TaskCardProps {
  task: Task;
  canChangeStatus: boolean;
  canDelete: boolean;
  onStatusChange: (status: Task['status']) => void;
  onDelete: () => void;
}

export default function TaskCard({ task, canChangeStatus, canDelete, onStatusChange, onDelete }: TaskCardProps) {
  const isOverdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();

  return (
    <div className="bg-white rounded-lg border p-3 space-y-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-800 leading-snug">{task.title}</p>
        {canDelete && (
          <button
            onClick={onDelete}
            className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`text-[10px] px-1.5 py-0.5 ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </Badge>
        {task.dueDate && (
          <span className={`text-[10px] flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
            <Calendar className="h-3 w-3" /> {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        {task.assignedTo ? (
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-[10px]">
              {task.assignedTo.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] text-slate-500">{task.assignedTo.name}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-300 italic">Unassigned</span>
        )}

        {canChangeStatus && (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as Task['status'])}
            className="text-[11px] h-6 rounded border border-input bg-background px-1"
            onClick={(e) => e.stopPropagation()}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}