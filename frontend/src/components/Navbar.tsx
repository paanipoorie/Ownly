import React from 'react';
import { Package, Clock, Inbox, Settings, LogIn, LogOut, Plus, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Ownly
            </span>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-secondary text-secondary-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Package className="h-4 w-4" />
              Dashboard
            </button>

            <button
              onClick={() => onTabChange('timeline')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-secondary text-secondary-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Clock className="h-4 w-4" />
              Timeline
            </button>

            <button
              onClick={() => onTabChange('imports')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'imports'
                  ? 'bg-secondary text-secondary-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Inbox className="h-4 w-4" />
              Imports
              <span className="ml-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                Gmail
              </span>
            </button>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Asset</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-border/60">
              <div className="flex items-center gap-2">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-semibold text-sm">
                    {user.name?.[0] || 'U'}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  {user.name}
                </span>
              </div>

              <a
                href="http://localhost:3000/api/auth/logout"
                title="Sign out"
                className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <a
              href="http://localhost:3000/api/auth/login"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors shadow-xs"
            >
              <LogIn className="h-4 w-4 text-indigo-500" />
              <span>Sign in with Google</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
