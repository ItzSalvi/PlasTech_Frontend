import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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
  const { register, handleSubmit, reset } = useForm();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitReward = async (data: any) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('Name', data.name);
      formData.append('Description', data.description);
      formData.append('PointsCost', data.pointsCost);
      formData.append('Stock', data.stock);
      if (data.image && data.image[0]) {
        formData.append('Image', data.image[0]);
      }

      await api.post('/admin/rewards', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Reward added successfully!');
      reset();
    } catch (err) {
      console.error(err);
      alert('Failed to add reward');
    } finally {
      setIsUploading(false);
    }
  };

  const chartData = [
    { name: 'Users', value: analytics?.totalUsers || 0 },
    { name: 'Bottles', value: analytics?.totalBottles || 0 },
    { name: 'Redeemed', value: analytics?.totalRedemptions || 0 },
  ];

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

      <div className="grid md:grid-cols-2 gap-8">
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

        {/* Add Reward Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Reward</CardTitle>
            <CardDescription>Upload items to the rewards store</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmitReward)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input {...register('name', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Points Cost</Label>
                  <Input type="number" {...register('pointsCost', { required: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input {...register('description')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Initial Stock</Label>
                  <Input type="number" {...register('stock', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <Input type="file" accept="image/*" {...register('image')} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? 'Uploading to Cloudinary...' : 'Create Reward Item'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
