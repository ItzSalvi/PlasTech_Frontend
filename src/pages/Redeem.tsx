import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
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
  const [isRedeeming, setIsRedeeming] = useState<number | null>(null);

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

  const handleRedeem = async (item: RewardItem) => {
    if (!user || user.points < item.pointsCost) {
      alert("Not enough points!");
      return;
    }

    if (!window.confirm(`Are you sure you want to redeem ${item.name} for ${item.pointsCost} points?`)) {
      return;
    }

    setIsRedeeming(item.id);
    try {
      const res = await api.post(`/rewards/redeem/${item.id}`, {}, { responseType: 'blob' });
      
      // Download the PDF returned by the backend
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      // Note: Backend might send a specific filename in Content-Disposition header, but we'll default:
      link.setAttribute('download', `receipt-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      await fetchItems(); // Refresh stock
      await refreshUser(); // Refresh points
    } catch (err) {
      console.error(err);
      alert("Failed to redeem item.");
    } finally {
      setIsRedeeming(null);
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
                disabled={item.stock <= 0 || (user?.points ?? 0) < item.pointsCost || isRedeeming === item.id}
                onClick={() => handleRedeem(item)}
              >
                {isRedeeming === item.id 
                  ? 'Redeeming...' 
                  : item.stock <= 0 
                    ? 'Out of Stock' 
                    : (user?.points ?? 0) < item.pointsCost 
                      ? 'Not enough points' 
                      : 'Redeem'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
