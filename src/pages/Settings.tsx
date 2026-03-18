import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { GoogleLogin } from '@react-oauth/google';
import { Camera, Mail, Lock, CheckCircle2 } from 'lucide-react';

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

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      {error && <div className="p-4 mb-6 bg-red-100 text-red-600 rounded-lg dark:bg-red-500/10 dark:text-red-500">{error}</div>}
      {success && <div className="p-4 mb-6 bg-green-100 text-green-600 rounded-lg dark:bg-green-500/10 dark:text-green-500 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> {success}</div>}

      <div className="space-y-8">
        
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your public information and avatar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                    {user?.avatarUrl ? (
                       <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-3xl font-bold text-muted-foreground">{user?.fullName.charAt(0)}</span>
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-6 h-6" />
                    <span className="text-xs mt-1">Change</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="flex-1 space-y-4">
                   <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user?.email} disabled className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="border-blue-200 bg-blue-50/80 dark:border-blue-900 dark:bg-blue-950/40">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Change your password if you logged in with an email.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
               <div className="space-y-2">
                <Label htmlFor="oldPwd">Current Password (leave blank if you only use Google)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="oldPwd"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="pl-9 bg-white border-blue-300/80 focus-visible:ring-blue-500 dark:bg-background"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPwd">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPwd"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 bg-white border-blue-300/80 focus-visible:ring-blue-500 dark:bg-background"
                    required
                    minLength={6}
                  />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="confirmPwd">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPwd"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 bg-white border-blue-300/80 focus-visible:ring-blue-500 dark:bg-background"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="flex justify-start">
                <Button type="submit" className="sm:min-w-[160px]" disabled={loading}>
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Connected Gmail Account Card */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Gmail Account</CardTitle>
            <CardDescription>Manage third-party login.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" /> Google Account
                </Label>
                <p className="text-sm text-muted-foreground">
                  {user?.googleId ? 'Your account is linked to Google.' : 'Link your Google account for faster logins.'}
                </p>
              </div>
              <div className="flex flex-col items-end">
                {user?.googleId ? (
                  <Button
                    variant="outline"
                    disabled={loading}
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
                   <div className="scale-90 origin-right">
                     <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Link Failed')}
                        useOneTap={false}
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
