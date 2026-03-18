import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { Gift } from 'lucide-react';

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

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">History</h1>

      <Card>
        <CardHeader>
          <CardTitle>Redeemed items</CardTitle>
          <CardDescription>Items you have redeemed and the points deducted.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">Loading history...</div>
          ) : redemptions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              No redemptions yet. Earn points and redeem rewards!
            </div>
          ) : (
            <div className="space-y-4">
              {redemptions
                .slice((page - 1) * pageSize, page * pageSize)
                .map((r) => (
                  <div
                    key={r.receiptCode + r.redeemedAt}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500">
                        <Gift className="h-5 w-5" />
                      </div>
                      {r.item.imageUrl && (
                        <img
                          src={r.item.imageUrl}
                          alt=""
                          className="h-12 w-12 object-cover rounded-md"
                        />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {r.item.name}{r.quantity > 1 ? ` (x${r.quantity})` : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(r.redeemedAt), 'MMM d, yyyy • h:mm a')} • {r.receiptCode}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="font-mono text-sm">
                      −{r.pointsSpent} pts
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && redemptions.length > pageSize && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-medium">
              {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, redemptions.length)}
            </span>{' '}
            of <span className="font-medium">{redemptions.length}</span> redemptions
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
              disabled={page * pageSize >= redemptions.length}
              onClick={() => setPage((p) => (p * pageSize >= redemptions.length ? p : p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
