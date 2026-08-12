import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/api/team.api';
import { hackathonApi } from '@/api/hackathon.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, X } from 'lucide-react';
import { ROLES } from '@/lib/utils';
import { useState } from 'react';

const teamSchema = z.object({
  name: z.string().min(2, 'Team name is required'),
  hackathon: z.string().min(1, 'Please select a hackathon'),
  description: z.string().optional(),
  projectIdea: z.string().optional(),
  maxSize: z.coerce.number().min(2).max(10),
});

type TeamForm = z.infer<typeof teamSchema>;

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [requiredRoles, setRequiredRoles] = useState<string[]>([]);

  const prefilledHackathon = searchParams.get('hackathon') || '';
  const prefilledTitle = searchParams.get('title') || '';

  const { data: hackathonsData } = useQuery({
    queryKey: ['hackathons'],
    queryFn: () => hackathonApi.getAll({ limit: 50 }),
  });

  const hackathons = hackathonsData?.data?.hackathons || [];

  const { register, handleSubmit, formState: { errors } } = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      hackathon: prefilledHackathon,
      maxSize: 4,
    },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: TeamForm) => teamApi.create({ ...data, requiredRoles }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      navigate(`/teams/${res.data.team._id}`);
    },
  });

  const toggleRole = (role: string) => {
    setRequiredRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="h-6 w-6 text-violet-600" /> Create Team
          </CardTitle>
          <CardDescription>
            {prefilledTitle ? `Forming a team for ${prefilledTitle}` : 'Start a new team for a hackathon'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
                {(error as any)?.response?.data?.message || 'Failed to create team.'}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Team Name</Label>
              <Input placeholder="Team Nexus" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Hackathon</Label>
              <select
                {...register('hackathon')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Select a hackathon...</option>
                {hackathons.map((h: any) => (
                  <option key={h._id} value={h._id}>{h.title}</option>
                ))}
              </select>
              {errors.hackathon && <p className="text-xs text-red-500">{errors.hackathon.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Description <span className="text-slate-400 text-xs">(optional)</span></Label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="What's your team about?"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Project Idea <span className="text-slate-400 text-xs">(optional)</span></Label>
              <textarea
                {...register('projectIdea')}
                rows={2}
                placeholder="AI-powered health tracker, Web3 voting system..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Max Team Size</Label>
              <Input type="number" min={2} max={10} {...register('maxSize')} />
            </div>

            {/* Required roles */}
            <div className="space-y-2">
              <Label>Roles you need <span className="text-slate-400 text-xs">(optional)</span></Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => toggleRole(r.value)}
                    className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
                      requiredRoles.includes(r.value)
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                    }`}
                  >
                    {requiredRoles.includes(r.value) && '✓ '}{r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700" disabled={isPending}>
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</> : 'Create Team'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}