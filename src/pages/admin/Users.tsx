import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { format } from 'date-fns';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';

interface SystemUser {
  id: number;
  fullName: string;
  email: string;
  points: number;
  role: string;
  createdAt: string;
  avatarUrl?: string;
}

interface YearlyRecord {
  year: number;
  bottlesInserted: number;
  pointsFromBottles: number;
  pointsSpentOnRewards: number;
  awardPoints: number;
}

interface UserDetail {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  yearlyRecords: YearlyRecord[];
}

export function Users() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data } = await api.get('/admin/users');
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const openUserDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const { data } = await api.get(`/admin/users/${id}/yearly-record`);
      const mapped: UserDetail = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        avatarUrl: data.avatarUrl,
        createdAt: data.createdAt,
        yearlyRecords: (data.yearlyRecords || []).map((r: any) => ({
          year: r.year,
          bottlesInserted: r.bottlesInserted,
          pointsFromBottles: r.pointsFromBottles,
          pointsSpentOnRewards: r.pointsSpentOnRewards,
          awardPoints: r.awardPoints,
        })),
      };
      setSelectedUser(mapped);
    } catch (err) {
      console.error('Failed to load user detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users Only</h1>
          <p className="text-muted-foreground mt-1">View all non-admin users in the PlasTech system.</p>
        </div>
        <Link to="/admin">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Active Users: {users.length}</CardTitle>
          <CardDescription>Accounts registered via standard sign-up or Google OAuth.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left relative">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium text-right">Current Balance</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No users found.</td>
                  </tr>
                ) : (
                  users
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((u) => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
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
                          <div>
                            <div className="font-medium text-foreground">{u.fullName}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(u.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="secondary" className="font-mono">{u.points} pts</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => openUserDetail(u.id)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {!loading && users.length > pageSize && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-medium">
              {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, users.length)}
            </span>{' '}
            of <span className="font-medium">{users.length}</span> users
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
              disabled={page * pageSize >= users.length}
              onClick={() =>
                setPage((p) =>
                  p * pageSize >= users.length ? p : p + 1
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.fullName}
        description={selectedUser ? `Joined ${format(new Date(selectedUser.createdAt), 'MMM d, yyyy')}` : ''}
      >
        {detailLoading || !selectedUser ? (
          <div className="py-10 text-center text-muted-foreground">Loading user details...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {selectedUser.avatarUrl ? (
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.fullName}
                  className="w-14 h-14 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground border border-border">
                  {selectedUser.fullName.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-semibold">{selectedUser.fullName}</div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <h3 className="text-sm font-semibold mb-2">Yearly Record</h3>
              {selectedUser.yearlyRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedUser.yearlyRecords.map((r) => (
                    <div
                      key={r.year}
                      className="rounded-md border px-3 py-2 text-xs bg-muted/40 flex flex-col gap-1"
                    >
                      <div className="font-semibold text-sm">Year {r.year}</div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bottles inserted</span>
                        <span className="font-mono">{r.bottlesInserted.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Points from bottles</span>
                        <span className="font-mono">{r.pointsFromBottles.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Points spent on rewards</span>
                        <span className="font-mono">-{r.pointsSpentOnRewards.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Award points earned</span>
                        <span className="font-mono">+{r.awardPoints.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
