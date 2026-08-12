import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { hackathonApi } from '@/api/hackathon.api';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, MapPin, Calendar, Users, Plus, Search, Wifi, WifiOff } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const MODE_FILTERS = ['all', 'online', 'offline', 'hybrid'];

export default function HackathonListPage() {
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['hackathons', search, mode, page],
    queryFn: () => hackathonApi.getAll({
      q: search || undefined,
      mode: mode === 'all' ? undefined : mode,
      page,
      limit: 9,
    }),
    staleTime: 1000 * 30,
  });

  const hackathons = data?.data?.hackathons || [];
  const totalPages = data?.data?.pages || 1;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-violet-600" /> Hackathons
          </h1>
          <p className="text-sm text-slate-500 mt-1">Discover and join upcoming hackathons</p>
        </div>
        {isAuthenticated && (
          <Link to="/hackathons/create">
            <Button className="bg-violet-600 hover:bg-violet-700 gap-1">
              <Plus className="h-4 w-4" /> Add Hackathon
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search hackathons..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2">
          {MODE_FILTERS.map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                mode === m
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : hackathons.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No hackathons found. Be the first to add one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hackathons.map((h: any) => (
            <Link key={h._id} to={`/hackathons/${h._id}`}>
              <Card className="h-full hover:shadow-md hover:border-violet-200 transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-800 leading-tight">{h.title}</h3>
                    <Badge variant="outline" className="shrink-0 capitalize text-xs">
                      {h.mode === 'online' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                      {h.mode}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-500 line-clamp-2">{h.description}</p>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(h.startDate)} — {formatDate(h.endDate)}
                    </div>
                    {h.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {h.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {h.minTeamSize}–{h.maxTeamSize} members
                    </div>
                  </div>

                  {h.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {h.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                          {tag}
                        </span>
                      ))}
                      {h.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-slate-50 text-slate-400">
                          +{h.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {h.prizePool && (
                    <p className="text-xs font-semibold text-green-600">🏆 {h.prizePool}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}