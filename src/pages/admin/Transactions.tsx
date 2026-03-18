import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { format } from 'date-fns';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Search } from 'lucide-react';

interface AdminTransaction {
  id: string;
  user: string;
  email: string;
  type: 'Earned' | 'Spent';
  description: string;
  points: number;
  date: string;
}

export function Transactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchTransactions = async (query = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/transactions${query ? `?search=${encodeURIComponent(query)}` : ''}`);
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch admin transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions(search);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">System Transactions</h1>
          <p className="text-muted-foreground mt-1">Monitor all bottle recycling and reward redemptions.</p>
        </div>
        <Link to="/admin">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex max-w-sm w-full relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by user name or email..." 
              className="pl-9 pr-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left relative">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Loading transactions...</td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No transactions found matching your criteria.</td>
                  </tr>
                ) : (
                  transactions
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {format(new Date(tx.date), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{tx.user}</div>
                        <div className="text-xs text-muted-foreground">{tx.email}</div>
                      </td>
                      <td className="px-6 py-4">{tx.description}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant={tx.type === 'Earned' ? 'default' : 'destructive'} className="font-mono">
                          {tx.type === 'Earned' ? '+' : ''}{tx.points}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {!loading && transactions.length > pageSize && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-medium">
              {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, transactions.length)}
            </span>{' '}
            of <span className="font-medium">{transactions.length}</span> records
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
              disabled={page * pageSize >= transactions.length}
              onClick={() =>
                setPage((p) =>
                  p * pageSize >= transactions.length ? p : p + 1
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
