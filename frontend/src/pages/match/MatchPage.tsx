import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { matchApi } from '@/api/match.api';
import { hackathonApi } from '@/api/hackathon.api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCheck, Users, Star, Crown, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { getRoleBadgeColor, ROLES, EXPERIENCE_LEVELS } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MatchPage() {
  const [hackathonId, setHackathonId] = useState('');

  // Filters
  const [skillFilter, setSkillFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [minScore, setMinScore] = useState(0);

  const { data: hackathonsData } = useQuery({
    queryKey: ['hackathons'],
    queryFn: () => hackathonApi.getAll({ limit: 50 }),
  });

  const { data: teammatesData, isLoading: loadingTeammates, isError: teammatesError, refetch: refetchTeammates } = useQuery({
    queryKey: ['match', 'teammates', hackathonId],
    queryFn: () => matchApi.getTeammates({ hackathonId: hackathonId || undefined, limit: 20 }),
  });

  const { data: teamsData, isLoading: loadingTeams, isError: teamsError, refetch: refetchTeams } = useQuery({
    queryKey: ['match', 'teams', hackathonId],
    queryFn: () => matchApi.getTeams({ hackathonId, limit: 10 }),
    enabled: !!hackathonId,
  });

  const hackathons = hackathonsData?.data?.hackathons || [];

  const teammates = useMemo(() => {
    const all = teammatesData?.data?.suggestions || [];
    return all.filter((item) => {
      if (item.score < minScore) return false;
      if (roleFilter && item.user.role !== roleFilter) return false;
      if (experienceFilter && item.user.experienceLevel !== experienceFilter) return false;
      if (skillFilter && !item.user.skills?.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))) return false;
      return true;
    });
  }, [teammatesData, minScore, roleFilter, experienceFilter, skillFilter]);

  const allTeammates = teammatesData?.data?.suggestions || [];

  const teams = useMemo(() => {
    const all = teamsData?.data?.suggestions || [];
    return all.filter((item) => item.score >= minScore);
  }, [teamsData, minScore]);

  const ScoreBar = ({ score }: { score: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-violet-600 w-8 text-right">
        {score}%
      </span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-violet-600" /> Find Your Perfect Teammate
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Transparent, skill-based recommendations — every score comes with the reasons behind it
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-600">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input
              placeholder="Skill contains..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Any role</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Any experience</option>
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value={0}>Any compatibility</option>
              <option value={50}>50%+ compatible</option>
              <option value={70}>70%+ compatible</option>
              <option value={85}>85%+ compatible</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Optional hackathon context for teammate suggestions */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">
          Hackathon <span className="text-slate-400 font-normal">(optional — sharpens suggestions to required skills)</span>
        </label>
        <select
          value={hackathonId}
          onChange={(e) => setHackathonId(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="">No hackathon selected</option>
          {hackathons.map((h: any) => (
            <option key={h._id} value={h._id}>{h.title}</option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="teammates">
        <TabsList className="w-full">
          <TabsTrigger value="teammates" className="flex-1">
            Suggested Teammates
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex-1">
            Suggested Teams
          </TabsTrigger>
        </TabsList>

        {/* Teammates Tab */}
        <TabsContent value="teammates" className="mt-4 space-y-3">
          {loadingTeammates ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : teammatesError ? (
            <div className="text-center py-16 text-slate-400">
              <p className="mb-3">Unable to load recommendations.</p>
              <button onClick={() => refetchTeammates()} className="text-violet-600 text-sm hover:underline">
                Try Again
              </button>
            </div>
          ) : allTeammates.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No suitable teammates found.</p>
              <p className="text-xs mt-1">Try adding more skills to your profile.</p>
              <Link to="/profile/edit" className="text-violet-600 text-sm hover:underline mt-2 block">
                Update profile →
              </Link>
            </div>
          ) : teammates.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No teammates match your filters.</p>
            </div>
          ) : (
            teammates.map((item: any) => (
              <Card key={item.user._id} className="shadow-sm hover:border-violet-200 transition-all">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg shrink-0">
                        {item.user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          to={`/profile/${item.user._id}`}
                          className="font-semibold text-slate-800 hover:text-violet-600 transition-colors"
                        >
                          {item.user.name}
                        </Link>
                        <p className="text-xs text-slate-500">{item.user.college}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(item.user.role)}`}>
                          {item.user.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-slate-700">
                        {item.score}%
                      </span>
                    </div>
                  </div>

                  {/* Match score bar */}
                  <ScoreBar score={item.score} />

                  {/* Why this match? */}
                  {item.reasons?.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-500 pt-1">Why this match?</p>
                      {item.reasons.map((reason: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                          {reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Shared skills */}
                  {item.matchDetails.sharedSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.matchDetails.sharedSkills.map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs bg-green-50 text-green-700">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Link
                    to={`/profile/${item.user._id}`}
                    className="inline-block text-xs font-medium text-violet-600 hover:underline pt-1"
                  >
                    View Profile →
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="mt-4 space-y-4">
          {!hackathonId ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Select a hackathon above to see matching teams</p>
            </div>
          ) : loadingTeams ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
          ) : teamsError ? (
            <div className="text-center py-16 text-slate-400">
              <p className="mb-3">Unable to load recommendations.</p>
              <button onClick={() => refetchTeams()} className="text-violet-600 text-sm hover:underline">
                Try Again
              </button>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No suitable teams found.</p>
              <p className="text-xs mt-1">Try adding more skills to your profile.</p>
            </div>
          ) : (
            teams.map((item: any) => (
              <Card key={item.team._id} className="shadow-sm hover:border-violet-200 transition-all">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        to={`/teams/${item.team._id}`}
                        className="font-semibold text-slate-800 hover:text-violet-600 transition-colors"
                      >
                        {item.team.name}
                      </Link>
                      {item.team.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.team.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Crown className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs text-slate-500">{item.team.leader?.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-slate-700">
                        {item.score}%
                      </span>
                    </div>
                  </div>

                  <ScoreBar score={item.score} />

                  {item.reasons?.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-500 pt-1">Why this match?</p>
                      {item.reasons.map((reason: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                          {reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.team.requiredRoles?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-slate-400">Needs:</span>
                      {item.team.requiredRoles.map((role: string) => (
                        <span key={role} className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(role)}`}>
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}