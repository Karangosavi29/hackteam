import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';
import { ROLES, SKILLS_LIST } from '@/lib/utils';
import { useState } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  college: z.string().min(2, 'College is required'),
  bio: z.string().max(300, 'Bio max 300 characters').optional(),
  role: z.enum(['frontend', 'backend', 'fullstack', 'design', 'ml', 'devops', 'other']),
  github: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [skillSearch, setSkillSearch] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      college: user?.college || '',
      bio: user?.bio || '',
      role: user?.role || 'other',
      github: user?.github || '',
      linkedin: user?.linkedin || '',
    },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: ProfileForm) => userApi.updateProfile({ ...data, skills }),
    onSuccess: (res) => {
      updateUser(res.data.user);
      navigate('/profile');
    },
  });

  const filteredSkills = SKILLS_LIST.filter(
    (s) => s.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.includes(s)
  );

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) setSkills([...skills, skill]);
    setSkillSearch('');
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Profile</CardTitle>
          <CardDescription>Tell the world who you are and what you build</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
                {(error as any)?.response?.data?.message || 'Update failed. Try again.'}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input placeholder="Karan Shah" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* College */}
            <div className="space-y-1.5">
              <Label>College</Label>
              <Input placeholder="IIT Bombay" {...register('college')} />
              {errors.college && <p className="text-xs text-red-500">{errors.college.message}</p>}
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label>Bio <span className="text-slate-400 text-xs">(optional)</span></Label>
              <textarea
                {...register('bio')}
                placeholder="Full stack dev who loves building products at hackathons..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
              {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label>Your Role</Label>
              <select
                {...register('role')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>

              {/* Selected skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>
                        <X className="h-3 w-3 hover:text-red-500" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Skill search */}
              <Input
                placeholder="Search skills — React, Python, Figma..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
              />

              {/* Skill suggestions */}
              {skillSearch && (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-white">
                  {filteredSkills.length > 0 ? (
                    filteredSkills.slice(0, 12).map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="px-3 py-1 text-xs rounded-full bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 transition-colors"
                      >
                        + {skill}
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      onClick={() => addSkill(skillSearch)}
                      className="px-3 py-1 text-xs rounded-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                    >
                      + Add "{skillSearch}"
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* GitHub */}
            <div className="space-y-1.5">
              <Label>GitHub <span className="text-slate-400 text-xs">(optional)</span></Label>
              <Input placeholder="https://github.com/username" {...register('github')} />
              {errors.github && <p className="text-xs text-red-500">{errors.github.message}</p>}
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <Label>LinkedIn <span className="text-slate-400 text-xs">(optional)</span></Label>
              <Input placeholder="https://linkedin.com/in/username" {...register('linkedin')} />
              {errors.linkedin && <p className="text-xs text-red-500">{errors.linkedin.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                disabled={isPending}
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
                ) : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}