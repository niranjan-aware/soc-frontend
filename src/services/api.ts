import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Repository {
  id: number;
  githubUsername: string;
  githubOrg: string;
  repoName: string;
  repoUrl: string;
  defaultBranch: string;
  language: string;
  stars: number;
  status: string;
}

export interface Scan {
  id: number;
  repositoryId: number;
  repositoryName: string;
  scanType: string;
  status: string;
  startedAt: string;
  completedAt: string;
  totalFiles: number;
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  scanDurationMs: number;
}

export interface Issue {
  id: number;
  scanId: number;
  fileId: number;
  filePath: string;
  issueType: string;
  severity: string;
  ruleId: string;
  ruleName: string;
  description: string;
  lineNumber: number;
  columnNumber: number;
  codeSnippet: string;
  suggestedFix: string;
  analyzerSource: string;
  falsePositive: boolean;
}

export interface DashboardMetrics {
  totalRepositories: number;
  totalScans: number;
  completedScans: number;
  failedScans: number;
  inProgressScans: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  totalVulnerableDependencies: number;
  issuesByType: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  issuesByAnalyzer: Record<string, number>;
}

export interface ScanProgress {
  progress: number;
  currentStep: string;
}

// Repository APIs
export const importRepositories = (data: { githubUsername?: string; githubOrg?: string; type: string }) => 
  api.post('/repositories/import', data);

export const getRepositories = () => 
  api.get<Repository[]>('/repositories');

export const getRepository = (id: number) => 
  api.get<Repository>(`/repositories/${id}`);

export const deleteRepository = (id: number) => 
  api.delete(`/repositories/${id}`);

// Scan APIs
export const createScan = (data: { repositoryId: number; branch?: string }) => 
  api.post<Scan>('/scans', data);

export const getScans = () => 
  api.get<Scan[]>('/scans');

export const getScan = (id: number) => 
  api.get<Scan>(`/scans/${id}`);

export const getScansByRepository = (repositoryId: number) => 
  api.get<Scan[]>(`/scans/repository/${repositoryId}`);

export const getScanProgress = (id: number) => 
  api.get<ScanProgress>(`/scans/${id}/progress`);

export const deleteScan = (id: number) => 
  api.delete(`/scans/${id}`);

// Issue APIs
export const getIssuesByScan = (scanId: number) => 
  api.get<Issue[]>(`/issues/scan/${scanId}`);

export const getIssue = (id: number) => 
  api.get<Issue>(`/issues/${id}`);

export const getIssuesBySeverity = (scanId: number, severity: string) => 
  api.get<Issue[]>(`/issues/scan/${scanId}/severity/${severity}`);

export const markIssueAsFalsePositive = (id: number) => 
  api.put<Issue>(`/issues/${id}/mark-false-positive`);

// Dashboard APIs
export const getDashboardOverview = () => 
  api.get<DashboardMetrics>('/dashboard/overview');

export const getRepositoryMetrics = (id: number) => 
  api.get(`/dashboard/repository/${id}`);

// Report APIs
export const downloadJsonReport = (scanId: number) => 
  api.get(`/reports/scan/${scanId}/json`, { responseType: 'blob' });

export const downloadCsvReport = (scanId: number) => 
  api.get(`/reports/scan/${scanId}/csv`, { responseType: 'blob' });

export const downloadTextReport = (scanId: number) => 
  api.get(`/reports/scan/${scanId}/text`, { responseType: 'blob' });

export default api;
