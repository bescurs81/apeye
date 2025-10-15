import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type ApiKey } from '../lib/supabase';
import { Search, Eye, EyeOff, Copy, Edit, Trash2, Check, ExternalLink } from 'lucide-react';
import { decrypt } from '../lib/encryption';

export function MainDashboard() {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [decryptedData, setDecryptedData] = useState<Map<string, { key: string; password: string }>>(new Map());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('service_name', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
    } else {
      setApiKeys(data || []);
    }
    setLoading(false);
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

  const toggleVisibility = async (id: string, field: 'key' | 'password', encrypted: string) => {
    const isKey = field === 'key';
    const visibleSet = isKey ? visibleKeys : visiblePasswords;
    const setVisibleSet = isKey ? setVisibleKeys : setVisiblePasswords;

    if (visibleSet.has(id)) {
      const newSet = new Set(visibleSet);
      newSet.delete(id);
      setVisibleSet(newSet);
    } else {
      if (!decryptedData.has(id)) {
        const decrypted = await decrypt(encrypted);
        const currentData = decryptedData.get(id) || { key: '', password: '' };
        setDecryptedData(new Map(decryptedData.set(id, {
          ...currentData,
          [field === 'key' ? 'key' : 'password']: decrypted
        })));
      }
      const newSet = new Set(visibleSet);
      newSet.add(id);
      setVisibleSet(newSet);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    const decrypted = await decrypt(text);
    await navigator.clipboard.writeText(decrypted);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredKeys = apiKeys.filter(key =>
    !searchQuery ||
    key.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.email_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const websiteGroups = filteredKeys.reduce((groups, key) => {
    const service = key.service_name;
    if (!groups[service]) {
      groups[service] = [];
    }
    groups[service].push(key);
    return groups;
  }, {} as Record<string, ApiKey[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">API Key Manager</h1>
        <p className="theme-text-secondary">Manage all your API keys organized by service</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-tertiary" />
          <input
            type="text"
            placeholder="Search services, emails, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg-secondary theme-text-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(websiteGroups).length === 0 ? (
            <div className="text-center py-12 theme-bg-secondary rounded-xl theme-border border">
              <h3 className="text-lg font-medium theme-text-primary mb-2">No API keys found</h3>
              <p className="theme-text-secondary">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first API key'}
              </p>
            </div>
          ) : (
            Object.entries(websiteGroups).map(([serviceName, keys]) => (
              <div key={serviceName} className="theme-bg-secondary rounded-xl theme-border border overflow-hidden">
                <div
                  onClick={() => navigate(`/website/${encodeURIComponent(serviceName)}`)}
                  className="p-4 flex items-center justify-between hover:theme-bg-tertiary cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="theme-accent p-2 rounded-lg">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold theme-text-primary">{serviceName}</h3>
                      <p className="text-sm theme-text-tertiary">{keys.length} API key{keys.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 theme-text-tertiary" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="theme-bg-tertiary theme-border border-t">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium theme-text-tertiary uppercase tracking-wider">
                          Email/Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium theme-text-tertiary uppercase tracking-wider">
                          Password
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium theme-text-tertiary uppercase tracking-wider">
                          API Key
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium theme-text-tertiary uppercase tracking-wider">
                          Notes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium theme-text-tertiary uppercase tracking-wider">
                          Date Added
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium theme-text-tertiary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="theme-border divide-y">
                      {keys.map((key) => (
                        <tr key={key.id} className="hover:theme-bg-tertiary transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary">
                            {key.email_username || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {key.encrypted_password ? (
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono theme-text-secondary">
                                  {visiblePasswords.has(key.id)
                                    ? decryptedData.get(key.id)?.password || '••••••••'
                                    : '••••••••'}
                                </code>
                                <button
                                  onClick={() => toggleVisibility(key.id, 'password', key.encrypted_password)}
                                  className="p-1 hover:theme-bg-tertiary rounded transition-colors"
                                >
                                  {visiblePasswords.has(key.id) ? (
                                    <EyeOff className="w-4 h-4 theme-text-tertiary" />
                                  ) : (
                                    <Eye className="w-4 h-4 theme-text-tertiary" />
                                  )}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(key.encrypted_password, `pwd-${key.id}`)}
                                  className="p-1 hover:theme-bg-tertiary rounded transition-colors"
                                >
                                  {copiedId === `pwd-${key.id}` ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4 theme-text-tertiary" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm theme-text-tertiary">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono theme-text-secondary truncate max-w-xs">
                                {visibleKeys.has(key.id)
                                  ? decryptedData.get(key.id)?.key || 'sk-***'
                                  : 'sk-*********************'}
                              </code>
                              <button
                                onClick={() => toggleVisibility(key.id, 'key', key.encrypted_api_key)}
                                className="p-1 hover:theme-bg-tertiary rounded transition-colors"
                              >
                                {visibleKeys.has(key.id) ? (
                                  <EyeOff className="w-4 h-4 theme-text-tertiary" />
                                ) : (
                                  <Eye className="w-4 h-4 theme-text-tertiary" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(key.encrypted_api_key, `key-${key.id}`)}
                                className="p-1 hover:theme-bg-tertiary rounded transition-colors"
                              >
                                {copiedId === `key-${key.id}` ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 theme-text-tertiary" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate text-sm theme-text-secondary">
                            {key.notes || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-tertiary">
                            {formatDate(key.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDelete(key.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
