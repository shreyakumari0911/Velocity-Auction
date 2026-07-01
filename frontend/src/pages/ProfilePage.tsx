import React from 'react';
import { useAuth } from '../store/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-96 border-3 border-black bg-muted animate-pulse"></div>;
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-10 text-black dark:text-white">
      {/* Profile Container Box */}
      <div className="p-8 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-6">
        
        {/* Profile Avatar and Name */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b-3 border-dashed border-black dark:border-white">
          <div className="w-20 h-20 bg-[#FF007A] text-white border-3 border-black dark:border-white flex items-center justify-center font-black text-3xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tight">{user.name}</h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 bg-[#FFDE4D] text-black border-2 border-black text-xs font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                {user.role} role
              </span>
              <span className="px-3 py-1 bg-[#00F0FF] text-black border-2 border-black text-xs font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                Verified member
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border-2 border-black dark:border-white bg-[#F9F6F0] dark:bg-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] text-muted-foreground uppercase font-black block">Email Address</span>
            <span className="font-extrabold text-sm block break-all">{user.email}</span>
          </div>

          <div className="p-4 border-2 border-black dark:border-white bg-[#F9F6F0] dark:bg-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] text-muted-foreground uppercase font-black block">Account ID</span>
            <span className="font-mono text-xs block break-all">{user._id}</span>
          </div>
        </div>

        <div className="p-4 border-3 border-black dark:border-white bg-[#FFDE4D] text-black font-extrabold text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-start gap-2.5">
          <ShieldAlert className="h-5 w-5 stroke-[2.5px] shrink-0" />
          <span>Velocity bids are legally binding. Double-check motorcycle specs and detail listings prior to committing high amounts on auction timers.</span>
        </div>
      </div>
    </div>
  );
};
