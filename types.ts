export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  TECHNICIAN = 'TECHNICIAN'
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password?: string; // Optional for creation/update
}

export interface Client {
  id: string;
  firstName: string;
  lastName:string;
  whatsapp: string;
  email: string;
  address: string;
  createdAt: string;
  taxId?: string;
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_PARTS = 'AWAITING_PARTS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface ServiceOrder {
  id: string;
  originalInvoiceNumber?: string;
  client: Client;
  applianceName: string;
  applianceType: string;
  clientDescription: string;
  technicianNotes: string;
  status: ServiceStatus;
  technician?: User;
  createdAt: string;
  updatedAt: string;
  partsUsed?: InventoryItem[];
  lastNotificationSent?: string;
}

export enum InvoiceStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID'
}

export interface Invoice {
  id: string; // For historical, this will be the original invoice number
  serviceOrder?: ServiceOrder; // Optional for historical invoices
  clientName?: string; // For historical invoices
  applianceDescription?: string; // For historical invoices
  issueDate: string;
  status: InvoiceStatus;
  // Detailed breakdown
  laborCost: number;
  partsTotal: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

export interface CompanyInfo {
  name: string;
  taxId: string;
  address: string;
  email: string;
  phone: string;
}

// --- PERMISSIONS ---
export type Module = 'dashboard' | 'services' | 'clients' | 'billing' | 'inventory' | 'settings' | 'users' | 'ai';

export interface PermissionSet {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export type RolePermissions = Record<Module, PermissionSet>;

export type Permissions = {
  [key in Exclude<UserRole, UserRole.ADMIN>]: RolePermissions;
};