import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/modal';
import { Label } from '../components/ui/label';
import { Gift } from 'lucide-react';

interface RewardItem {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  imageUrl: string;
}

export function Redeem() {
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState<RewardItem[]>([]);
  const [redeemModal, setRedeemModal] = useState<{ item: RewardItem; quantity: number } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/rewards');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const maxQuantity = redeemModal
    ? Math.min(
        redeemModal.item.stock,
        Math.floor((user?.points ?? 0) / redeemModal.item.pointsCost)
      )
    : 0;

  const openRedeemModal = (item: RewardItem) => {
    const max = Math.min(item.stock, Math.floor((user?.points ?? 0) / item.pointsCost));
    setRedeemModal({ item, quantity: Math.max(1, Math.min(1, max)) });
  };

  const handleConfirmRedeem = async () => {
    if (!redeemModal || !user) return;
    const { item, quantity } = redeemModal;
    if (quantity < 1 || quantity > item.stock || user.points < item.pointsCost * quantity) {
      alert('Invalid quantity or not enough points.');
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await api.post(`/rewards/redeem/${item.id}`, { quantity }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setRedeemModal(null);
      await fetchItems();
      await refreshUser();
    } catch (err: unknown) {
      console.error(err);
      const msg = err && typeof err === 'object' && 'response' in err && (err.response as { data?: { message?: string } })?.data?.message;
      alert(msg || 'Failed to redeem item.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Rewards Store</h1>
        <div className="text-xl font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-4 py-2 rounded-full flex items-center gap-2">
          Your Points: <span className="font-bold">{user?.points.toLocaleString()}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center text-muted-foreground">
          <Gift className="w-12 h-12 mb-4 text-muted-foreground/60" />
          <p className="text-lg font-medium">No redeemable items are available right now.</p>
          <p className="text-sm mt-1">Please check back later when new rewards are added.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden flex flex-col">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-48 w-full object-cover" />
            ) : (
              <div className="h-48 w-full bg-muted flex items-center justify-center">
                <Gift className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.pointsCost.toLocaleString()} pts</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-xs text-muted-foreground mt-4">Stock: {item.stock}</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                disabled={item.stock <= 0 || (user?.points ?? 0) < item.pointsCost}
                onClick={() => openRedeemModal(item)}
              >
                {item.stock <= 0 
                  ? 'Out of Stock' 
                  : (user?.points ?? 0) < item.pointsCost 
                    ? 'Not enough points' 
                    : 'Redeem now'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      )}

      <Modal
        open={!!redeemModal}
        onClose={() => !isRedeeming && setRedeemModal(null)}
        title="Confirm redemption"
        description="Choose quantity and confirm."
      >
        {redeemModal && (
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              {redeemModal.item.imageUrl ? (
                <img src={redeemModal.item.imageUrl} alt="" className="h-20 w-20 object-cover rounded-lg" />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                  <Gift className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-semibold">{redeemModal.item.name}</p>
                <p className="text-sm text-muted-foreground">{redeemModal.item.pointsCost.toLocaleString()} pts each</p>
                <p className="text-xs text-muted-foreground">Stock: {redeemModal.item.stock}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="redeem-qty">Quantity</Label>
              <input
                id="redeem-qty"
                type="number"
                min={1}
                max={maxQuantity}
                value={redeemModal.quantity}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!Number.isNaN(v))
                    setRedeemModal((prev) => prev ? { ...prev, quantity: Math.max(1, Math.min(maxQuantity, v)) } : null);
                }}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              />
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{(redeemModal.item.pointsCost * redeemModal.quantity).toLocaleString()} pts</span>
              </p>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setRedeemModal(null)} disabled={isRedeeming}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRedeem}
                disabled={isRedeeming || redeemModal.quantity < 1 || redeemModal.quantity > maxQuantity}
              >
                {isRedeeming ? 'Redeeming...' : 'Confirm redemption'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
