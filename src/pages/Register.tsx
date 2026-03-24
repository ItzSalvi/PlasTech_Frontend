import { useState } from 'react';
import { GlobalLoading } from '../components/ui/GlobalLoading';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import PlasTechLogo from '../assets/PlasTech_Logo.png';
import bgLanding from '../assets/bg-landing.png';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    return <GlobalLoading />;
  }

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

  if (isLoading) {
    return <GlobalLoading />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex group relative overflow-hidden">
      {/* Hero-style Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={bgLanding} 
          alt="Background" 
          className="w-full h-full object-cover opacity-40 absolute inset-0" 
          draggable={false}
        />
        {/* Subtle Green Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-green-50/30" />
        {/* Minimalist Green Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e08_1px,transparent_1px),linear-gradient(to_bottom,#22c55e08_1px,transparent_1px)] bg-[size:64px_64px]" />
        {/* Soft Green Orbs */}
        <div className="absolute top-0 -right-40 w-96 h-96 bg-gradient-to-br from-green-100/40 to-emerald-100/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-gradient-to-tr from-green-100/30 to-emerald-100/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-50 dark:bg-green-900/20/20 rounded-full blur-[120px]" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10 w-full">
        <div className="w-full max-w-md bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-[2rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-green-900/5 p-6 sm:p-10 transition-all relative">
          
          <div className="flex flex-col items-center mb-8 mt-2">
            <div className="mb-4 flex justify-center">
              <img src={PlasTechLogo} alt="PlasTech Logo" className="h-12 w-auto" />
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
                  className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-950/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-green-500 transition-all font-medium"
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
                  className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-950/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-green-500 transition-all font-medium"
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
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 rounded-xl bg-white dark:bg-zinc-950/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-green-500 transition-all font-medium"
                  {...register('password')} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
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
              className="w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-600/20 transition-transform active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group cursor-pointer" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Join the Movement'}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
                Sign in
              </Link>
            </p>
            <div className="flex justify-center">
              <Link to="/" className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Main Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
