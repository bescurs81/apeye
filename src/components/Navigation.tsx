import { NavLink, useLocation } from 'react-router-dom';
import { Key, Settings, FileText, Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    if (theme === 'emerald') return <Palette className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('emerald');
    else setTheme('light');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Key },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/docs', label: 'Documentation', icon: FileText },
  ];

  return (
    <nav className="theme-bg-secondary theme-border border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/dashboard' && location.pathname.startsWith('/website'));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'theme-accent text-white'
                      : 'theme-text-secondary hover:theme-bg-tertiary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <button
            onClick={cycleTheme}
            className="p-2 rounded-lg theme-text-secondary hover:theme-bg-tertiary transition-all"
            aria-label="Toggle theme"
          >
            {getThemeIcon()}
          </button>
        </div>
      </div>
    </nav>
  );
}
