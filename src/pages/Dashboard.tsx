import { useEffect, useState } from 'react';
import { GlobalLoading } from '../components/ui/GlobalLoading';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Target, Trophy, QrCode, ArrowUpRight, ArrowDownRight, Users, Calendar, DollarSign, TrendingUp, Briefcase, Clock } from 'lucide-react';
import dashboardIllustration from '../assets/dashboard-illustration.png';

const LeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" {...props}>
    <path d="M216.3 124C262.5 44 378 44 424.2 124L461.5 188.6L489.2 172.6C497.6 167.7 508.1 168.4 515.8 174.3C523.5 180.2 526.9 190.2 524.4 199.6L500.9 287C497.5 299.8 484.3 307.4 471.5 304L384.1 280.6C374.7 278.1 367.8 270.2 366.5 260.6C365.2 251 369.9 241.5 378.3 236.7L406 220.7L368.7 156.1C347.1 118.8 293.3 118.8 271.7 156.1L266.4 165.2C257.6 180.5 238 185.7 222.7 176.9C207.4 168.1 202.2 148.5 211 133.1L216.3 124zM513.7 343.1C529 334.3 548.6 339.5 557.4 354.8L562.7 363.9C608.9 443.9 551.2 543.9 458.8 543.9L384.2 543.9L384.2 575.9C384.2 585.6 378.4 594.4 369.4 598.1C360.4 601.8 350.1 599.8 343.2 592.9L279.2 528.9C269.8 519.5 269.8 504.3 279.2 495L343.2 431C350.1 424.1 360.4 422.1 369.4 425.8C378.4 429.5 384.2 438.3 384.2 448L384.2 480L458.8 480C501.9 480 528.9 433.3 507.3 396L502 386.9C493.2 371.6 498.4 352 513.7 343.2zM115 299.4L87.3 283.4C78.9 278.5 74.2 269.1 75.5 259.5C76.8 249.9 83.7 242 93.1 239.5L180.5 216C193.3 212.6 206.5 220.2 209.9 233L233.3 320.4C235.8 329.8 232.4 339.7 224.7 345.7C217 351.7 206.5 352.3 198.1 347.4L170.4 331.4L133.1 396C111.5 433.3 138.5 480 181.6 480L192.2 480C209.9 480 224.2 494.3 224.2 512C224.2 529.7 209.9 544 192.2 544L181.6 544C89.3 544 31.6 444 77.8 364L115 299.4z" />
  </svg>
);
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, txRes, lbRes] = await Promise.all([
          api.get('/user/stats'),
          api.get('/user/transactions'),
          api.get('/user/leaderboard')
        ]);
        setStats(statsRes.data);
        setTransactions(txRes.data.slice(0, 5));
        setLeaderboard(lbRes.data.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const chartData = [6, 5, 4, 3, 2, 1, 0].map(daysAgo => {
    const date = subDays(new Date(), daysAgo);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTxs = transactions.filter(t => t.date.startsWith(dateStr) && t.type === 'Earned');
    return {
      name: format(date, 'MMM d'),
      points: dayTxs.reduce((sum, t) => sum + t.points, 0)
    };
  });

  if (isLoading) {
    return <GlobalLoading />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section - Modern Green Card Style */}
        <div className="mb-12">
          <Card className="relative overflow-hidden border-0 shadow-2xl rounded-3xl" style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #e0f2fe 100%)', minHeight: '320px' }}>
            {/* Gradient overlay for extra effect */}
            <div className="absolute inset-0 z-0 bg-linear-to-br from-green-50/80 via-emerald-50/60 to-blue-50/40 pointer-events-none" />
            <CardContent className="relative flex flex-col md:flex-row items-center justify-between gap-10 p-12 z-10 min-h-[320px]">
              <div className="flex-1 flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Hello, <span className="inline-block">{user?.fullName}</span>
                  </h1>
                  <span className="ml-2 text-4xl align-middle">👋</span>
                </div>
                <p className="text-xl text-gray-700 mb-4">Overview of your recycling impact and performance in PlasTech</p>
                <Link to="/insert">
                  <Button className="mt-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg gap-2 rounded-[10px] px-8 py-5 text-lg">
                    <QrCode className="h-6 w-6" />
                    Scan Bin QR
                  </Button>
                </Link>
              </div>
              <div className="shrink-0 flex items-center justify-center w-80 h-72 md:w-96 md:h-80">
                <img src={dashboardIllustration} alt="Dashboard Illustration" className="w-full h-full object-contain" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-linear-to-br from-white to-green-50/50 dark:from-gray-800 dark:to-gray-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-green-600 dark:text-green-400">
                    <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75h-9Z" />
                  </svg>
                </div>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                  Current Balance
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {user?.points.toLocaleString()} pts
                </div>
                <p className="text-sm text-muted-foreground">Total points earned from recycling</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-linear-to-br from-white to-teal-50/50 dark:from-gray-800 dark:to-gray-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                  <LeafIcon className="h-6 w-6 text-teal-600 dark:text-teal-400 fill-current" />
                </div>
                <Badge variant="outline" className="bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
                  Total Recycled
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                  {stats?.totalBottles.toLocaleString() ?? '0'}
                </div>
                <p className="text-sm text-muted-foreground">Bottles recycled to date</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-linear-to-br from-white to-amber-50/50 dark:from-gray-800 dark:to-gray-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                  Global Ranking
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                  #{stats?.leaderboardRank.toLocaleString() ?? 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">Among all recyclers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row removed as requested */}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Analytics Chart */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-green-100 dark:border-green-900">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Points earned over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-80 pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                      background: 'white',
                      padding: '8px 12px'
                    }}
                  />
                  <Bar dataKey="points" radius={[8, 8, 0, 0]} className="fill-green-500 hover:fill-green-600 transition-colors" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-green-100 dark:border-green-900">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Your latest insertions and redemptions</CardDescription>
              </div>
              <Link to="/transactions">
                <Button variant="outline" size="sm" className="rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <LeafIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No recent transactions.</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/10 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.type === 'Earned' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {tx.type === 'Earned' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none mb-1">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'MMM d, h:mm a')}</p>
                        </div>
                      </div>
                      <Badge
                        variant={tx.type === 'Earned' ? 'default' : 'destructive'}
                        className={`font-mono px-3 py-1 rounded-lg ${tx.type === 'Earned'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                      >
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
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-green-100 dark:border-green-900">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Global Leaderboard
            </CardTitle>
            <CardDescription>Top recyclers in the PlasTech ecosystem</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {leaderboard.map((u, i) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${u.id === user?.id
                      ? 'bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800'
                      : 'hover:bg-green-50/50 dark:hover:bg-green-900/5'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${i === 0
                          ? 'bg-linear-to-br from-yellow-400 to-amber-500 text-white shadow-md'
                          : i === 1
                            ? 'bg-linear-to-br from-gray-300 to-gray-400 text-gray-800 shadow-md'
                            : i === 2
                              ? 'bg-linear-to-br from-amber-300 to-orange-400 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground'
                        }`}
                    >
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </div>
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-green-200 dark:border-green-800"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center text-sm font-semibold text-white shadow-md">
                          {u.fullName.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">
                        {u.fullName} {u.id === user?.id && <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">You</Badge>}
                      </span>
                    </div>
                  </div>
                  <div className="font-mono text-sm font-semibold text-green-600 dark:text-green-400">
                    {u.points.toLocaleString()} pts
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}