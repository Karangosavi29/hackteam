import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { userApi } from '@/api/user.api';
import { requestApi } from '@/api/request.api';
import { useAuthStore } from '@/store/auth.store';
import { UserPlus } from 'lucide-react';

interface InviteToTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  targetUserName: string;
}

export default function InviteToTeamDialog({ open, onOpenChange, targetUserId, targetUserName }: InviteToTeamDialogProps) {
  const { user } = useAuthStore();
  const [teamId, setTeamId] = useState('');
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['user-teams', user?._id],
    queryFn: () => userApi.getUserTeams(user!._id),
    enabled: open && !!user?._id,
  });

  // Teams this user leads, still open, and with a free slot
  const eligibleTeams = (data?.data?.teams || []).filter(
    (t) => t.leader === user?._id && t.isOpen && t.members.length < t.maxSize
  );

  const { mutate: sendInvite, isPending, error } = useMutation({
    mutationFn: () => requestApi.send({ type: 'invite', teamId, toUserId: targetUserId, message: message || undefined }),
    onSuccess: () => {
      onOpenChange(false);
      setTeamId('');
      setMessage('');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Invite {targetUserName} to a team
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
              {(error as any)?.response?.data?.message || 'Failed to send invite.'}
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-slate-400">Loading your teams...</p>
          ) : eligibleTeams.length === 0 ? (
            <p className="text-sm text-slate-400">
              You don't lead any open team with a free spot right now. Create a team or free up a slot first.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Which team?</Label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="">Select a team...</option>
                  {eligibleTeams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.members.length}/{t.maxSize}) — {t.hackathon?.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Message <span className="text-slate-400 text-xs">(optional)</span></Label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="We'd love to have you on the team..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            disabled={!teamId || isPending}
            onClick={() => sendInvite()}
          >
            {isPending ? 'Sending...' : 'Send Invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}