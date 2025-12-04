import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScan, getIssuesByScan, getScanProgress, Scan, Issue, ScanProgress } from '../services/api';
import { ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ScanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadScanData(parseInt(id));
      
      // Poll for progress if scan is in progress
      const interval = setInterval(() => {
        loadProgress(parseInt(id));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [id]);

  const loadScanData = async (scanId: number) => {
    try {
      const [scanResponse, issuesResponse] = await Promise.all([
        getScan(scanId),
        getIssuesByScan(scanId)
      ]);
      setScan(scanResponse.data);
      setIssues(issuesResponse.data);
    } catch (error) {
      console.error('Failed to load scan:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (scanId: number) => {
    try {
      const response = await getScanProgress(scanId);
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const downloadReport = (format: 'json' | 'csv' | 'text') => {
    window.open(`http://localhost:8080/api/reports/scan/${id}/${format}`, '_blank');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  if (!scan) {
    return <div>Scan not found</div>;
  }

  const groupedIssues = issues.reduce((acc, issue) => {
    const severity = issue.severity;
    if (!acc[severity]) acc[severity] = [];
    acc[severity].push(issue);
    return acc;
  }, {} as Record<string, Issue[]>);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/scans')}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Scans
      </button>

      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{scan.repositoryName}</h1>
            <p className="text-gray-600">Scan #{scan.id}</p>
          </div>
         <div className="flex space-x-2">
  <button onClick={() => downloadReport('pdf')} className="btn btn-primary text-sm">
    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
    PDF
  </button>
  <button onClick={() => downloadReport('json')} className="btn btn-secondary text-sm">
    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
    JSON
  </button>
  <button onClick={() => downloadReport('csv')} className="btn btn-secondary text-sm">
    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
    CSV
  </button>
  <button onClick={() => downloadReport('text')} className="btn btn-secondary text-sm">
    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
    TXT
  </button>
</div>
        </div>

        {progress && progress.progress < 100 && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{progress.currentStep}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Total Files" value={scan.totalFiles} />
          <StatBox label="Total Issues" value={scan.totalIssues} />
          <StatBox label="Critical" value={scan.criticalCount} color="red" />
          <StatBox label="High" value={scan.highCount} color="orange" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(groupedIssues).map(([severity, severityIssues]) => (
            <div key={severity} className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getSeverityColor(severity)}`} />
                {severity} Issues ({severityIssues.length})
              </h3>
              <div className="space-y-2">
                {severityIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="font-medium">{issue.ruleName}</div>
                    <div className="text-sm text-gray-600">
                      {issue.filePath}:{issue.lineNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedIssue && (
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Issue Details</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">File</div>
                  <div className="font-mono text-sm">{selectedIssue.filePath}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Line</div>
                  <div className="font-medium">{selectedIssue.lineNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Severity</div>
                  <div className="font-medium">{selectedIssue.severity}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Analyzer</div>
                  <div className="font-medium">{selectedIssue.analyzerSource}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Description</div>
                  <div className="text-sm">{selectedIssue.description}</div>
                </div>
                {selectedIssue.codeSnippet && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Code</div>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ fontSize: '12px' }}>
                      {selectedIssue.codeSnippet}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: any) {
  const colors = {
    red: 'text-red-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
  };

  return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`text-2xl font-bold ${color ? colors[color] : ''}`}>{value}</div>
    </div>
  );
}

function getSeverityColor(severity: string) {
  const colors = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
  };
  return colors[severity as keyof typeof colors] || 'bg-gray-500';
}
