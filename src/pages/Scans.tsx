import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getScans, createScan, getRepositories, Scan, Repository } from '../services/api';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function Scans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const repositoryId = searchParams.get('repositoryId');

  const [scans, setScans] = useState<Scan[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewScanModal, setShowNewScanModal] = useState(!!repositoryId);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [scansResponse, reposResponse] = await Promise.all([
        getScans(),
        getRepositories()
      ]);
      setScans(scansResponse.data);
      setRepositories(reposResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScan = async (repoId: number) => {
    setScanning(true);
    try {
      const response = await createScan({ repositoryId: repoId });
      setShowNewScanModal(false);
      navigate(`/scans/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create scan:', error);
      alert('Failed to start scan');
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Security Scans</h1>
        <button
          onClick={() => setShowNewScanModal(true)}
          className="btn btn-primary"
        >
          New Scan
        </button>
      </div>

      <div className="space-y-4">
        {scans.map((scan) => (
          <div
            key={scan.id}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/scans/${scan.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <StatusIcon status={scan.status} />
                  <div>
                    <h3 className="text-lg font-semibold">{scan.repositoryName}</h3>
                    <p className="text-sm text-gray-600">
                      Scan #{scan.id} • {new Date(scan.startedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">{scan.criticalCount}</div>
                  <div className="text-xs text-gray-600">Critical</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{scan.highCount}</div>
                  <div className="text-xs text-gray-600">High</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{scan.mediumCount}</div>
                  <div className="text-xs text-gray-600">Medium</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{scan.lowCount}</div>
                  <div className="text-xs text-gray-600">Low</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNewScanModal && (
        <NewScanModal
          repositories={repositories}
          defaultRepoId={repositoryId ? parseInt(repositoryId) : undefined}
          onClose={() => setShowNewScanModal(false)}
          onSubmit={handleCreateScan}
          scanning={scanning}
        />
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'COMPLETED') {
    return <CheckCircleIcon className="h-8 w-8 text-green-600" />;
  }
  if (status === 'FAILED') {
    return <XCircleIcon className="h-8 w-8 text-red-600" />;
  }
  return <ClockIcon className="h-8 w-8 text-blue-600 animate-spin" />;
}

function NewScanModal({ repositories, defaultRepoId, onClose, onSubmit, scanning }: any) {
  const [selectedRepo, setSelectedRepo] = useState(defaultRepoId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRepo) {
      onSubmit(parseInt(selectedRepo));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Start New Scan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Repository
            </label>
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a repository...</option>
              {repositories.map((repo: Repository) => (
                <option key={repo.id} value={repo.id}>
                  {repo.repoName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={scanning}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={scanning}
            >
              {scanning ? 'Starting...' : 'Start Scan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
