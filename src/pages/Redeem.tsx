import { useEffect, useState } from 'react';
import { GlobalLoading } from '../components/ui/GlobalLoading';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/modal';
import { Label } from '../components/ui/label';
import { Gift, Sparkles, CheckCircle, Info } from 'lucide-react';
import { Badge } from '../components/ui/badge';

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
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
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

  if (isRedeeming || loading) {
    return <GlobalLoading />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-950/40 dark:via-background dark:to-green-900/20 border border-green-100/50 dark:border-green-900/50 shadow-sm">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="relative px-6 py-12 sm:px-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-center sm:text-left space-y-4 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-green-600 dark:text-green-500 flex items-center justify-center sm:justify-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 sm:h-10 sm:w-10">
                <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75h-9Z" />
              </svg>
              Reward Store
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Turn your green efforts into exciting rewards. Browse our catalog and spend your hard-earned points!
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-white/10 min-w-[200px] transform hover:scale-105 transition-transform duration-300">
            <span className="text-sm font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-1">Your Balance</span>
            <div className="flex items-baseline gap-1 focus:outline-none">
              <span className="text-4xl sm:text-5xl font-black text-foreground">{user?.points.toLocaleString() || 0}</span>
              <span className="text-lg font-bold text-muted-foreground">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {items.length === 0 ? (
        <div className="mt-16 py-20 flex flex-col items-center justify-center text-center bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
          <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Gift className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Check back soon!</h3>
          <p className="text-muted-foreground max-w-md">We're updating our rewards catalog. More exciting items will be available shortly.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 ml:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
        {items.map((item) => {
          const outOfStock = item.stock <= 0;
          const canAfford = (user?.points ?? 0) >= item.pointsCost;
          
          return (
            <Card key={item.id} className="group overflow-hidden flex flex-col border-border/50 hover:border-green-500/30 hover:shadow-xl transition-all duration-300 bg-card">
              <div className="relative h-56 w-full overflow-hidden bg-muted/30">
                {outOfStock && (
                  <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                    <Badge variant="secondary" className="text-lg py-1 px-4 shadow-lg border-background">Out of Stock</Badge>
                  </div>
                )}
                {!outOfStock && !canAfford && (
                   <div className="absolute top-3 left-3 z-10">
                     <Badge variant="secondary" className="bg-background/80 backdrop-blur text-xs font-semibold">Need more points</Badge>
                   </div>
                )}
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <Gift className="h-16 w-16 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 flex justify-between items-end">
                   <Badge variant="default" className="bg-green-500 hover:bg-green-500 font-bold border-none text-white shadow-md">
                     {item.pointsCost.toLocaleString()} pts
                   </Badge>
                   <span className="text-white/90 text-xs font-medium bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                     {item.stock} left
                   </span>
                </div>
              </div>
              
              <CardHeader className="pb-3 flex-none">
                <CardTitle className="text-xl line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{item.description}</p>
              </CardContent>
              <CardFooter className="pt-2 pb-5">
                <Button 
                  className={`w-full py-6 font-semibold transition-all duration-300 ${!outOfStock && canAfford ? 'hover:-translate-y-1 hover:shadow-md bg-green-600 hover:bg-green-700 text-white' : ''}`}
                  disabled={outOfStock || !canAfford}
                  onClick={() => openRedeemModal(item)}
                >
                  {outOfStock 
                    ? 'Out of Stock' 
                    : !canAfford 
                      ? 'Not Enough Points' 
                      : 'Redeem Reward'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      )}

      {/* Redemption Modal */}
      <Modal
        open={!!redeemModal}
        onClose={() => !isRedeeming && setRedeemModal(null)}
        title={
          <span className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-500" /> Confirm Redemption
          </span>
        }
        description="Review your selection and choose the quantity."
      >
        {redeemModal && (
          <div className="space-y-6 pt-2">
            
            {/* Item Summary */}
            <div className="flex gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
              {redeemModal.item.imageUrl ? (
                <img src={redeemModal.item.imageUrl} alt="" className="h-24 w-24 object-cover rounded-lg shadow-sm" />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                  <Gift className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
              <div className="flex flex-col justify-center">
                <h4 className="font-bold text-lg leading-tight mb-1">{redeemModal.item.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    {redeemModal.item.pointsCost.toLocaleString()} pts / ea
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {redeemModal.item.stock} available in stock
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3 px-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="redeem-qty" className="text-base font-semibold">Quantity to Redeem</Label>
                <div className="text-sm font-medium">
                  Max: <span className="text-primary">{maxQuantity}</span>
                </div>
              </div>
              <div className="relative">
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
                  className="w-full h-12 px-4 rounded-lg border-2 border-input focus:border-green-500 focus:ring focus:ring-green-500/20 outline-none transition-all text-lg font-medium bg-background"
                />
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center justify-between border border-green-100 dark:border-green-900/50">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <Info className="w-5 h-5" />
                <span className="font-medium">Total Cost</span>
              </div>
              <div className="text-2xl font-black text-green-700 dark:text-green-400">
                {(redeemModal.item.pointsCost * redeemModal.quantity).toLocaleString()} <span className="text-base font-semibold">pts</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setRedeemModal(null)} disabled={isRedeeming} className="w-full sm:w-auto h-11 px-6">
                Cancel
              </Button>
              <Button
                className="w-full sm:w-auto h-11 px-8 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                onClick={handleConfirmRedeem}
                disabled={isRedeeming || redeemModal.quantity < 1 || redeemModal.quantity > maxQuantity}
              >
                {isRedeeming ? 'Processing...' : 'Confirm Redemption'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
