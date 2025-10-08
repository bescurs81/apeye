import { useState, useEffect } from 'react';
import { supabase, type ApiKey } from '../lib/supabase';
import { encrypt, decrypt } from '../lib/encryption';
import { X, Plus } from 'lucide-react';

interface ApiKeyModalProps {
  apiKey: ApiKey | null;
  onClose: () => void;
}

export function ApiKeyModal({ apiKey, onClose }: ApiKeyModalProps) {
  const [serviceName, setServiceName] = useState('');
  const [emailUsername, setEmailUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [decrypting, setDecrypting] = useState(false);

  useEffect(() => {
    if (apiKey) {
      setServiceName(apiKey.service_name);
      setEmailUsername(apiKey.email_username);
      setNotes(apiKey.notes);
      setTags(apiKey.tags);

      setDecrypting(true);
      Promise.all([
        apiKey.encrypted_password ? decrypt(apiKey.encrypted_password) : Promise.resolve(''),
        decrypt(apiKey.encrypted_api_key)
      ]).then(([pwd, key]) => {
        setPassword(pwd);
        setApiKeyValue(key);
        setDecrypting(false);
      });
    }
  }, [apiKey]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const encryptedPassword = password ? await encrypt(password) : '';
      const encryptedApiKey = await encrypt(apiKeyValue);

      const data = {
        service_name: serviceName,
        email_username: emailUsername,
        encrypted_password: encryptedPassword,
        encrypted_api_key: encryptedApiKey,
        notes,
        tags,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      if (apiKey) {
        const { error: updateError } = await supabase
          .from('api_keys')
          .update(data)
          .eq('id', apiKey.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('api_keys')
          .insert([data]);

        if (insertError) throw insertError;
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="theme-bg-secondary rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 theme-bg-secondary border-b theme-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold theme-text-primary">
            {apiKey ? 'Edit API Key' : 'Add New API Key'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:theme-bg-tertiary rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 theme-text-tertiary" />
          </button>
        </div>

        {decrypting ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="theme-text-secondary">Decrypting data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="serviceName" className="block text-sm font-medium theme-text-secondary mb-2">
                Service/Website Name *
              </label>
              <input
                id="serviceName"
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
                className="w-full px-4 py-2 border theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary"
                placeholder="e.g., OpenAI, Stripe, AWS"
              />
            </div>

            <div>
              <label htmlFor="emailUsername" className="block text-sm font-medium theme-text-secondary mb-2">
                Email/Username
              </label>
              <input
                id="emailUsername"
                type="text"
                value={emailUsername}
                onChange={(e) => setEmailUsername(e.target.value)}
                className="w-full px-4 py-2 border theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary"
                placeholder="account@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium theme-text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs theme-text-tertiary">
                Optional. Will be encrypted before storage.
              </p>
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium theme-text-secondary mb-2">
                API Key *
              </label>
              <textarea
                id="apiKey"
                value={apiKeyValue}
                onChange={(e) => setApiKeyValue(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2 border theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary font-mono text-sm"
                placeholder="sk-proj-abc123..."
              />
              <p className="mt-1 text-xs theme-text-tertiary">
                Will be encrypted with AES-256 before storage.
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium theme-text-secondary mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary"
                placeholder="Additional information or context..."
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium theme-text-secondary mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 border theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary"
                  placeholder="e.g., production, test, expired"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 theme-text-secondary rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t theme-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border theme-border theme-text-secondary font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 theme-accent theme-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : apiKey ? 'Update Key' : 'Add Key'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
