import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Trash2, Edit, Plus, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../../components/ui/modal';

interface RewardItem {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
}

export function Rewards() {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', pointsCost: 0, stock: 0, isActive: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/rewards');
      setRewards(data);
      setPage(1);
    } catch (err) {
      console.error("Failed to fetch rewards", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', description: '', pointsCost: 0, stock: 0, isActive: true });
    setImageFile(null);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (reward: RewardItem) => {
    setFormData({
      name: reward.name,
      description: reward.description || '',
      pointsCost: reward.pointsCost,
      stock: reward.stock,
      isActive: reward.isActive
    });
    setEditingId(reward.id);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      const data = new FormData();
      data.append('Name', formData.name);
      data.append('Description', formData.description);
      data.append('PointsCost', formData.pointsCost.toString());
      data.append('Stock', formData.stock.toString());
      data.append('IsActive', formData.isActive.toString());
      if (imageFile) data.append('Image', imageFile);

      if (editingId) {
        await api.put(`/admin/rewards/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/admin/rewards', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      
      fetchRewards();
      resetForm();
    } catch (err) {
      console.error("Failed to save reward", err);
      alert('Failed to save reward item.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reward item? It will be marked as inactive.')) return;
    try {
      await api.delete(`/admin/rewards/${id}`);
      fetchRewards();
    } catch (err) {
      console.error("Failed to delete reward", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Redeemable Items</h1>
          <p className="text-muted-foreground mt-1">Manage the rewards catalog where users spend their points.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        </div>
      </div>

      <Modal
        open={isFormOpen}
        onClose={resetForm}
        title={editingId ? 'Edit Reward Item' : 'Create New Reward Item'}
        description="Configure the details for this redeemable item."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Points Cost</Label>
              <Input
                type="number"
                min="0"
                value={formData.pointsCost}
                onChange={(e) =>
                  setFormData({ ...formData, pointsCost: parseInt(e.target.value || '0', 10) })
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inventory Stock</Label>
              <Input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value || '0', 10) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Image Upload {editingId && '(Leave blank to keep current)'}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {editingId && (
            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(c) => setFormData({ ...formData, isActive: c })}
              />
              <Label>Is Active (Visible to users)</Label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={resetForm} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Item'}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase border-b">
            <tr>
              <th className="px-4 py-3 font-medium w-16">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Cost</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
             {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground animate-pulse">Loading rewards...</td>
                </tr>
              ) : rewards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No reward items found.</td>
                </tr>
              ) : (
                rewards
                .slice((page - 1) * pageSize, page * pageSize)
                .map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                       {r.imageUrl ? (
                         <div className="w-10 h-10 rounded-md overflow-hidden bg-muted border">
                           <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                         </div>
                       ) : (
                         <div className="w-10 h-10 rounded-md bg-muted border flex items-center justify-center text-muted-foreground">
                           <ImageIcon className="w-5 h-5" />
                         </div>
                       )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{r.description}</div>
                    </td>
                    <td className="px-4 py-3 font-mono">{r.pointsCost} pts</td>
                    <td className="px-4 py-3">{r.stock}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.isActive ? 'default' : 'secondary'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>

      {!loading && rewards.length > 10 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-medium">
              {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, rewards.length)}
            </span>{' '}
            of <span className="font-medium">{rewards.length}</span> items
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
              disabled={page * pageSize >= rewards.length}
              onClick={() =>
                setPage((p) =>
                  p * pageSize >= rewards.length ? p : p + 1
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
