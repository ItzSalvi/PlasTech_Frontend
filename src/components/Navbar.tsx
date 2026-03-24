import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { LogOut, Leaf, Menu, X } from 'lucide-react';
import { Modal } from './ui/modal';
import PlasTechLogo from '../assets/PlasTech_Logo.png';

export function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  const requestLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    close();
    logout();
  };

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'));
    return (
      <Link to={to} onClick={close} className="w-full sm:w-auto">
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={`w-full justify-start transition-all ${
            isActive 
              ? 'text-green-700 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20' 
              : 'text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400'
          }`}
        >
          {children}
        </Button>
      </Link>
    );
  };

  const userLinks = (
    <>
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/insert">Insert Bottles</NavLink>
      <NavLink to="/redeem">Redeem</NavLink>
      <NavLink to="/transactions">Transactions</NavLink>
      <NavLink to="/history">History</NavLink>
    </>
  );

  const adminLinks = (
    <NavLink to="/admin">Admin Dashboard</NavLink>
  );

  return (
    <nav className="bg-background shadow-md sticky top-0 z-40 transition-shadow duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-green-600 hover:opacity-80 transition-opacity cursor-pointer">
          <img src={PlasTechLogo} alt="PlasTech Logo" className="h-8 w-auto" />
          PlasTech
        </Link>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {isAdmin ? adminLinks : userLinks}
              <NavLink to="/settings">Settings</NavLink>
              <Button
                variant="ghost"
                size="icon"
                onClick={requestLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="cursor-pointer">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="sm:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                {isAdmin ? adminLinks : userLinks}
                <NavLink to="/settings">Settings</NavLink>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={requestLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Sign Up</NavLink>
              </>
            )}
          </div>
        </div>
      )}

      {/* Logout confirmation modal */}
      <Modal
        open={showLogoutConfirm}
        onClose={cancelLogout}
        title="Log out"
        description="Are you sure you want to log out of your PlasTech account?"
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={cancelLogout}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmLogout}>
            Log out
          </Button>
        </div>
      </Modal>
    </nav>
  );
}
