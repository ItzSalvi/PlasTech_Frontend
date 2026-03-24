import { useEffect, useState } from 'react';
import { GlobalLoading } from '../components/ui/GlobalLoading';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { Gift, Clock, ChevronRight, Inbox } from 'lucide-react';

interface RedemptionItem {
  receiptCode: string;
  quantity: number;
  pointsSpent: number;
  redeemedAt: string;
  status: string;
  item: { name: string; imageUrl: string | null };
}

export function History() {
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data } = await api.get('/rewards/history');
        setRedemptions(data);
      } catch (err) {
        console.error('Failed to fetch redemption history', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) {
    return <GlobalLoading />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 mb-16">
      {/* Premium Header */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-green-50 to-green-100/30 dark:from-green-950/40 dark:to-background border border-green-100 dark:border-green-900/40 shadow-sm p-8">
        <div className="relative z-10 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-green-600 dark:text-green-500">
            History
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-2">
            A complete chronological record of all your redeemed rewards.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-green-100/50 to-transparent dark:from-green-900/20 opacity-50 z-0" />
      </div>

      <Card className="shadow-md border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600 dark:text-green-500" />
            Redeemed Items
          </CardTitle>
          <CardDescription>Items you have successfully claimed from the reward store.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {redemptions.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-card">
              <div className="h-20 w-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4 border border-green-100 dark:border-green-900/30">
                <Inbox className="h-10 w-10 text-green-500/50" />
              </div>
              <h3 className="text-xl font-bold mb-2">No redemptions yet</h3>
              <p className="text-muted-foreground max-w-sm">You haven't redeemed any rewards. Earn points and visit the store to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {redemptions
                .slice((page - 1) * pageSize, page * pageSize)
                .map((r) => (
                  <div
                    key={r.receiptCode + r.redeemedAt}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-muted/30 transition-colors group relative"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      {r.item.imageUrl ? (
                        <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border shadow-sm group-hover:shadow-md transition-shadow">
                          <img
                            src={r.item.imageUrl}
                            alt={r.item.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-500 flex items-center justify-center flex-shrink-0 border border-amber-100 dark:border-amber-900/30 group-hover:bg-amber-100 transition-colors">
                          <Gift className="h-7 w-7" />
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground text-base group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-1">
                          {r.item.name}{r.quantity > 1 ? ` (x${r.quantity})` : ''}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground/80">Receipt: <span className="font-mono uppercase text-xs tracking-wider">{r.receiptCode}</span></span>
                          <span className="hidden sm:inline text-muted-foreground/30">•</span>
                          <span>{format(new Date(r.redeemedAt), 'MMM d, yyyy \u2014 h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 flex items-center gap-3 sm:gap-6 justify-end w-full sm:w-auto pl-[72px] sm:pl-0">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Deducted</span>
                        <Badge variant="outline" className="font-mono text-sm sm:text-base border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-1 px-3 shadow-sm rounded-lg">
                          −{r.pointsSpent} pts
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-green-500 transition-colors hidden sm:block transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
        {/* Pagination */}
        {!loading && redemptions.length > pageSize && (
          <div className="bg-muted/10 border-t border-border/50 px-6 py-4 flex items-center justify-between rounded-b-xl">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(page - 1) * pageSize + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * pageSize, redemptions.length)}</span> of <span className="font-medium text-foreground">{redemptions.length}</span> redemptions
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 border border-border bg-background hover:bg-muted text-sm font-medium rounded-lg disabled:opacity-50 transition-colors disabled:hover:bg-background"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 border border-border bg-background hover:bg-muted text-sm font-medium rounded-lg disabled:opacity-50 transition-colors disabled:hover:bg-background"
                disabled={page * pageSize >= redemptions.length}
                onClick={() => setPage((p) => (p * pageSize >= redemptions.length ? p : p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
