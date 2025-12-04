import { useEffect, useState } from 'react';
import { getDashboardOverview, DashboardMetrics } from '../services/api';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  FolderIcon,
  DocumentCheckIcon 
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await getDashboardOverview();
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) return <div>Failed to load dashboard</div>;

  const severityData = [
    { name: 'Critical', value: metrics.criticalIssues, color: '#dc2626' },
    { name: 'High', value: metrics.highIssues, color: '#ea580c' },
    { name: 'Medium', value: metrics.mediumIssues, color: '#ca8a04' },
    { name: 'Low', value: metrics.lowIssues, color: '#65a30d' },
  ];

  const analyzerData = Object.entries(metrics.issuesByAnalyzer).map(([name, value]) => ({
    name,
    issues: value,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Security Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Repositories"
          value={metrics.totalRepositories}
          icon={FolderIcon}
          color="blue"
        />
        <StatCard
          title="Total Scans"
          value={metrics.totalScans}
          icon={ShieldCheckIcon}
          color="green"
        />
        <StatCard
          title="Total Issues"
          value={metrics.totalIssues}
          icon={ExclamationTriangleIcon}
          color="red"
        />
        <StatCard
          title="Vulnerable Deps"
          value={metrics.totalVulnerableDependencies}
          icon={DocumentCheckIcon}
          color="orange"
        />
      </div>

      {/* Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <SeverityCard label="Critical" count={metrics.criticalIssues} color="red" />
        <SeverityCard label="High" count={metrics.highIssues} color="orange" />
        <SeverityCard label="Medium" count={metrics.mediumIssues} color="yellow" />
        <SeverityCard label="Low" count={metrics.lowIssues} color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Severity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Issues by Severity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Issues by Analyzer */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Issues by Analyzer</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyzerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="issues" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scan Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Scan Status</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600">{metrics.completedScans}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">{metrics.inProgressScans}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600">{metrics.failedScans}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

function SeverityCard({ label, count, color }: any) {
  const colorClasses = {
    red: 'border-red-500 bg-red-50',
    orange: 'border-orange-500 bg-orange-50',
    yellow: 'border-yellow-500 bg-yellow-50',
    green: 'border-green-500 bg-green-50',
  };

  const textColors = {
    red: 'text-red-700',
    orange: 'text-orange-700',
    yellow: 'text-yellow-700',
    green: 'text-green-700',
  };

  return (
    <div className={`card border-l-4 ${colorClasses[color]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${textColors[color]}`}>{count}</p>
    </div>
  );
}
