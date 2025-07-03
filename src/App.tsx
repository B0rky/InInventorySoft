import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingSpinner } from './components/ui/loading-spinner';
import './App.css';

// Lazy load pages for better performance
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Sales = lazy(() => import('./pages/Sales'));
const Reports = lazy(() => import('./pages/Reports'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="xl" text="Cargando página..." />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes with layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Outlet />
                  </AppLayout>
                </ProtectedRoute>
              }>
                <Route index element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Dashboard />
                  </Suspense>
                } />
                <Route path="inventory" element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Inventory />
                  </Suspense>
                } />
                <Route path="sales" element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Sales />
                  </Suspense>
                } />
                <Route path="reports" element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Reports />
                  </Suspense>
                } />
                <Route path="calendar" element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Calendar />
                  </Suspense>
                } />
                <Route path="profile" element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Profile />
                  </Suspense>
                } />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={
                <Suspense fallback={<PageLoadingFallback />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
