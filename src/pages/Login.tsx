import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Leaf, ArrowRight, Mail, Lock, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect if already logged in
  if (isAuthenticated) {
    navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    return null;
  }

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.post('/auth/login', data);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      if (!response.credential) return;
      setIsLoading(true);
      const res = await api.post('/auth/google', { idToken: response.credential });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google Auth failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex group">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-white dark:bg-zinc-950">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-200/50 dark:bg-green-900/20 blur-[100px] pointer-events-none"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl rounded-[2rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-green-900/5 p-8 sm:p-12 transition-all relative">
          
          <Link to="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>

          <div className="flex flex-col items-center mb-8 mt-2">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Welcome Back</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center text-sm">
              Sign in to your account and track your sustainable impact.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5 relative">
              <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 ml-1">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10 h-12 rounded-xl bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-green-500 transition-all font-medium"
                  {...register('email')} 
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 ml-1 font-medium">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password</Label>
                <a href="#" className="text-xs font-semibold text-green-600 hover:text-green-500 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="pl-10 h-12 rounded-xl bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-green-500 transition-all font-medium"
                  {...register('password')} 
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 ml-1 font-medium">{errors.password.message}</p>}
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-black font-semibold shadow-lg transition-transform active:scale-[0.98] mt-2 group" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-zinc-950 px-4 text-zinc-500 font-medium tracking-wide">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center w-full mb-6">
            <div className="hover:scale-[1.02] transition-transform w-full flex justify-center shadow-sm rounded-xl overflow-hidden">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Auth failed')}
                useOneTap
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
              />
            </div>
          </div>

          <p className="text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
