import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Sun, Moon, LogOut, Compass } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark') || 
    localStorage.theme === 'dark'
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  return (
    <nav className="w-full border-b-4 border-black dark:border-white bg-[#FFDE4D] dark:bg-[#1A1A1A] text-black dark:text-white sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Box */}
          <Link to="/" className="flex items-center space-x-3 group">
            <span className="p-2.5 bg-black dark:bg-white text-[#FFDE4D] dark:text-[#1A1A1A] border-3 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:-translate-y-0.5">
              <Compass className="h-6 w-6 stroke-[3px]" />
            </span>
            <span className="text-2xl font-black tracking-tighter uppercase font-mono bg-white dark:bg-black px-3 py-1 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              VELOCITY
            </span>
          </Link>

          {/* Links Block */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/auctions" 
              className="px-4 py-2 border-3 border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-black font-extrabold text-sm uppercase tracking-wide transition-all"
            >
              Live Auctions
            </Link>

            {user && (
              <>
                <Link 
                  to="/my-bids" 
                  className="px-4 py-2 border-3 border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-black font-extrabold text-sm uppercase tracking-wide transition-all"
                >
                  My Bids
                </Link>
                <Link 
                  to="/won-auctions" 
                  className="px-4 py-2 border-3 border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-black font-extrabold text-sm uppercase tracking-wide transition-all"
                >
                  Won Auctions
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="px-4 py-2 border-3 border-black dark:border-white bg-[#00F0FF] dark:bg-black font-black text-sm uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all"
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Profile & Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Dark Mode Switcher */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 border-3 border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5 text-yellow-400 stroke-[2.5px]" /> : <Moon className="h-5 w-5 text-black stroke-[2.5px]" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 border-3 border-black dark:border-white bg-white dark:bg-black px-3.5 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-6 h-6 bg-[#FF007A] text-white border-2 border-black dark:border-white flex items-center justify-center font-black text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-black text-xs uppercase tracking-wider">{user.name}</span>
                </Link>
                
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 border-3 border-black dark:border-white bg-[#FF5F00] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 stroke-[2.5px]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 border-3 border-transparent hover:border-black dark:hover:border-white font-extrabold text-sm uppercase tracking-wider"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 border-3 border-black dark:border-white bg-[#00F0FF] text-black font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
