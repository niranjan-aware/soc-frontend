import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  FolderIcon, 
  ShieldCheckIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Repositories', href: '/repositories', icon: FolderIcon },
    { name: 'Scans', href: '/scans', icon: ShieldCheckIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        <div className="flex h-16 items-center justify-center border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white">🛡️ Solilos</h1>
        </div>
        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-6 w-6 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Security Analysis Platform
            </h2>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
