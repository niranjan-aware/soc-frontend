import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import Scans from './pages/Scans';
import ScanDetail from './pages/ScanDetail';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/scans" element={<Scans />} />
          <Route path="/scans/new" element={<Scans />} />
          <Route path="/scans/:id" element={<ScanDetail />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
