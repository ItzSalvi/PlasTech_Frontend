import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Trophy } from 'lucide-react';

interface LeaderboardUser {
  id: number;
  fullName: string;
  points: number;
  avatarUrl?: string;
}

export function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const lbRes = await api.get('/admin/leaderboard');
        setLeaderboard(lbRes.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="text-center flex flex-col items-center">
          <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-4xl font-bold tracking-tight">Global Leaderboard</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            The ultimate ranking of all PlasTech recyclers. Keep an eye on the top contenders who will take home the Monthly Awards!
          </p>
        </div>
        <Link to="/admin">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-2 shadow-lg">
        <CardContent className="p-0">
          {loading ? (
             <div className="py-12 text-center text-muted-foreground animate-pulse">Loading rankings...</div>
          ) : leaderboard.length === 0 ? (
             <div className="py-12 text-center text-muted-foreground">No participants yet.</div>
          ) : (
            <div className="divide-y">
              {leaderboard
                .slice((page - 1) * pageSize, page * pageSize)
                .map((u, index) => {
                  const i = (page - 1) * pageSize + index;
                  return (
                <div key={u.id} className={`flex items-center justify-between p-4 sm:p-6 transition-colors hover:bg-muted/30 ${i < 3 ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 shadow-sm
                      ${i === 0 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 
                        i === 1 ? 'bg-slate-100 text-slate-700 border-slate-300' : 
                        i === 2 ? 'bg-amber-100/50 text-amber-700 border-amber-300/50' : 
                        'bg-muted text-muted-foreground border-transparent'}`}>
                      #{i + 1}
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.fullName} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold border border-border text-muted-foreground">
                          {u.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg leading-none">{u.fullName}</h3>
                        {i === 0 && <span className="text-xs font-medium text-yellow-600 dark:text-yellow-500 flex flex-col sm:inline">Current Champion</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight">{u.points.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Points</div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && leaderboard.length > pageSize && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-medium">
              {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, leaderboard.length)}
            </span>{' '}
            of <span className="font-medium">{leaderboard.length}</span> users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= leaderboard.length}
              onClick={() =>
                setPage((p) =>
                  p * pageSize >= leaderboard.length ? p : p + 1
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
