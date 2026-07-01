import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Compass, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/auctions';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-6">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#FFDE4D] text-black border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-2">
            <Compass className="h-8 w-8 stroke-[3px]" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight">LOG IN</h2>
          <p className="text-xs font-bold text-muted-foreground">Sign in to participate in real-time motorcycle bidding</p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="p-3.5 bg-[#FF5F00] text-white text-xs font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 stroke-[3px]" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-black dark:text-white">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-black uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="neo-input w-full text-sm font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-black uppercase tracking-wider block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="neo-input w-full text-sm font-bold pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white hover:text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4 stroke-[2.5px]" /> : <Eye className="h-4 w-4 stroke-[2.5px]" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="neo-btn w-full py-3.5 bg-[#FFDE4D] text-black text-sm font-black disabled:opacity-50"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <p className="text-center text-xs font-bold text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-black dark:text-white underline font-black hover:text-[#8B5CF6] transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
