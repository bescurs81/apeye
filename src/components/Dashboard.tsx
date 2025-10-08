import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, type ApiKey } from '../lib/supabase';
import { decrypt } from '../lib/encryption';
import { ApiKeysTable } from './ApiKeysTable';
import { ApiKeyModal } from './ApiKeyModal';
import { Key, Plus, LogOut, Moon, Sun, Search, Filter } from 'lucide-react';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
    } else {
      setApiKeys(data || []);
      const tags = new Set<string>();
      data?.forEach(key => key.tags.forEach((tag: string) => tags.add(tag)));
      setAllTags(Array.from(tags).sort());
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingKey(null);
    setIsModalOpen(true);
  };

  const handleEdit = (key: ApiKey) => {
    setEditingKey(key);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting API key:', error);
    } else {
      fetchApiKeys();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingKey(null);
    fetchApiKeys();
  };

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = !searchQuery ||
      key.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.email_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.notes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = !selectedTag || key.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  API Key Manager
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search services, emails, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {allTags.length > 0 && (
              <div className="relative flex-1 sm:flex-initial">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Key
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ApiKeysTable
            apiKeys={filteredKeys}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {!loading && filteredKeys.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Key className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {searchQuery || selectedTag ? 'No matching keys found' : 'No API keys yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery || selectedTag
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first API key'}
            </p>
            {!searchQuery && !selectedTag && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Your First Key
              </button>
            )}
          </div>
        )}
      </main>

      {isModalOpen && (
        <ApiKeyModal
          apiKey={editingKey}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
