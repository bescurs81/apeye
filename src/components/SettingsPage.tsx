import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Mail, Lock, LogOut, Trash2, CheckCircle } from 'lucide-react';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'emerald') => {
    setTheme(newTheme);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Settings</h1>
        <p className="theme-text-secondary">Manage your account and preferences</p>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 rounded-lg theme-bg-tertiary theme-border border flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span className="theme-text-primary">Settings updated successfully</span>
        </div>
      )}

      <div className="space-y-6">
        <section className="theme-bg-secondary theme-border border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="theme-accent p-2 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold theme-text-primary">Account Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 theme-bg-tertiary theme-border border rounded-lg theme-text-primary cursor-not-allowed"
              />
              <p className="mt-1 text-xs theme-text-tertiary">
                Email cannot be changed at this time
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  User ID
                </div>
              </label>
              <input
                type="text"
                value={user?.id || ''}
                disabled
                className="w-full px-4 py-2 theme-bg-tertiary theme-border border rounded-lg theme-text-primary font-mono text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        <section className="theme-bg-secondary theme-border border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="theme-accent p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold theme-text-primary">Appearance</h2>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-lg theme-border border-2 transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'hover:theme-bg-tertiary'
                }`}
              >
                <div className="bg-slate-100 rounded-md p-3 mb-2">
                  <div className="bg-white rounded shadow-sm p-2">
                    <div className="h-2 bg-slate-300 rounded mb-1"></div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <span className="text-sm font-medium theme-text-primary">Light</span>
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-lg theme-border border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'hover:theme-bg-tertiary'
                }`}
              >
                <div className="bg-slate-800 rounded-md p-3 mb-2">
                  <div className="bg-slate-900 rounded shadow-sm p-2">
                    <div className="h-2 bg-slate-700 rounded mb-1"></div>
                    <div className="h-2 bg-slate-600 rounded"></div>
                  </div>
                </div>
                <span className="text-sm font-medium theme-text-primary">Dark</span>
              </button>

              <button
                onClick={() => handleThemeChange('emerald')}
                className={`p-4 rounded-lg theme-border border-2 transition-all ${
                  theme === 'emerald'
                    ? 'border-emerald-500 ring-2 ring-emerald-200'
                    : 'hover:theme-bg-tertiary'
                }`}
              >
                <div className="bg-emerald-100 rounded-md p-3 mb-2">
                  <div className="bg-white rounded shadow-sm p-2">
                    <div className="h-2 bg-emerald-300 rounded mb-1"></div>
                    <div className="h-2 bg-emerald-200 rounded"></div>
                  </div>
                </div>
                <span className="text-sm font-medium theme-text-primary">Emerald</span>
              </button>
            </div>
          </div>
        </section>

        <section className="theme-bg-secondary theme-border border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-500 p-2 rounded-lg">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold theme-text-primary">Danger Zone</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 theme-bg-tertiary rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium theme-text-primary mb-1">Sign Out</h3>
                  <p className="text-sm theme-text-secondary">
                    Sign out of your account on this device
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
