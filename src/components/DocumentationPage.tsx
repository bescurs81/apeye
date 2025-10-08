import { Shield, Lock, Key, Database, Eye, Copy, Tag } from 'lucide-react';

export function DocumentationPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Documentation</h1>
        <p className="theme-text-secondary">Learn how to use and secure your API Key Manager</p>
      </div>

      <div className="space-y-6">
        <section className="theme-bg-secondary theme-border border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold theme-text-primary">Security Overview</h2>
          </div>
          <div className="space-y-3 theme-text-secondary">
            <p>
              Your API keys and passwords are protected with industry-standard AES-256 encryption.
              All sensitive data is encrypted before being stored in the database.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>End-to-end encryption using Web Crypto API</li>
              <li>Session-based encryption keys stored only in your browser</li>
              <li>Automatic key clearing on sign out</li>
              <li>Row-level security policies ensure data isolation</li>
            </ul>
          </div>
        </section>

        <section className="theme-bg-secondary theme-border border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Key className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold theme-text-primary">Managing API Keys</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold theme-text-primary mb-2">Adding a New Key</h3>
              <ol className="list-decimal list-inside space-y-2 theme-text-secondary ml-4">
                <li>Click the "Add Key" button in the top right</li>
                <li>Enter the service name and your API key</li>
                <li>Optionally add email/username, password, and notes</li>
                <li>Add tags to organize your keys (e.g., "production", "test")</li>
                <li>Click "Add Key" to save</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold theme-text-primary mb-2">Viewing Keys</h3>
              <p className="theme-text-secondary">
                By default, all sensitive data is masked. Click the eye icon to reveal passwords or API keys.
                Use the copy button to quickly copy credentials to your clipboard.
              </p>
            </div>

            <div>
              <h3 className="font-semibold theme-text-primary mb-2">Editing & Deleting</h3>
              <p className="theme-text-secondary">
                Use the edit icon to update any field. Click the trash icon to permanently delete a key.
                Deletion requires confirmation to prevent accidental data loss.
              </p>
            </div>
          </div>
        </section>

        <section className="theme-bg-secondary theme-border border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold theme-text-primary">Data Storage</h2>
          </div>
          <div className="space-y-3 theme-text-secondary">
            <p>
              Your data is stored in a secure Supabase PostgreSQL database with the following protections:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 theme-bg-tertiary rounded-lg">
                <Lock className="w-6 h-6 theme-text-primary mb-2" />
                <h4 className="font-medium theme-text-primary mb-1">Encryption at Rest</h4>
                <p className="text-sm">All sensitive fields are encrypted before storage</p>
              </div>
              <div className="p-4 theme-bg-tertiary rounded-lg">
                <Eye className="w-6 h-6 theme-text-primary mb-2" />
                <h4 className="font-medium theme-text-primary mb-1">Row-Level Security</h4>
                <p className="text-sm">You can only access your own data</p>
              </div>
            </div>
          </div>
        </section>

        <section className="theme-bg-secondary theme-border border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold theme-text-primary">Organization Tips</h2>
          </div>
          <div className="space-y-3 theme-text-secondary">
            <p>Use these features to keep your API keys organized:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Tags:</strong> Categorize keys by environment (production, staging, test)</li>
              <li><strong>Search:</strong> Quickly find keys by service name, email, or notes</li>
              <li><strong>Filter:</strong> View keys by specific tags</li>
              <li><strong>Notes:</strong> Add context about usage, expiration dates, or restrictions</li>
            </ul>
          </div>
        </section>

        <section className="theme-bg-secondary theme-border border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500 p-2 rounded-lg">
              <Copy className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold theme-text-primary">Best Practices</h2>
          </div>
          <div className="space-y-3 theme-text-secondary">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Rotate your API keys regularly</li>
              <li>Use different keys for development and production</li>
              <li>Sign out when using shared or public computers</li>
              <li>Keep your account password strong and unique</li>
              <li>Review and remove unused keys periodically</li>
              <li>Never share your master account credentials</li>
            </ul>
          </div>
        </section>

        <div className="theme-bg-tertiary theme-border border rounded-xl p-6 text-center">
          <p className="theme-text-secondary text-sm">
            For additional support or questions, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
