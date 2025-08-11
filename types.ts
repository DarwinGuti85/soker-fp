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
}

export enum InvoiceStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID'
}

export interface Invoice {
  id: string;
  serviceOrder: ServiceOrder;
  issueDate: string;
  status: InvoiceStatus;
  // Detailed breakdown
  revisionPrice: number;
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
export type Module = 'dashboard' | 'services' | 'clients' | 'billing' | 'inventory' | 'settings' | 'users';

export interface PermissionSet {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export type RolePermissions = Record<Module, PermissionSet>;

export type Permissions = {
  [key in Exclude<UserRole, UserRole.ADMIN>]: RolePermissions;
};
