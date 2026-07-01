import React from 'react';
import { Navbar } from './Navbar';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t-4 border-black dark:border-white py-8 bg-[#FFDE4D] dark:bg-black text-black dark:text-white transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-black uppercase tracking-wider">
          © {new Date().getFullYear()} VelocityAuction Platform. All rights reserved. Enforced by Atomic Locks.
        </div>
      </footer>
    </div>
  );
};
