import { useState } from 'react';
import { GlobalLoading } from '../components/ui/GlobalLoading';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { GoogleLogin } from '@react-oauth/google';
import { Camera, Mail, Lock, CheckCircle2, Settings as SettingsIcon, Shield, User, AlertCircle } from 'lucide-react';

export function Settings() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [profileName, setProfileName] = useState(user?.fullName || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // -- Profile Update --
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('FullName', profileName);
      if (avatarFile) formData.append('Avatar', avatarFile);

      await api.put('/user/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshUser();
      setSuccess('Profile updated successfully.');
      setAvatarFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // -- Password Update --
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.');
    }
    setError(''); setSuccess(''); setLoading(true);

    try {
      await api.post('/user/change-password', {
        oldPassword, newPassword
      });
      setSuccess('Password changed successfully.');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  // -- Google Link --
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError(''); setSuccess(''); setLoading(true);
      await api.post('/user/link-google', {
        idToken: credentialResponse.credential
      });
      await refreshUser();
      setSuccess('Google account linked successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to link Google account.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <GlobalLoading />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 mb-16">
      {/* Premium Header */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-green-50 to-green-100/30 dark:from-green-950/40 dark:to-background border border-green-100 dark:border-green-900/40 shadow-sm p-8">
        <div className="relative z-10 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-green-600 dark:text-green-500">
            Account Settings
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-xl">
            Manage your personal profile, security preferences, and linked accounts.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-green-100/50 to-transparent dark:from-green-900/20 opacity-50 z-0" />
      </div>

      {error && (
        <div className="p-4 mb-8 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-8 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900/30 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm">{success}</p>
        </div>
      )}

      <div className="space-y-8">
        
        {/* Profile Card */}
        <Card className="shadow-md border-border/50 overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/50 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-green-600 dark:text-green-500" />
              Profile Details
            </CardTitle>
            <CardDescription className="text-base">Update your public information and avatar.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-start">
                <div className="relative group shrink-0 mx-auto sm:mx-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-50 dark:border-green-900/20 bg-muted flex items-center justify-center shadow-md">
                    {user?.avatarUrl ? (
                       <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
                         <span className="text-5xl font-bold text-white uppercase">{user?.fullName.charAt(0)}</span>
                       </div>
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Upload Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="flex-1 space-y-6 w-full">
                   <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)} 
                      required 
                      className="py-6 px-4 text-base rounded-xl focus-visible:ring-green-500 border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                      <Input 
                        id="email" 
                        value={user?.email} 
                        disabled 
                        className="py-6 pl-11 pr-4 text-base rounded-xl bg-muted/50 cursor-not-allowed border-border focus-visible:ring-0 text-muted-foreground font-medium" 
                      />
                      <Lock className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/60" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-border/40">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 rounded-xl px-8 py-6 text-base font-semibold w-full sm:w-auto"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="shadow-md border-border/50 overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/50 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-500" />
              Security
            </CardTitle>
            <CardDescription className="text-base">Change your password if you logged in with an email.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
               <div className="space-y-2">
                <Label htmlFor="oldPwd" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="oldPwd"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="py-6 pl-11 pr-4 text-base rounded-xl bg-background border-border focus-visible:ring-green-500"
                    placeholder="Leave blank if you use Google Login"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="newPwd" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-4 w-4 text-green-600/70 dark:text-green-500/70" />
                  <Input
                    id="newPwd"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="py-6 pl-11 pr-4 text-base rounded-xl bg-background border-green-200 dark:border-green-900/40 focus-visible:ring-green-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="confirmPwd" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-4 w-4 text-green-600/70 dark:text-green-500/70" />
                  <Input
                    id="confirmPwd"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="py-6 pl-11 pr-4 text-base rounded-xl bg-background border-green-200 dark:border-green-900/40 focus-visible:ring-green-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="flex justify-start pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 rounded-xl px-8 py-6 text-base font-semibold w-full sm:w-auto"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Connected Gmail Account Card */}
        <Card className="shadow-md border-border/50 overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/50 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-5 w-5 text-blue-500" />
              Google Authentication
            </CardTitle>
            <CardDescription className="text-base">Manage your linked third-party login method.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <Label className="text-lg font-bold flex items-center gap-3">
                  Google Account
                  {user?.googleId && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                      Linked
                    </span>
                  )}
                </Label>
                <p className="text-base text-muted-foreground max-w-sm">
                  {user?.googleId 
                    ? 'Your Google account is secured and linked for faster logins.' 
                    : 'Link your Google account for faster, password-free logins.'}
                </p>
              </div>
              <div className="flex items-center justify-end w-full sm:w-auto">
                {user?.googleId ? (
                  <Button
                    variant="outline"
                    disabled={loading}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20 rounded-xl px-6 py-5 font-semibold transition-colors duration-300 w-full sm:w-auto"
                    onClick={async () => {
                      try {
                        setError(''); setSuccess(''); setLoading(true);
                        await api.post('/user/unlink-google');
                        await refreshUser();
                        setSuccess('Google account unlinked successfully.');
                      } catch (err: any) {
                        setError(err.response?.data?.message || 'Failed to unlink Google account.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Unlink Google
                  </Button>
                ) : (
                   <div className="scale-100 origin-center sm:origin-right flex justify-center w-full sm:w-auto">
                     <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Link Failed')}
                        useOneTap={false}
                        shape="pill"
                     />
                   </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
