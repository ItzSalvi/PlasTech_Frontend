import { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { Users, History, Trophy, Award, Gift, Settings2, PackageCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

interface Analytics {
  totalUsers: number;
  totalAdmins: number;
  totalBottles: number;
  totalRedemptions: number;
  totalPointsCirculating: number;
  recentSessions: any[];
}

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [pointsPerBottle, setPointsPerBottle] = useState<number>(10);
  const [pointsPerBottleSaving, setPointsPerBottleSaving] = useState(false);
  const isGeneratingQr = useRef(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    api.get('/admin/settings/points-per-bottle').then((res) => {
      if (typeof res.data?.pointsPerBottle === 'number') setPointsPerBottle(res.data.pointsPerBottle);
    }).catch(() => {});
  }, []);

  const savePointsPerBottle = async () => {
    setPointsPerBottleSaving(true);
    try {
      await api.put('/admin/settings/points-per-bottle', { pointsPerBottle });
    } catch (e) {
      console.error(e);
    } finally {
      setPointsPerBottleSaving(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = [
    { name: 'Users', value: analytics?.totalUsers || 0 },
    { name: 'Bottles', value: analytics?.totalBottles || 0 },
    { name: 'Redeemed', value: analytics?.totalRedemptions || 0 },
  ];

  useEffect(() => {
    // Generate QR code once for the default bin
    const generateQr = async () => {
      if (isGeneratingQr.current || qrDataUrl) return;
      isGeneratingQr.current = true;
      try {
        const binId = 'BIN-001'; // default physical bin identifier
        const baseUrl = window.location.origin;
        // App uses HashRouter in production hosting (IIS), so the QR must include the hash route.
        const url = `${baseUrl}/#/insert?binId=${encodeURIComponent(binId)}`;
        const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 300 });
        setQrDataUrl(dataUrl);
      } catch (e) {
        console.error('Failed to generate QR code', e);
      } finally {
        isGeneratingQr.current = false;
      }
    };
    generateQr();
  }, [qrDataUrl]);

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'plastech-bin-qr.png';
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Analytics Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{analytics?.totalUsers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Bottles</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{analytics?.totalBottles}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Redemptions</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{analytics?.totalRedemptions}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Points Circl.</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{analytics?.totalPointsCirculating}</div></CardContent>
        </Card>
      </div>

      {/* Admin Navigation Menu + Bin QR */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link to="/admin/rewards">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/10">
            <Gift className="w-6 h-6" />
            <span>Manage Rewards</span>
          </Button>
        </Link>
        <Link to="/admin/users">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/10">
            <Users className="w-6 h-6" />
            <span>Manage Users</span>
          </Button>
        </Link>
        <Link to="/admin/transactions">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/10">
            <History className="w-6 h-6" />
            <span>Transactions</span>
          </Button>
        </Link>
        <Link to="/admin/redemptions">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/10">
            <PackageCheck className="w-6 h-6" />
            <span>Redeemed Items</span>
          </Button>
        </Link>
        <Link to="/admin/leaderboard">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/10">
            <Trophy className="w-6 h-6" />
            <span>Leaderboard</span>
          </Button>
        </Link>
        <Link to="/admin/awards">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/10">
            <Award className="w-6 h-6" />
            <span>Monthly Awards</span>
          </Button>
        </Link>
      </div>

      {/* Points per bottle */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Points per bottle
          </CardTitle>
          <CardDescription>
            How many points users earn per bottle inserted. Used for all new bottle logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-end gap-2">
            <div className="space-y-2 flex-1 max-w-[120px]">
              <Label htmlFor="points-per-bottle">Points</Label>
              <Input
                id="points-per-bottle"
                type="number"
                min={1}
                max={1000}
                value={pointsPerBottle}
                onChange={(e) => setPointsPerBottle(parseInt(e.target.value || '10', 10) || 10)}
              />
            </div>
            <Button onClick={savePointsPerBottle} disabled={pointsPerBottleSaving}>
              {pointsPerBottleSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bin QR Code for Insert Bottles page */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Smart Bin QR Code</CardTitle>
          <CardDescription>
            Print and stick this on the physical bin. Scanning it opens the Insert Bottles page
            and connects the current user to this bin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="PlasTech Bin QR Code"
              className="w-48 h-48 border rounded-lg bg-white p-2"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center border rounded-lg text-muted-foreground text-sm">
              Generating QR code...
            </div>
          )}
          <Button onClick={handleDownloadQr} disabled={!qrDataUrl} className="w-full sm:w-auto">
            Download QR Code
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-1 gap-8">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
