import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Award, Target, Trophy } from 'lucide-react';

interface Stats {
  totalBottles: number;
  totalRedemptions: number;
  leaderboardRank: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get('/user/stats');
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-green-700 dark:text-green-500">
        Welcome back, {user?.fullName}!
      </h1>

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
            <div className="text-3xl font-bold">#{stats?.leaderboardRank.toLocaleString() ?? '...'}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Could embed Leaderboard component here as well */}
    </div>
  );
}
