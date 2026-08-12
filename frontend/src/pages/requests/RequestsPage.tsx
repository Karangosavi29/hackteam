import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '@/api/request.api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Trash2, Bell, Send } from 'lucide-react';
import { formatDate, getRoleBadgeColor } from '@/lib/utils';

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

export default function RequestsPage() {
  const queryClient = useQueryClient();

  const { data: incomingData, isLoading: loadingIncoming } = useQuery({
    queryKey: ['requests', 'incoming'],
    queryFn: () => requestApi.getIncoming(),
  });

  const { data: outgoingData, isLoading: loadingOutgoing } = useQuery({
    queryKey: ['requests', 'outgoing'],
    queryFn: () => requestApi.getOutgoing(),
  });

  const { mutate: accept } = useMutation({
    mutationFn: (id: string) => requestApi.accept(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });

  const { mutate: reject } = useMutation({
    mutationFn: (id: string) => requestApi.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });

  const { mutate: withdraw } = useMutation({
    mutationFn: (id: string) => requestApi.withdraw(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });

  const incoming = incomingData?.data?.requests || [];
  const outgoing = outgoingData?.data?.requests || [];
  const pendingCount = incoming.filter((r: any) => r.status === 'pending').length;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Bell className="h-6 w-6 text-violet-600" />
          Requests
          {pendingCount > 0 && (
            <span className="h-6 w-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your team join requests and invites</p>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList className="w-full">
          <TabsTrigger value="incoming" className="flex-1">
            Incoming {pendingCount > 0 && `(${pendingCount})`}
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex-1">
            Outgoing ({outgoing.length})
          </TabsTrigger>
        </TabsList>

        {/* Incoming */}
        <TabsContent value="incoming" className="space-y-3 mt-4">
          {loadingIncoming ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : incoming.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No incoming requests yet</p>
            </div>
          ) : (
            incoming.map((req: any) => (
              <Card key={req._id} className="shadow-sm">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold shrink-0">
                        {req.from?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{req.from?.name}</p>
                        <p className="text-xs text-slate-500">{req.from?.college}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(req.from?.role)}`}>
                          {req.from?.role}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusColor[req.status]}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 space-y-1">
                    <p><span className="font-medium">Team:</span> {req.team?.name}</p>
                    <p><span className="font-medium">Hackathon:</span> {req.hackathon?.title}</p>
                    {req.message && <p><span className="font-medium">Message:</span> {req.message}</p>}
                    <p className="text-slate-400">{formatDate(req.createdAt)}</p>
                  </div>

                  {/* Skills */}
                  {req.from?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {req.from.skills.slice(0, 5).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {req.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 gap-1"
                        onClick={() => accept(req._id)}
                      >
                        <Check className="h-4 w-4" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-500 border-red-200 hover:bg-red-50 gap-1"
                        onClick={() => reject(req._id)}
                      >
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Outgoing */}
        <TabsContent value="outgoing" className="space-y-3 mt-4">
          {loadingOutgoing ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : outgoing.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Send className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No outgoing requests yet</p>
            </div>
          ) : (
            outgoing.map((req: any) => (
              <Card key={req._id} className="shadow-sm">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{req.team?.name}</p>
                      <p className="text-xs text-violet-600">{req.hackathon?.title}</p>
                      {req.message && (
                        <p className="text-xs text-slate-500 mt-1 italic">"{req.message}"</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{formatDate(req.createdAt)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium shrink-0 ${statusColor[req.status]}`}>
                      {req.status}
                    </span>
                  </div>

                  {req.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-red-500 border-red-200 hover:bg-red-50 gap-1"
                      onClick={() => withdraw(req._id)}
                    >
                      <Trash2 className="h-4 w-4" /> Withdraw Request
                    </Button>
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