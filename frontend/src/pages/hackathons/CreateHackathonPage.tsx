import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hackathonApi } from '@/api/hackathon.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const hackathonSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  registrationDeadline: z.string().min(1, 'Registration deadline is required'),
  mode: z.enum(['online', 'offline', 'hybrid']),
  location: z.string().optional(),
  maxTeamSize: z.coerce.number().min(1).max(10),
  minTeamSize: z.coerce.number().min(1).max(10),
  prizePool: z.string().optional(),
  registrationLink: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

type HackathonForm = z.infer<typeof hackathonSchema>;

export default function CreateHackathonPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<HackathonForm>({
    resolver: zodResolver(hackathonSchema),
    defaultValues: { mode: 'online', maxTeamSize: 4, minTeamSize: 2 },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: HackathonForm) => hackathonApi.create({ ...data, tags }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['hackathons'] });
      navigate(`/hackathons/${res.data.hackathon._id}`);
    },
  });

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-violet-600" /> Add Hackathon
          </CardTitle>
          <CardDescription>Share a hackathon with the community</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
                {(error as any)?.response?.data?.message || 'Failed to create hackathon.'}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="HackIndia 2025" {...register('title')} />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Tell students what this hackathon is about..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" {...register('startDate')} />
                {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" {...register('endDate')} />
                {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Registration Deadline</Label>
              <Input type="date" {...register('registrationDeadline')} />
              {errors.registrationDeadline && <p className="text-xs text-red-500">{errors.registrationDeadline.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Mode</Label>
                <select
                  {...register('mode')}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Location <span className="text-slate-400 text-xs">(optional)</span></Label>
                <Input placeholder="Bangalore, India" {...register('location')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Min Team Size</Label>
                <Input type="number" min={1} max={10} {...register('minTeamSize')} />
              </div>
              <div className="space-y-1.5">
                <Label>Max Team Size</Label>
                <Input type="number" min={1} max={10} {...register('maxTeamSize')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Prize Pool <span className="text-slate-400 text-xs">(optional)</span></Label>
              <Input placeholder="₹5,00,000" {...register('prizePool')} />
            </div>

            <div className="space-y-1.5">
              <Label>Registration Link <span className="text-slate-400 text-xs">(optional)</span></Label>
              <Input placeholder="https://devfolio.co/..." {...register('registrationLink')} />
              {errors.registrationLink && <p className="text-xs text-red-500">{errors.registrationLink.message}</p>}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>
                        <X className="h-3 w-3 hover:text-red-500" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="AI, Web3, Healthcare..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700" disabled={isPending}>
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</> : 'Create Hackathon'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}