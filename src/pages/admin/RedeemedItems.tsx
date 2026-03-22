import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';
import { CheckCircle, Gift, AlertCircle, ShoppingBag } from 'lucide-react';

interface AdminRedemption {
  ids: number[];
  receiptCode: string;
  quantity: number;
  pointsSpent: number;
  redeemedAt: string;
  status: string;
  userName: string;
  userEmail: string;
  itemName: string;
  itemImageUrl: string | null;
}

export function RedeemedItems() {
  const [redemptions, setRedemptions] = useState<AdminRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);
  const pageSize = 10;

  const fetchRedemptions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/redemptions');
      setRedemptions(data);
    } catch (err) {
      console.error('Failed to fetch redemptions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const rowKey = (r: AdminRedemption) => r.receiptCode + r.redeemedAt;

  const handleConfirm = async (r: AdminRedemption) => {
    const key = rowKey(r);
    setConfirmingKey(key);
    try {
      await api.patch('/admin/redemptions/confirm-batch', { ids: r.ids });
      setRedemptions((prev) =>
        prev.map((x) => (rowKey(x) === key ? { ...x, status: 'Confirmed' } : x))
      );
    } catch (err) {
      console.error('Failed to confirm redemption', err);
    } finally {
      setConfirmingKey(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16 max-w-6xl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-green-100/30 to-transparent dark:from-green-900/10 blur-xl -z-10 rounded-3xl" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Redeemed Items <ShoppingBag className="h-6 w-6 text-green-500" />
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-lg">
            Monitor and fulfill user redemption requests. Mark items as confirmed once the physical reward has been successfully handed over.
          </p>
        </div>
        <Link to="/admin">
          <Button variant="outline" className="shadow-sm hover:shadow transition-all bg-background">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Gift className="w-5 h-5 text-green-600 dark:text-green-400" />
            All Redemptions
          </CardTitle>
          <CardDescription>
            A track record of all rewards redeemed by users in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left relative">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border/60 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">User Details</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Reward Item</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Qty</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Points</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Receipt</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 animate-pulse">
                        <Gift className="h-10 w-10 text-muted-foreground/30" />
                        <span className="text-muted-foreground font-medium">Loading redemption data...</span>
                      </div>
                    </td>
                  </tr>
                ) : redemptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
                        <span className="text-lg font-medium text-foreground">No redemptions found</span>
                        <span className="text-sm text-muted-foreground">It looks like no one has redeemed any items yet.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  redemptions
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((r) => (
                      <tr
                        key={rowKey(r)}
                        className="hover:bg-muted/20 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                          <div className="font-medium text-foreground">{format(new Date(r.redeemedAt), 'MMM d, yyyy')}</div>
                          <div>{format(new Date(r.redeemedAt), 'h:mm a')}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{r.userName}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]" title={r.userEmail}>{r.userEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {r.itemImageUrl ? (
                              <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                                <img
                                  src={r.itemImageUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 border border-border/50">
                                <Gift className="h-5 w-5 text-muted-foreground/50" />
                              </div>
                            )}
                            <span className="font-medium text-foreground line-clamp-2 max-w-[200px]" title={r.itemName}>
                              {r.itemName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-foreground font-semibold">
                          x{r.quantity}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge variant="outline" className="font-mono bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                            {r.pointsSpent} pts
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                          {r.receiptCode}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            variant={r.status === 'Confirmed' ? 'default' : 'secondary'}
                            className={`whitespace-nowrap ${r.status === 'Confirmed' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'}`}
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {r.status === 'Pending' ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-transform hover:-translate-y-0.5"
                              disabled={confirmingKey === rowKey(r)}
                              onClick={() => handleConfirm(r)}
                            >
                              {confirmingKey === rowKey(r) ? (
                                'Processing...'
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1.5" />
                                  Confirm
                                </>
                              )}
                            </Button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-medium bg-muted px-2 py-1 rounded">
                              <CheckCircle className="w-3 h-3" /> Granted
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        {/* Pagination Footer */}
        {!loading && redemptions.length > pageSize && (
          <div className="bg-muted/10 border-t border-border/50 px-6 py-4 flex items-center justify-between rounded-b-xl">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(page - 1) * pageSize + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * pageSize, redemptions.length)}</span> of <span className="font-medium text-foreground">{redemptions.length}</span> entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-background"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-background"
                disabled={page * pageSize >= redemptions.length}
                onClick={() =>
                  setPage((p) => (p * pageSize >= redemptions.length ? p : p + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
