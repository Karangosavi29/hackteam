import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hackathonApi } from '@/api/hackathon.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, ExternalLink, Trophy, Trash2, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function HackathonDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['hackathon', id],
    queryFn: () => hackathonApi.getById(id!),
    enabled: !!id,
  });

  const { mutate: deleteHackathon, isPending: isDeleting } = useMutation({
    mutationFn: () => hackathonApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathons'] });
      navigate('/hackathons');
    },
  });

  const hackathon = data?.data?.hackathon;
  const isOrganizer = user?._id === hackathon?.organizer?._id;

  if (isLoading) return (
    <div className="max-w-3xl mx-auto py-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );

  if (!hackathon) return (
    <div className="text-center py-20 text-slate-400">Hackathon not found.</div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-4">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Main card */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-violet-600" />
                <Badge variant="outline" className="capitalize">{hackathon.mode}</Badge>
                {hackathon.isVerified && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">✓ Verified</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-800">{hackathon.title}</h1>
              <p className="text-sm text-slate-500 mt-1">
                by {hackathon.organizer?.name}
              </p>
            </div>

            {isOrganizer && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50 gap-1 shrink-0"
                onClick={() => confirm('Delete this hackathon?') && deleteHackathon()}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <p className="text-slate-600 leading-relaxed">{hackathon.description}</p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs text-slate-400 mb-1">Start Date</p>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-violet-500" />
                {formatDate(hackathon.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">End Date</p>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-violet-500" />
                {formatDate(hackathon.endDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Registration Deadline</p>
              <p className="text-sm font-medium text-red-500">
                {formatDate(hackathon.registrationDeadline)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Team Size</p>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Users className="h-4 w-4 text-violet-500" />
                {hackathon.minTeamSize}–{hackathon.maxTeamSize} members
              </p>
            </div>
            {hackathon.location && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Location</p>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-violet-500" />
                  {hackathon.location}
                </p>
              </div>
            )}
            {hackathon.prizePool && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Prize Pool</p>
                <p className="text-sm font-semibold text-green-600">🏆 {hackathon.prizePool}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {hackathon.tags?.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {hackathon.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 text-xs rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {hackathon.registrationLink && (
              <a href={hackathon.registrationLink} target="_blank" rel="noreferrer" className="flex-1">
                <Button className="w-full bg-violet-600 hover:bg-violet-700 gap-1">
                  <ExternalLink className="h-4 w-4" /> Register Now
                </Button>
              </a>
            )}
            {isAuthenticated && (
              <Link to={`/teams/create?hackathon=${hackathon._id}&title=${encodeURIComponent(hackathon.title)}`} className="flex-1">
                <Button variant="outline" className="w-full gap-1">
                  <Users className="h-4 w-4" /> Form a Team
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}