import { useState, useEffect } from 'react';
import { getScans, Scan } from '../services/api';
import { ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function Reports() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const response = await getScans();
      setScans(response.data.filter(s => s.status === 'COMPLETED'));
    } catch (error) {
      console.error('Failed to load scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (scanId: number, format: string) => {
    const url = `http://localhost:8080/api/reports/scan/${scanId}/${format}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-600 mt-2">Download security scan reports in various formats</p>
      </div>

      {scans.length === 0 ? (
        <div className="card text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No completed scans yet</p>
          <p className="text-sm text-gray-500 mt-2">Complete a scan to generate reports</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scans.map((scan) => (
            <div key={scan.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{scan.repositoryName}</h3>
                  <p className="text-sm text-gray-600">
                    Scan #{scan.id} • {new Date(scan.completedAt).toLocaleString()}
                  </p>
                  <div className="mt-2 flex space-x-4 text-sm">
                    <span className="text-red-600 font-medium">Critical: {scan.criticalCount}</span>
                    <span className="text-orange-600 font-medium">High: {scan.highCount}</span>
                    <span className="text-yellow-600 font-medium">Medium: {scan.mediumCount}</span>
                    <span className="text-green-600 font-medium">Low: {scan.lowCount}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadReport(scan.id, 'pdf')}
                    className="btn btn-primary text-sm flex items-center"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    PDF
                  </button>
                  <button
                    onClick={() => downloadReport(scan.id, 'json')}
                    className="btn btn-secondary text-sm flex items-center"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    JSON
                  </button>
                  <button
                    onClick={() => downloadReport(scan.id, 'csv')}
                    className="btn btn-secondary text-sm flex items-center"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    CSV
                  </button>
                  <button
                    onClick={() => downloadReport(scan.id, 'text')}
                    className="btn btn-secondary text-sm flex items-center"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    TXT
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
