import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GitBranch, Pencil, GraduationCap, Briefcase, ExternalLink } from 'lucide-react';
import { getRoleBadgeColor } from '@/lib/utils';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: authUser } = useAuthStore();
  const navigate = useNavigate();

  const profileId = id || authUser?._id;
  const isOwnProfile = !id || id === authUser?._id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['user', profileId],
    queryFn: () => userApi.getProfile(profileId!),
    enabled: !!profileId,
  });

  const user = data?.data?.user;

  if (isLoading) return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );

  if (error || !user) return (
    <div className="text-center py-20 text-slate-500">User not found.</div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      {/* Header Card */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-500">{user.college || 'No college set'}</span>
                </div>
                <div className="mt-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile/edit')}
                className="gap-1"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </div>

          {user.bio && (
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">{user.bio}</p>
          )}

          {/* Social links */}
          <div className="flex gap-3 mt-4">
            {user.github && (
              <a href={user.github} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors">
                <GitBranch className="h-4 w-4" /> GitHub
              </a>
            )}
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors">
                <ExternalLink className="h-4 w-4" /> LinkedIn
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Skills
          </h2>
        </CardHeader>
        <CardContent>
          {user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No skills added yet.{isOwnProfile && (
                <Link to="/profile/edit" className="text-violet-600 ml-1 hover:underline">Add skills →</Link>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Teams Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <h2 className="font-semibold text-slate-700">Teams</h2>
        </CardHeader>
        <CardContent>
          {user.teams?.length > 0 ? (
            <div className="space-y-2">
              {user.teams.map((team: any) => (
                <Link key={team._id} to={`/teams/${team._id}`}
                  className="block p-3 rounded-lg border hover:border-violet-300 hover:bg-violet-50 transition-colors text-sm font-medium text-slate-700">
                  {team.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not part of any team yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}