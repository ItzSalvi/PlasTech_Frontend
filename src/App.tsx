import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Example placeholders until the pages are built
import { Dashboard } from './pages/Dashboard';
import { InsertBottles } from './pages/InsertBottles';
import { Redeem } from './pages/Redeem';
import { Transactions } from './pages/Transactions';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Transactions as AdminTransactions } from './pages/admin/Transactions';
import { Users as AdminUsers } from './pages/admin/Users';
import { AdminLeaderboard } from './pages/admin/AdminLeaderboard';
import { Awards as AdminAwards } from './pages/admin/Awards';
import { Rewards as AdminRewards } from './pages/admin/Rewards';
import { RedeemedItems as AdminRedeemedItems } from './pages/admin/RedeemedItems';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route element={<ProtectedRoute requireUserRole={true} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/insert" element={<InsertBottles />} />
            <Route path="/redeem" element={<Redeem />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/history" element={<History />} />
          </Route>
          
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/rewards" element={<AdminRewards />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
            <Route path="/admin/awards" element={<AdminAwards />} />
            <Route path="/admin/redemptions" element={<AdminRedeemedItems />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
