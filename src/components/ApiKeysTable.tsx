import { useState } from 'react';
import { type ApiKey } from '../lib/supabase';
import { decrypt } from '../lib/encryption';
import { Eye, EyeOff, Copy, Edit, Trash2, Check } from 'lucide-react';

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  onEdit: (key: ApiKey) => void;
  onDelete: (id: string) => void;
}

export function ApiKeysTable({ apiKeys, onEdit, onDelete }: ApiKeysTableProps) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [decryptedData, setDecryptedData] = useState<Map<string, { key: string; password: string }>>(new Map());
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email/Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                API Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {apiKeys.map((key) => (
              <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {key.service_name}
                  </div>
                  {key.notes && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs truncate">
                      {key.notes}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                  {key.email_username || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {key.encrypted_password ? (
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-slate-700 dark:text-slate-300">
                        {visiblePasswords.has(key.id)
                          ? decryptedData.get(key.id)?.password || '••••••••'
                          : '••••••••'}
                      </code>
                      <button
                        onClick={() => toggleVisibility(key.id, 'password', key.encrypted_password)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        aria-label={visiblePasswords.has(key.id) ? 'Hide password' : 'Show password'}
                      >
                        {visiblePasswords.has(key.id) ? (
                          <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.encrypted_password, `pwd-${key.id}`)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        aria-label="Copy password"
                      >
                        {copiedId === `pwd-${key.id}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate max-w-xs">
                      {visibleKeys.has(key.id)
                        ? decryptedData.get(key.id)?.key || 'tvly-dev-***'
                        : 'tvly-dev-*********************'}
                    </code>
                    <button
                      onClick={() => toggleVisibility(key.id, 'key', key.encrypted_api_key)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                      aria-label={visibleKeys.has(key.id) ? 'Hide key' : 'Show key'}
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.encrypted_api_key, `key-${key.id}`)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                      aria-label="Copy key"
                    >
                      {copiedId === `key-${key.id}` ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {key.tags.length > 0 ? (
                      key.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(key.updated_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(key)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      aria-label="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(key.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
