import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { matchApi } from '@/api/match.api';
import { hackathonApi } from '@/api/hackathon.api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCheck, Users, Star, Crown } from 'lucide-react';
import { getRoleBadgeColor } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MatchPage() {
  const [hackathonId, setHackathonId] = useState('');

  const { data: hackathonsData } = useQuery({
    queryKey: ['hackathons'],
    queryFn: () => hackathonApi.getAll({ limit: 50 }),
  });

  const { data: teammatesData, isLoading: loadingTeammates } = useQuery({
    queryKey: ['match', 'teammates'],
    queryFn: () => matchApi.getTeammates({ limit: 10 }),
  });

  const { data: teamsData, isLoading: loadingTeams } = useQuery({
    queryKey: ['match', 'teams', hackathonId],
    queryFn: () => matchApi.getTeams({ hackathonId, limit: 10 }),
    enabled: !!hackathonId,
  });

  const hackathons = hackathonsData?.data?.hackathons || [];
  const teammates = teammatesData?.data?.suggestions || [];
  const teams = teamsData?.data?.suggestions || [];

  const ScoreBar = ({ score }: { score: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all"
          style={{ width: `${Math.round(score * 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium text-violet-600 w-8 text-right">
        {Math.round(score * 100)}%
      </span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-violet-600" /> Smart Match
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          AI-powered suggestions based on your skills and role
        </p>
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
          ) : teammates.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Add skills to your profile to get teammate suggestions</p>
              <Link to="/profile/edit" className="text-violet-600 text-sm hover:underline mt-2 block">
                Update profile →
              </Link>
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
                        {Math.round(item.score * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Match score bar */}
                  <ScoreBar score={item.score} />

                  {/* Match details */}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {item.matchDetails.sharedSkills?.length > 0 && (
                      <span className="text-green-600">
                        ✓ {item.matchDetails.sharedSkills.length} shared skill{item.matchDetails.sharedSkills.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {item.matchDetails.complementaryRole && (
                      <span className="text-violet-600">✓ Complementary role</span>
                    )}
                    {item.matchDetails.sameCollege && (
                      <span className="text-blue-600">✓ Same college</span>
                    )}
                  </div>

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
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="mt-4 space-y-4">
          {/* Hackathon selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Select a hackathon to find matching teams
            </label>
            <select
              value={hackathonId}
              onChange={(e) => setHackathonId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Choose a hackathon...</option>
              {hackathons.map((h: any) => (
                <option key={h._id} value={h._id}>{h.title}</option>
              ))}
            </select>
          </div>

          {!hackathonId ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Select a hackathon to see matching teams</p>
            </div>
          ) : loadingTeams ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
          ) : teams.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No matching teams found for this hackathon</p>
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
                        {Math.round(item.score * 100)}%
                      </span>
                    </div>
                  </div>

                  <ScoreBar score={item.score} />

                  <div className="flex flex-wrap gap-3 text-xs">
                    {item.matchDetails.roleNeeded && (
                      <span className="text-violet-600">✓ Your role is needed</span>
                    )}
                    {item.matchDetails.spotsLeft > 0 && (
                      <span className="text-green-600">✓ {item.matchDetails.spotsLeft} spot{item.matchDetails.spotsLeft > 1 ? 's' : ''} left</span>
                    )}
                    {item.matchDetails.sharedSkills?.length > 0 && (
                      <span className="text-blue-600">
                        ✓ {item.matchDetails.sharedSkills.length} shared skill{item.matchDetails.sharedSkills.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

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