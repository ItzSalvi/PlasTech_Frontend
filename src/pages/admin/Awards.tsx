import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Trophy, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/modal';

interface MonthlyAward {
  id: number;
  month: number;
  year: number;
  rankTarget: number;
  awardPoints: number;
  description: string;
  imageUrl?: string;
}

export function Awards() {
  const [awards, setAwards] = useState<MonthlyAward[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [formData, setFormData] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), rankTarget: 1, awardPoints: 500, description: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/awards');
      setAwards(data);
    } catch (err) {
      console.error("Failed to fetch awards", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError('');
      if (!formData.description.trim()) {
        setFormError('Description is required.');
        return;
      }
      const data = new FormData();
      data.append('Month', formData.month.toString());
      data.append('Year', formData.year.toString());
      data.append('RankTarget', formData.rankTarget.toString());
      data.append('AwardPoints', formData.awardPoints.toString());
      data.append('Description', formData.description.trim());
      if (imageFile) data.append('Image', imageFile);

      await api.post('/admin/awards', data);
      fetchAwards();
      setIsFormOpen(false);
      setFormData({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), rankTarget: 1, awardPoints: 500, description: '' });
      setImageFile(null);
    } catch (err) {
      console.error("Failed to create award", err);
      setFormError('Failed to create award. Please check your inputs and try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this award?')) return;
    try {
      await api.delete(`/admin/awards/${id}`);
      fetchAwards();
    } catch (err) {
      console.error("Failed to delete award", err);
    }
  };

  const handleDistribute = async () => {
    if (!confirm('WARNING: This will distribute points to the top users and RESET all user points to 0 for the new month. Are you absolutely sure you want to proceed?')) return;
    try {
      setIsDistributing(true);
      const res = await api.post('/admin/awards/distribute');
      alert(`Success: ${res.data.message}\n\nActions Taken:\n` + (res.data.distributions || []).join('\n'));
      fetchAwards();
    } catch (err: any) {
      console.error("Failed to distribute", err);
      alert(err.response?.data?.message || 'Failed to distribute awards.');
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
         <div>
          <h1 className="text-3xl font-bold">Monthly Rankings Awards</h1>
          <p className="text-muted-foreground mt-1">Set the prizes for the top recyclers at the end of each month.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
          <Button variant="secondary" onClick={handleDistribute} disabled={isDistributing} className="flex items-center gap-2">
             {isDistributing ? 'Processing...' : 'Run End of Month Distribution'}
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Award
          </Button>
        </div>
      </div>

      <Modal
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormData({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), rankTarget: 1, awardPoints: 500, description: '' });
          setImageFile(null);
          setFormError('');
        }}
        title="Create New Monthly Award"
        description="Configure the rewards for specific leaderboard ranks for a given month."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value || '0', 10) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Month (1-12)</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value || '1', 10) })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Target Leaderboard Rank</Label>
            <Input
              type="number"
              min="1"
              value={formData.rankTarget}
              onChange={(e) => setFormData({ ...formData, rankTarget: parseInt(e.target.value || '1', 10) })}
              required
            />
            <p className="text-xs text-muted-foreground">
              e.g. "1" for 1st place, "2" for 2nd place.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Bonus Points Awarded</Label>
            <Input
              type="number"
              min="1"
              value={formData.awardPoints}
              onChange={(e) => setFormData({ ...formData, awardPoints: parseInt(e.target.value || '1', 10) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Prize description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Monthly Top Recycler Bonus"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Award Image (Optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setFormData({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), rankTarget: 1, awardPoints: 500, description: '' });
                setImageFile(null);
                setFormError('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Publish Award
            </Button>
          </div>
        </form>
      </Modal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             <div className="col-span-full py-12 text-center text-muted-foreground animate-pulse">Loading awards...</div>
        ) : awards.length === 0 ? (
           <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">No awards configured yet.</div>
        ) : (
          awards
          .slice((page - 1) * pageSize, page * pageSize)
          .map((award) => (
             <Card key={award.id} className="overflow-hidden flex flex-col">
               {award.imageUrl ? (
                  <div className="h-40 w-full overflow-hidden bg-muted">
                    <img src={award.imageUrl} alt={award.description} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-40 w-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-primary/50" />
                  </div>
                )}
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-background">{award.year}-{award.month.toString().padStart(2, '0')}</Badge>
                    <Badge className={award.rankTarget === 1 ? 'bg-yellow-500' : award.rankTarget === 2 ? 'bg-slate-400' : 'bg-amber-600'}>
                       Rank #{award.rankTarget}
                    </Badge>
                  </div>
                  <div className="flex-1">
                     <div className="font-mono text-xl font-bold text-green-600 dark:text-green-500 mb-1">+{award.awardPoints} Points</div>
                     <p className="text-sm font-medium text-foreground">{award.description}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(award.id)} className="w-full mt-4">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </CardContent>
             </Card>
          ))
        )}
      </div>

      {!loading && awards.length > pageSize && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-medium">
              {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, awards.length)}
            </span>{' '}
            of <span className="font-medium">{awards.length}</span> awards
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
              disabled={page * pageSize >= awards.length}
              onClick={() =>
                setPage((p) =>
                  p * pageSize >= awards.length ? p : p + 1
                )
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
