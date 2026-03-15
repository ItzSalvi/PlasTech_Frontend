import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { LogOut, Moon, Sun, Leaf } from 'lucide-react';

export function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b bg-background shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-green-600">
          <Leaf className="h-6 w-6" />
          PlasTech
        </Link>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/redeem">
                <Button variant="ghost">Redeem</Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline">Admin</Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
