import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { encrypt } from '../lib/encryption';
import { X, Plus, Trash2 } from 'lucide-react';

interface MassAddModalProps {
  serviceName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ApiKeyRow {
  id: string;
  email_username: string;
  password: string;
  api_key: string;
  notes: string;
}

export function MassAddModal({ serviceName, onClose, onSuccess }: MassAddModalProps) {
  const [rows, setRows] = useState<ApiKeyRow[]>([
    { id: crypto.randomUUID(), email_username: '', password: '', api_key: '', notes: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addRow = () => {
    setRows([...rows, { id: crypto.randomUUID(), email_username: '', password: '', api_key: '', notes: '' }]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof ApiKeyRow, value: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        throw new Error('You must be logged in to add API keys');
      }

      const validRows = rows.filter(row => row.api_key.trim());
      if (validRows.length === 0) {
        setError('At least one row must have an API key');
        setLoading(false);
        return;
      }

      const encryptedData = await Promise.all(
        validRows.map(async (row) => ({
          user_id: user.id,
          service_name: serviceName,
          email_username: row.email_username,
          encrypted_password: row.password ? await encrypt(row.password) : '',
          encrypted_api_key: await encrypt(row.api_key),
          notes: row.notes,
          tags: []
        }))
      );

      const { error: insertError } = await supabase
        .from('api_keys')
        .insert(encryptedData);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="theme-bg-secondary rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 theme-bg-secondary theme-border border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold theme-text-primary">Mass Add API Keys</h2>
            <p className="text-sm theme-text-secondary mt-1">Add multiple API keys for {serviceName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 theme-text-tertiary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div key={row.id} className="theme-bg-tertiary rounded-lg p-4 theme-border border">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium theme-text-primary">API Key #{index + 1}</h3>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Email/Username
                    </label>
                    <input
                      type="text"
                      value={row.email_username}
                      onChange={(e) => updateRow(row.id, 'email_username', e.target.value)}
                      className="w-full px-4 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary"
                      placeholder="account@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={row.password}
                      onChange={(e) => updateRow(row.id, 'password', e.target.value)}
                      className="w-full px-4 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      API Key *
                    </label>
                    <input
                      type="text"
                      value={row.api_key}
                      onChange={(e) => updateRow(row.id, 'api_key', e.target.value)}
                      required
                      className="w-full px-4 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary font-mono text-sm"
                      placeholder="sk-proj-abc123..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={row.notes}
                      onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                      className="w-full px-4 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary"
                      placeholder="Additional information..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-4 flex items-center gap-2 px-4 py-2 theme-bg-tertiary hover:theme-bg-tertiary theme-text-primary font-medium rounded-lg transition-colors w-full justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Another Row
          </button>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-6 theme-border border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 theme-border border theme-text-primary font-medium rounded-lg hover:theme-bg-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 theme-accent theme-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : `Save All (${rows.filter(r => r.api_key.trim()).length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
