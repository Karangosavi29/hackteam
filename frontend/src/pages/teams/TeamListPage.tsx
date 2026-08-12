import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { teamApi } from '@/api/team.api';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Plus, Search, Crown } from 'lucide-react';
import { getRoleBadgeColor } from '@/lib/utils';

export default function TeamListPage() {
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [showOpen, setShowOpen] = useState<boolean | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['teams', showOpen],
    queryFn: () => teamApi.getAll({ isOpen: showOpen, limit: 12 }),
    staleTime: 1000 * 30,
  });

  const teams = data?.data?.teams || [];

  const filtered = teams.filter((t: any) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.hackathon?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-violet-600" /> Teams
          </h1>
          <p className="text-sm text-slate-500 mt-1">Find a team or start your own</p>
        </div>
        {isAuthenticated && (
          <Link to="/teams/create">
            <Button className="bg-violet-600 hover:bg-violet-700 gap-1">
              <Plus className="h-4 w-4" /> Create Team
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search teams or hackathons..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {[
            { label: 'All', value: undefined },
            { label: 'Open', value: true },
            { label: 'Closed', value: false },
          ].map((f) => (
            <button
              key={String(f.label)}
              onClick={() => setShowOpen(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                showOpen === f.value
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No teams found. Create the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((team: any) => (
            <Link key={team._id} to={`/teams/${team._id}`}>
              <Card className="h-full hover:shadow-md hover:border-violet-200 transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-800">{team.name}</h3>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${team.isOpen ? 'border-green-300 text-green-600' : 'border-slate-200 text-slate-400'}`}
                    >
                      {team.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  {team.hackathon && (
                    <p className="text-xs text-violet-600 font-medium">{team.hackathon.title}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {team.description && (
                    <p className="text-sm text-slate-500 line-clamp-2">{team.description}</p>
                  )}

                  {/* Leader */}
                  <div className="flex items-center gap-2">
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs text-slate-500">{team.leader?.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(team.leader?.role)}`}>
                      {team.leader?.role}
                    </span>
                  </div>

                  {/* Members */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {team.members?.slice(0, 4).map((m: any) => (
                        <div key={m._id}
                          className="h-7 w-7 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center text-violet-700 text-xs font-bold">
                          {m.name?.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">
                      {team.members?.length}/{team.maxSize} members
                    </span>
                  </div>

                  {/* Required roles */}
                  {team.requiredRoles?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-slate-400">Needs:</span>
                      {team.requiredRoles.map((role: string) => (
                        <span key={role} className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(role)}`}>
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}