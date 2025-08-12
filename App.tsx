
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Services from './components/Services';
import Clients from './components/Clients';
import Inventory from './components/Inventory';
import Settings from './components/Settings';
import Billing from './components/Billing';
import AIModule from './components/AIModule';
import { useAuth } from './hooks/useAuth';
import { UserRole, Module, PermissionSet } from './types';
import Login from './components/Login';

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode, 
  module: Module,
  permission: keyof PermissionSet
}> = ({ children, module, permission }) => {
  const { user, hasPermission } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(module, permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const MainLayout: React.FC = () => (
  <div className="min-h-screen bg-brand-bg-dark text-brand-text font-sans antialiased">
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: "url(https://images.unsplash.com/photo-1534237939994-38c1b2c8427f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)", zIndex: 0, filter: 'grayscale(50%)' }}
    ></div>
    <div className="absolute inset-0 bg-black/80" style={{ zIndex: 1 }}></div>
    
    <div className="relative z-10">
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute module="dashboard" permission="view"><Dashboard /></ProtectedRoute>} />
            <Route path="/services" element={
              <ProtectedRoute module="services" permission="view">
                <Services />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute module="clients" permission="view">
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute module="billing" permission="view">
                <Billing />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute module="inventory" permission="view">
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="/ai" element={
              <ProtectedRoute module="ai" permission="view">
                <AIModule />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute module="settings" permission="view">
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  </div>
);


const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <HashRouter>
      <Routes>
        {user ? (
          <Route path="/*" element={<MainLayout />} />
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </HashRouter>
  );
};

export default App;