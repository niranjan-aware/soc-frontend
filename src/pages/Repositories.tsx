import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRepositories, importRepositories, deleteRepository, Repository } from '../services/api';
import { PlusIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline';

export default function Repositories() {
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      const response = await getRepositories();
      setRepositories(response.data);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (username: string, type: string) => {
    setImporting(true);
    try {
      await importRepositories({ 
        githubUsername: type === 'username' ? username : undefined,
        githubOrg: type === 'org' ? username : undefined,
        type 
      });
      await loadRepositories();
      setShowImportModal(false);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import repositories');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this repository?')) return;
    try {
      await deleteRepository(id);
      await loadRepositories();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleScan = (repositoryId: number) => {
    navigate(`/scans/new?repositoryId=${repositoryId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Repositories</h1>
        <button
          onClick={() => setShowImportModal(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Import from GitHub
        </button>
      </div>

      {repositories.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No repositories imported yet</p>
          <button onClick={() => setShowImportModal(true)} className="btn btn-primary">
            Import Your First Repository
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo) => (
            <div key={repo.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{repo.repoName}</h3>
                  <p className="text-sm text-gray-600">{repo.githubUsername || repo.githubOrg}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleScan(repo.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Start Scan"
                  >
                    <PlayIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(repo.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{repo.language || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stars:</span>
                  <span className="font-medium">{repo.stars}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch:</span>
                  <span className="font-medium">{repo.defaultBranch || 'main'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          importing={importing}
        />
      )}
    </div>
  );
}

function ImportModal({ onClose, onImport, importing }: any) {
  const [username, setUsername] = useState('');
  const [type, setType] = useState('username');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onImport(username.trim(), type);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Import from GitHub</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="username">GitHub Username</option>
              <option value="org">GitHub Organization</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'username' ? 'Username' : 'Organization Name'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., niranjan-aware"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={importing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={importing}
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
