import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Leaf, User, Mail, Lock, Sparkles } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.post('/auth/register', data);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex group">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-white dark:bg-zinc-950">
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/50 dark:bg-emerald-900/20 blur-[100px] pointer-events-none"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl rounded-[2rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-emerald-900/5 p-8 sm:p-12 transition-all">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-green-500 dark:to-emerald-600 shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Create Account</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center text-sm">
              Join PlasTech and start earning rewards for helping the planet.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5 relative">
              <Label htmlFor="fullName" className="text-zinc-700 dark:text-zinc-300 ml-1">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  className="pl-10 h-12 rounded-xl bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-green-500 transition-all font-medium"
                  {...register('fullName')} 
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 ml-1 font-medium">{errors.fullName.message}</p>}
            </div>

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
              <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300 ml-1">Password</Label>
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
              className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold shadow-lg shadow-green-600/20 transition-transform active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : (
                <>
                  Join the Movement <Sparkles className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
