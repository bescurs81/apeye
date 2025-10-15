import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type ApiKey } from '../lib/supabase';
import { ArrowLeft, Plus, Eye, EyeOff, Copy, Trash2, Check, Download } from 'lucide-react';
import { decrypt } from '../lib/encryption';
import { MassAddModal } from './MassAddModal';

export function WebsitePage() {
  const { serviceName } = useParams<{ serviceName: string }>();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [decryptedData, setDecryptedData] = useState<Map<string, { key: string; password: string }>>(new Map());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const decodedServiceName = serviceName ? decodeURIComponent(serviceName) : '';

  useEffect(() => {
    if (decodedServiceName) {
      fetchApiKeys();
    }
  }, [decodedServiceName]);

  const fetchApiKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', decodedServiceName)
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

  const handleExport = () => {
    const exportData = apiKeys.map(key => ({
      service_name: key.service_name,
      email_username: key.email_username,
      encrypted_password: key.encrypted_password,
      encrypted_api_key: key.encrypted_api_key,
      notes: key.notes,
      tags: key.tags,
      created_at: key.created_at,
      updated_at: key.updated_at
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${decodedServiceName.toLowerCase().replace(/\s+/g, '-')}-keys-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 theme-text-secondary hover:theme-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">{decodedServiceName}</h1>
            <p className="theme-text-secondary">
              Managing {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''} for this service
            </p>
          </div>

          <div className="flex gap-3">
            {apiKeys.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 theme-bg-tertiary hover:theme-bg-tertiary theme-text-primary font-medium rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 theme-accent theme-accent-hover text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add APIs (Mass Add)
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-12 theme-bg-secondary rounded-xl theme-border border">
          <h3 className="text-lg font-medium theme-text-primary mb-2">No API keys yet</h3>
          <p className="theme-text-secondary mb-6">
            Add your first API key for {decodedServiceName}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 theme-accent theme-accent-hover text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add APIs (Mass Add)
          </button>
        </div>
      ) : (
        <div className="theme-bg-secondary rounded-xl shadow-sm theme-border border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="theme-bg-tertiary theme-border border-b">
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
                  <th className="px-6 py-3 text-left text-xs font-medium theme-text-tertiary uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium theme-text-tertiary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="theme-border divide-y">
                {apiKeys.map((key) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-tertiary">
                      {formatDate(key.updated_at)}
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
      )}

      {isModalOpen && (
        <MassAddModal
          serviceName={decodedServiceName}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchApiKeys}
        />
      )}
    </div>
  );
}
