import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Award, Target, Trophy, QrCode, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface Stats {
  totalBottles: number;
  totalRedemptions: number;
  leaderboardRank: number;
}

interface Transaction {
  id: string;
  type: 'Earned' | 'Spent';
  description: string;
  points: number;
  date: string;
}

interface LeaderboardUser {
  id: number;
  fullName: string;
  points: number;
  avatarUrl?: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, txRes, lbRes] = await Promise.all([
          api.get('/user/stats'),
          api.get('/user/transactions'),
          api.get('/user/leaderboard')
        ]);
        setStats(statsRes.data);
        setTransactions(txRes.data.slice(0, 5)); // Just recent 5
        setLeaderboard(lbRes.data.slice(0, 10)); // Top 10
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    }
    fetchData();
  }, []);

  // Generate chart data based on transactions
  const chartData = [6, 5, 4, 3, 2, 1, 0].map(daysAgo => {
    const date = subDays(new Date(), daysAgo);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTxs = transactions.filter(t => t.date.startsWith(dateStr) && t.type === 'Earned');
    return {
      name: format(date, 'MMM d'),
      points: dayTxs.reduce((sum, t) => sum + t.points, 0)
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-500">
          Welcome back, {user?.fullName}!
        </h1>
        <Link to="/insert">
          <Button size="lg" className="gap-2 shadow-md hover:scale-105 transition-all">
            <QrCode className="h-5 w-5" />
            Scan Bin QR
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Points</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{user?.points.toLocaleString()} pts</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bottles Recycled</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalBottles.toLocaleString() ?? '...'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Global Rank</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.leaderboardRank ? `#${stats.leaderboardRank.toLocaleString()}` : '...'}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Analytics Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Points earned over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="points" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-green-500 dark:fill-green-400" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-1 border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest insertions and redemptions</CardDescription>
            </div>
            <Link to="/transactions">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No recent transactions.</div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between group rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'Earned' ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-500' : 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500'}`}>
                        {tx.type === 'Earned' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none mb-1">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                     <Badge variant={tx.type === 'Earned' ? 'default' : 'destructive'} className="font-mono">
                      {tx.type === 'Earned' ? '+' : ''}{tx.points}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Global Leaderboard</CardTitle>
          <CardDescription>Top recyclers in the PlasTech ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  u.id === user?.id
                    ? 'bg-primary/10 border-primary/20 border text-primary font-medium'
                    : 'hover:bg-muted/50 transition-colors'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      i === 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : i === 1
                        ? 'bg-slate-100 text-slate-700'
                        : i === 2
                        ? 'bg-amber-100/50 text-amber-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    #{i + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt={u.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-border"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground border border-border">
                        {u.fullName.charAt(0)}
                      </div>
                    )}
                    <span>
                      {u.fullName} {u.id === user?.id && '(You)'}
                    </span>
                  </div>
                </div>
                <div className="font-mono text-sm">{u.points.toLocaleString()} pts</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
