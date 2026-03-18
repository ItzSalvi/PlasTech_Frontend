import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { Recycle } from 'lucide-react';

interface BottleSession {
  id: number;
  binId: string;
  bottlesInserted: number;
  pointsEarned: number;
  connectedAt: string;
  disconnectedAt: string | null;
}

export function Transactions() {
  const [sessions, setSessions] = useState<BottleSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchSessions() {
      try {
        const { data } = await api.get('/user/bottle-sessions');
        setSessions(data);
      } catch (err) {
        console.error('Failed to fetch bottle sessions', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Bottle sessions</CardTitle>
          <CardDescription>
            Bottles inserted at the machine and total points earned after checkout of each session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              No bottle sessions yet. Scan a bin and insert bottles to earn points!
            </div>
          ) : (
            <div className="space-y-4">
              {sessions
                .slice((page - 1) * pageSize, page * pageSize)
                .map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-500">
                        <Recycle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {session.bottlesInserted} bottle{session.bottlesInserted !== 1 ? 's' : ''} inserted at {session.binId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.disconnectedAt || session.connectedAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="font-mono text-sm">
                      +{session.pointsEarned} pts
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && sessions.length > pageSize && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-medium">
              {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sessions.length)}
            </span>{' '}
            of <span className="font-medium">{sessions.length}</span> sessions
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded-md disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 border rounded-md disabled:opacity-50"
              disabled={page * pageSize >= sessions.length}
              onClick={() => setPage((p) => (p * pageSize >= sessions.length ? p : p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
