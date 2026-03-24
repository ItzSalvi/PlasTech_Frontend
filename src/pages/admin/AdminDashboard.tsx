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
    }).catch(() => { });
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
    <div className="relative min-h-screen overflow-x-hidden">
      {/* --- BACKGROUND SYSTEM - Clean White with Green Accents --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle Green Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-card/50 via-card/50 to-green-50/30 dark:to-green-900/10" />

        {/* Minimalist Green Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e08_1px,transparent_1px),linear-gradient(to_bottom,#22c55e08_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Soft Green Orbs */}
        <div className="absolute top-0 -right-40 w-96 h-96 bg-gradient-to-br from-green-100/40 to-emerald-100/20 dark:from-green-900/20 dark:to-emerald-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-gradient-to-tr from-green-100/30 to-emerald-100/10 dark:from-green-900/10 dark:to-emerald-900/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-50 dark:bg-green-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-6 sm:py-10 max-w-7xl space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Admin Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage the PlasTech ecosystem, track system metrics, and configure smart bins.</p>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Users</CardTitle>
              <div className="inline-flex p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 group-hover:scale-110 transition-transform">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{analytics?.totalUsers ?? '...'}</div></CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Bottles</CardTitle>
              <div className="inline-flex p-2 rounded-xl bg-green-50 dark:bg-green-900/20 group-hover:scale-110 transition-transform">
                <span className="text-green-600 dark:text-green-500 text-lg leading-none">♻</span>
              </div>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{analytics?.totalBottles ?? '...'}</div></CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Redemptions</CardTitle>
              <div className="inline-flex p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 group-hover:scale-110 transition-transform">
                <PackageCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{analytics?.totalRedemptions ?? '...'}</div></CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Points Circ.</CardTitle>
              <div className="inline-flex p-2 rounded-xl bg-teal-50 dark:bg-teal-900/20 group-hover:scale-110 transition-transform">
                <Award className="h-4 w-4 text-teal-600 dark:text-teal-500" />
              </div>
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{analytics?.totalPointsCirculating ?? '...'}</div></CardContent>
          </Card>
        </div>

        {/* Admin Navigation Menu */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { to: "/admin/rewards", icon: Gift, label: "Rewards", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
              { to: "/admin/users", icon: Users, label: "Users", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { to: "/admin/transactions", icon: History, label: "Transactions", color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20" },
              { to: "/admin/redemptions", icon: PackageCheck, label: "Redeemed", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
              { to: "/admin/leaderboard", icon: Trophy, label: "Leaderboard", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { to: "/admin/awards", icon: Award, label: "Awards", color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20" },
            ].map((item, idx) => (
              <Link key={idx} to={item.to} className="block group">
                <Card className="h-full border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 gap-3 text-center h-full">
                    <div className={`inline-flex p-3 rounded-xl ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Settings & QR Grid */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Points per bottle */}
          <Card className="border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Settings2 className="w-5 h-5 text-green-600" />
                </div>
                System Settings
              </CardTitle>
              <CardDescription>
                Configure global parameters like points rewarded per recycled bottle.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 justify-end">
              <div className="flex items-end gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-border">
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="points-per-bottle" className="text-zinc-700 dark:text-zinc-300">Points per bottle</Label>
                  <Input
                    id="points-per-bottle"
                    type="number"
                    min={1}
                    max={1000}
                    className="bg-white dark:bg-zinc-950 border-border font-bold focus-visible:ring-green-500"
                    value={pointsPerBottle}
                    onChange={(e) => setPointsPerBottle(parseInt(e.target.value || '10', 10) || 10)}
                  />
                </div>
                <Button onClick={savePointsPerBottle} disabled={pointsPerBottleSaving} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300">
                  {pointsPerBottleSaving ? 'Saving...' : 'Update'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bin QR Code */}
          <Card className="border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <PackageCheck className="w-5 h-5 text-green-600" />
                </div>
                Smart Bin QR Code
              </CardTitle>
              <CardDescription>
                Print this code and attach it to the physical bin for users to scan.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 flex-1 justify-center p-6 bg-card border-t border-border">
              <div className="p-3 bg-white border border-border shadow-sm rounded-2xl shrink-0">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="PlasTech Bin QR Code"
                    className="w-32 h-32 sm:w-40 sm:h-40"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center text-muted-foreground text-sm">
                    Generating...
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
                  Contains route hash for the scanning process.
                </p>
                <Button onClick={handleDownloadQr} disabled={!qrDataUrl} variant="outline" className="w-full border-border shadow-sm hover:border-green-500/50 transition-all group">
                  <span className="group-hover:text-green-600 transition-colors">Download PNG</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-1 gap-8">
          {/* Chart */}
          <Card className="border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="text-zinc-900 dark:text-zinc-50">System Activity</CardTitle>
              <CardDescription>Live progression of ecosystem metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888888' }} dx={-10} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                  <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} className="fill-green-600 dark:fill-green-500" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
