import { UserRole, ServiceStatus, InvoiceStatus, Module } from './types';

export const USER_ROLES = Object.values(UserRole);
export const SERVICE_STATUSES = Object.values(ServiceStatus);

export const STATUS_COLORS: { [key in ServiceStatus]: string } = {
  [ServiceStatus.PENDING]: 'bg-yellow-500/20 text-yellow-400',
  [ServiceStatus.IN_PROGRESS]: 'bg-blue-500/20 text-blue-400',
  [ServiceStatus.AWAITING_PARTS]: 'bg-purple-500/20 text-purple-400',
  [ServiceStatus.COMPLETED]: 'bg-green-500/20 text-green-400',
  [ServiceStatus.CANCELED]: 'bg-red-500/20 text-red-400',
};

export const STATUS_HEX_COLORS: { [key in ServiceStatus]: string } = {
  [ServiceStatus.PENDING]: '#f59e0b',
  [ServiceStatus.IN_PROGRESS]: '#3b82f6',
  [ServiceStatus.AWAITING_PARTS]: '#a855f7',
  [ServiceStatus.COMPLETED]: '#22c55e',
  [ServiceStatus.CANCELED]: '#ef4444',
};

export const STATUS_LABELS_ES: { [key in ServiceStatus]: string } = {
  [ServiceStatus.PENDING]: 'Pendiente',
  [ServiceStatus.IN_PROGRESS]: 'En Progreso',
  [ServiceStatus.AWAITING_PARTS]: 'Esperando Repuestos',
  [ServiceStatus.COMPLETED]: 'Completado',
  [ServiceStatus.CANCELED]: 'Cancelado',
};

export const ROLE_LABELS_ES: { [key in UserRole]: string } = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.CASHIER]: 'Cajero',
    [UserRole.TECHNICIAN]: 'Técnico',
};

export const INVOICE_STATUSES = Object.values(InvoiceStatus);

export const INVOICE_STATUS_COLORS: { [key in InvoiceStatus]: string } = {
  [InvoiceStatus.PAID]: 'bg-green-500/20 text-green-400',
  [InvoiceStatus.UNPAID]: 'bg-yellow-500/20 text-yellow-400',
};

export const INVOICE_STATUS_HEX_COLORS: { [key in InvoiceStatus]: string } = {
  [InvoiceStatus.PAID]: '#22c55e',
  [InvoiceStatus.UNPAID]: '#f59e0b',
};

export const INVOICE_STATUS_LABELS_ES: { [key in InvoiceStatus]: string } = {
  [InvoiceStatus.PAID]: 'Pagada',
  [InvoiceStatus.UNPAID]: 'Pendiente',
};

export const MODULES: Module[] = ['dashboard', 'services', 'clients', 'billing', 'inventory', 'settings', 'users'];

export const MODULE_LABELS_ES: Record<Module, string> = {
    dashboard: 'Panel Principal',
    services: 'Servicios',
    clients: 'Clientes',
    billing: 'Facturación',
    inventory: 'Inventario',
    settings: 'Ajustes',
    users: 'Usuarios'
};
