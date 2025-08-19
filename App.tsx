
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
import Chatbot from './components/Chatbot';

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

const AnimatedBackground: React.FC = () => (
    <div className="background" aria-hidden="true">
        <svg className="illustration" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400">
            <defs>
                <style>
                    {`.st0{fill:#FF5B22;font-size:10px;font-family:monospace;}`}
                </style>
            </defs>
            <g className="hover">
                <g className="number-one"><text transform="matrix(1 0 0 1 100 80)" className="st0">1</text></g>
                <g className="number-two"><text transform="matrix(1 0 0 1 250 120)" className="st0">0</text></g>
                <g className="number-three"><text transform="matrix(1 0 0 1 50 200)" className="st0">0</text></g>
                <g className="number-four"><text transform="matrix(1 0 0 1 400 50)" className="st0">1</text></g>
                <g className="number-five"><text transform="matrix(1 0 0 1 300 250)" className="st0">1</text></g>
                <g className="number-six"><text transform="matrix(1 0 0 1 120 300)" className="st0">0</text></g>
                <g className="number-seven"><text transform="matrix(1 0 0 1 450 180)" className="st0">0</text></g>
                <g className="number-eight"><text transform="matrix(1 0 0 1 20 150)" className="st0">1</text></g>
                <g className="number-nine"><text transform="matrix(1 0 0 1 350 350)" className="st0">0</text></g>
                <g className="number-ten"><text transform="matrix(1 0 0 1 480 20)" className="st0">1</text></g>
                <g className="number-eleven"><text transform="matrix(1 0 0 1 270 20)" className="st0">0</text></g>
                <g className="number-twelve"><text transform="matrix(1 0 0 1 180 220)" className="st0">1</text></g>
                <g className="number-thirteen"><text transform="matrix(1 0 0 1 420 280)" className="st0">0</text></g>
                <g className="number-fourteen"><text transform="matrix(1 0 0 1 150 50)" className="st0">0</text></g>
                <g className="number-fifteen"><text transform="matrix(1 0 0 1 380 150)" className="st0">1</text></g>
                <g className="number-sixteen"><text transform="matrix(1 0 0 1 80 350)" className="st0">1</text></g>
                <g className="number-seventeen"><text transform="matrix(1 0 0 1 460 320)" className="st0">0</text></g>
                <g className="number-eighteen"><text transform="matrix(1 0 0 1 200 10)" className="st0">1</text></g>
                <g className="number-nineteen"><text transform="matrix(1 0 0 1 200 380)" className="st0">0</text></g>
                <g className="number-twenty"><text transform="matrix(1 0 0 1 30 280)" className="st0">1</text></g>
                <g className="number-twenty-one"><text transform="matrix(1 0 0 1 70 40)" className="st0">0</text></g>
                <g className="number-twenty-two"><text transform="matrix(1 0 0 1 170 90)" className="st0">1</text></g>
                <g className="number-twenty-three"><text transform="matrix(1 0 0 1 330 60)" className="st0">0</text></g>
                <g className="number-twenty-four"><text transform="matrix(1 0 0 1 440 140)" className="st0">1</text></g>
                <g className="number-twenty-five"><text transform="matrix(1 0 0 1 80 180)" className="st0">0</text></g>
                <g className="number-twenty-six"><text transform="matrix(1 0 0 1 260 270)" className="st0">1</text></g>
                <g className="number-twenty-seven"><text transform="matrix(1 0 0 1 390 230)" className="st0">0</text></g>
                <g className="number-twenty-eight"><text transform="matrix(1 0 0 1 490 310)" className="st0">1</text></g>
                <g className="number-twenty-nine"><text transform="matrix(1 0 0 1 10 330)" className="st0">0</text></g>
                <g className="number-thirty"><text transform="matrix(1 0 0 1 160 360)" className="st0">1</text></g>
                <g className="number-thirty-one"><text transform="matrix(1 0 0 1 280 340)" className="st0">0</text></g>
                <g className="number-thirty-two"><text transform="matrix(1 0 0 1 410 380)" className="st0">1</text></g>
                <g className="number-thirty-three"><text transform="matrix(1 0 0 1 230 5)" className="st0">0</text></g>
                <g className="number-thirty-four"><text transform="matrix(1 0 0 1 370 95)" className="st0">1</text></g>
                <g className="number-thirty-five"><text transform="matrix(1 0 0 1 90 240)" className="st0">0</text></g>
                <g className="number-thirty-six"><text transform="matrix(1 0 0 1 210 160)" className="st0">1</text></g>
                <g className="number-thirty-seven"><text transform="matrix(1 0 0 1 310 110)" className="st0">0</text></g>
                <g className="number-thirty-eight"><text transform="matrix(1 0 0 1 60 390)" className="st0">1</text></g>
                <g className="number-thirty-nine"><text transform="matrix(1 0 0 1 470 250)" className="st0">0</text></g>
                <g className="number-forty"><text transform="matrix(1 0 0 1 240 310)" className="st0">1</text></g>
            </g>
        </svg>
    </div>
);

const MainLayout: React.FC = () => (
  <div className="min-h-screen text-brand-text font-sans antialiased relative overflow-hidden">
    <AnimatedBackground />
    
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
    <Chatbot />
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