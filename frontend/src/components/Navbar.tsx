import React from 'react';
import { LogIn, LogOut, Plus } from 'lucide-react';
import type { User } from '../lib/types';

interface NavbarProps {
  user: User | null;
  activeTab: 'dashboard' | 'timeline' | 'imports' | 'settings';
  onTabChange: (tab: 'dashboard' | 'timeline' | 'imports' | 'settings') => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-background/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo and Nav links */}
        <div className="flex items-center gap-8">
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground"
          >
            <img src="/favicon.svg" alt="Ownly" className="h-4.5 w-4.5 rounded-sm" />
            <span>Ownly</span>
          </a>

          {/* Simple Tab-Style Navigation */}
          <nav className="flex items-center gap-1">
            {(['dashboard', 'timeline', 'imports', 'settings'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`relative px-3 py-1.5 text-xs font-medium transition-colors rounded-md ${
                    isActive
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-foreground font-semibold'
                      : 'text-neutral-500 hover:text-foreground'
                  }`}
                >
                  <span className="capitalize">{tab}</span>
                  {tab === 'imports' && (
                    <span className="ml-1 text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase">
                      Beta
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 active:scale-[0.98] transition-all px-3 py-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Asset</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('settings')}>
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover border border-neutral-200 dark:border-neutral-800"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800 text-xs font-medium">
                    {user.name?.[0] || 'U'}
                  </div>
                )}
                <span className="hidden md:inline text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  {user.name}
                </span>
              </div>

              <a
                href="http://localhost:3000/api/auth/logout"
                title="Sign out"
                className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors rounded-md"
              >
                <LogOut className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <a
              href="http://localhost:3000/api/auth/login"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-md border border-neutral-200 dark:border-neutral-800 bg-card hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3 py-1.5 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5 text-neutral-500" />
              <span>Sign In</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
