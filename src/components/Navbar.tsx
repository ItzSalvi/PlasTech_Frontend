import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { LogOut, Moon, Sun, Leaf, Menu, X } from 'lucide-react';
import { Modal } from './ui/modal';

export function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  const requestLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    close();
    logout();
  };

  const userLinks = (
    <>
      <Link to="/dashboard" onClick={close}>
        <Button variant="ghost" className="w-full sm:w-auto justify-start">
          Dashboard
        </Button>
      </Link>
      <Link to="/insert" onClick={close}>
        <Button
          variant="ghost"
          className="w-full sm:w-auto justify-start text-green-600 dark:text-green-400"
        >
          Insert Bottles
        </Button>
      </Link>
      <Link to="/redeem" onClick={close}>
        <Button variant="ghost" className="w-full sm:w-auto justify-start">
          Redeem
        </Button>
      </Link>
      <Link to="/transactions" onClick={close}>
        <Button variant="ghost" className="w-full sm:w-auto justify-start">
          Transactions
        </Button>
      </Link>
      <Link to="/history" onClick={close}>
        <Button variant="ghost" className="w-full sm:w-auto justify-start">
          History
        </Button>
      </Link>
    </>
  );

  const adminLinks = (
    <Link to="/admin" onClick={close}>
      <Button variant="outline" className="w-full sm:w-auto justify-start">
        Admin Dashboard
      </Button>
    </Link>
  );

  return (
    <nav className="border-b bg-background shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-green-600">
          <Leaf className="h-6 w-6" />
          PlasTech
        </Link>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated ? (
            <>
              {isAdmin ? adminLinks : userLinks}
              <Link to="/settings">
                <Button variant="ghost">Settings</Button>
              </Link>
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
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
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
                <Link to="/settings" onClick={close}>
                  <Button variant="ghost" className="w-full justify-start">
                    Settings
                  </Button>
                </Link>
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
                <Link to="/login" onClick={close}>
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={close}>
                  <Button className="w-full justify-start">
                    Sign Up
                  </Button>
                </Link>
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
