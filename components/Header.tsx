import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { User, UserRole } from '../types';
import { ChevronDownIcon, DashboardIcon, ServicesIcon, ClientsIcon, InventoryIcon, UsersIcon, LogoutIcon, MenuIcon, CloseIcon, BillingIcon, SettingsIcon, SparklesIcon, SunIcon, MoonIcon } from './ui/icons';

const NavItem: React.FC<{ to: string, children: React.ReactNode, icon: React.ReactNode, isMobile?: boolean }> = ({ to, children, icon, isMobile = false }) => {
  const commonClasses = "flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors";
  const inactiveClasses = "text-gray-500 dark:text-brand-text-dark hover:bg-gray-100 dark:hover:bg-brand-bg-light hover:text-gray-900 dark:hover:text-brand-text";
  const activeClasses = "text-brand-orange bg-brand-orange/10";
  const sizeClasses = isMobile ? "text-xl" : "text-sm";
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${commonClasses} ${sizeClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span>{children}</span>
    </NavLink>
  );
};

const NavLinks: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const { hasPermission } = useAuth();

  return (
    <>
      {hasPermission('dashboard', 'view') && <NavItem to="/dashboard" icon={<DashboardIcon className={isMobile ? "h-6 w-6" : "h-5 w-5"}/>} isMobile={isMobile}>Panel</NavItem>}
      {hasPermission('services', 'view') && <NavItem to="/services" icon={<ServicesIcon className={isMobile ? "h-6 w-6" : "h-5 w-5"}/>} isMobile={isMobile}>Servicios</NavItem>}
      {hasPermission('clients', 'view') && <NavItem to="/clients" icon={<ClientsIcon className={isMobile ? "h-6 w-6" : "h-5 w-5"}/>} isMobile={isMobile}>Clientes</NavItem>}
      {hasPermission('billing', 'view') && <NavItem to="/billing" icon={<BillingIcon className={isMobile ? "h-6 w-6" : "h-5 w-5"}/>} isMobile={isMobile}>Facturación</NavItem>}
      {hasPermission('inventory', 'view') && <NavItem to="/inventory" icon={<InventoryIcon className={isMobile ? "h-6 w-6" : "h-5 w-5"}/>} isMobile={isMobile}>Inventario</NavItem>}
      {hasPermission('ai', 'view') && <NavItem to="/ai" icon={<SparklesIcon className={isMobile ? "h-6 w-6" : "h-5 w-5"}/>} isMobile={isMobile}>Asistente Virtual</NavItem>}
    </>
  );
};

const Header: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="bg-white/80 dark:bg-black/30 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-200 dark:border-transparent">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <NavLink to="/dashboard" className="flex-shrink-0 flex items-center space-x-2">
                <h1 className="neon-title">𝕊𝕆𝕂𝔼ℝ 𝔽ℙ</h1>
              </NavLink>
              <div className="hidden md:flex items-center space-x-4">
                <NavLinks />
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 bg-brand-orange/10 text-brand-orange px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-orange/20 transition-colors"
                >
                  <span>{user ? `${user.firstName} ${user.lastName}` : 'Usuario'}</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-brand-bg-light border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-40">
                    {hasPermission('settings', 'view') && (
                      <NavLink
                          to="/settings"
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-brand-text hover:bg-gray-100 dark:hover:bg-brand-orange/20 flex items-center space-x-2"
                      >
                          <SettingsIcon className="h-4 w-4" />
                          <span>Ajustes</span>
                      </NavLink>
                    )}
                    <button
                      onClick={toggleTheme}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-brand-text hover:bg-gray-100 dark:hover:bg-brand-orange/20 flex items-center space-x-2"
                    >
                      {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                      <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Oscuro'}</span>
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-brand-text hover:bg-gray-100 dark:hover:bg-brand-orange/20 flex items-center space-x-2"
                    >
                      <LogoutIcon className="h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="md:hidden flex items-center ml-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-brand-text-dark hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-brand-bg-light focus:outline-none"
                  aria-label="Abrir menú principal"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-white dark:bg-brand-bg-dark z-50 p-4 flex flex-col md:hidden animate-fadeInUp"
          style={{animationDuration: '300ms'}}
        >
          <div className="flex justify-between items-center mb-8">
            <NavLink to="/dashboard" className="flex-shrink-0 flex items-center space-x-2">
                <h1 className="neon-title">𝕊𝕆𝕂𝔼ℝ 𝔽ℙ</h1>
            </NavLink>
            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 dark:text-brand-text-dark hover:text-black dark:hover:text-white p-2" aria-label="Cerrar menú">
              <CloseIcon className="h-7 w-7" />
            </button>
          </div>
          
          <nav className="flex-1 flex flex-col justify-center items-center space-y-6">
            <NavLinks isMobile={true} />
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;