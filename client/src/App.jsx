import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import AssetFormPage from './pages/AssetFormPage';
import UsersPage from './pages/UsersPage';

const toastStyle = {
  background: '#121212',
  color: '#FBFAF3',
  border: '2px solid #121212',
  borderRadius: 0,
  boxShadow: 'none',
  fontFamily: "'Archivo', system-ui, sans-serif",
  fontSize: '0.9375rem',
  fontWeight: 600,
  padding: '12px 14px',
  maxWidth: 420,
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: toastStyle,
            success: { iconTheme: { primary: '#F5D000', secondary: '#121212' } },
            error: {
              style: { ...toastStyle, background: '#C4101F', border: '2px solid #C4101F', color: '#FFFFFF' },
              iconTheme: { primary: '#FFFFFF', secondary: '#C4101F' },
            },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
          <Route path="/assets/new" element={<ProtectedRoute><AssetFormPage /></ProtectedRoute>} />
          <Route path="/assets/:id/edit" element={<ProtectedRoute><AssetFormPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
