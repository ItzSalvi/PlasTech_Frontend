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
import { AdminDashboard } from './pages/admin/AdminDashboard';

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/insert" element={<InsertBottles />} />
            <Route path="/redeem" element={<Redeem />} />
          </Route>
          
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
