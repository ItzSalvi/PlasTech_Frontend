import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';
import { CheckCircle, Gift } from 'lucide-react';

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Redeemed items</h1>
          <p className="text-muted-foreground mt-1">
            View all redemptions and confirm when the reward has been granted to the user.
          </p>
        </div>
        <Link to="/admin">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            All redemptions
          </CardTitle>
          <CardDescription>
            Mark as confirmed once the user has received their reward.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left relative">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium text-right">Qty</th>
                  <th className="px-6 py-3 font-medium text-right">Points</th>
                  <th className="px-6 py-3 font-medium">Receipt</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground animate-pulse">
                      Loading redemptions...
                    </td>
                  </tr>
                ) : redemptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                      No redemptions found.
                    </td>
                  </tr>
                ) : (
                  redemptions
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((r) => (
                      <tr
                        key={rowKey(r)}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {format(new Date(r.redeemedAt), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{r.userName}</div>
                          <div className="text-xs text-muted-foreground">{r.userEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {r.itemImageUrl && (
                              <img
                                src={r.itemImageUrl}
                                alt=""
                                className="h-8 w-8 object-cover rounded"
                              />
                            )}
                            <span>{r.itemName}{r.quantity > 1 ? ` (x${r.quantity})` : ''}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">{r.quantity}</td>
                        <td className="px-6 py-4 text-right font-mono">{r.pointsSpent}</td>
                        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                          {r.receiptCode}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={r.status === 'Confirmed' ? 'default' : 'secondary'}
                            className={r.status === 'Confirmed' ? 'bg-green-600' : ''}
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {r.status === 'Pending' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={confirmingKey === rowKey(r)}
                              onClick={() => handleConfirm(r)}
                            >
                              {confirmingKey === rowKey(r) ? (
                                'Confirming...'
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirm
                                </>
                              )}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">Granted</span>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {!loading && redemptions.length > pageSize && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-medium">
              {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, redemptions.length)}
            </span>{' '}
            of <span className="font-medium">{redemptions.length}</span> redemptions
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
    </div>
  );
}
