import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Compass, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-6">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#00F0FF] text-black border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-2">
            <Compass className="h-8 w-8 stroke-[3px]" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight">SIGN UP</h2>
          <p className="text-xs font-bold text-muted-foreground">Register to join live auctions and place real-time bids</p>
        </div>

        {/* Status Callouts */}
        {error && (
          <div className="p-3.5 bg-[#FF5F00] text-white text-xs font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 stroke-[3px]" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-[#00FF66] text-black text-xs font-bold border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 stroke-[3px]" />
            <span>Account created successfully! Redirecting...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-black dark:text-white">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-black uppercase tracking-wider block">Full Name</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="neo-input w-full text-sm font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-black uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="neo-input w-full text-sm font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-black uppercase tracking-wider block">Password (min 6 chars)</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="neo-input w-full text-sm font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="neo-btn w-full py-3.5 bg-[#00F0FF] text-black text-sm font-black disabled:opacity-50"
          >
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>
        </form>

        <p className="text-center text-xs font-bold text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-black dark:text-white underline font-black hover:text-[#8B5CF6] transition-colors">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};
