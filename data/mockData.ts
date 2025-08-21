import { User, UserRole, Client, ServiceOrder, InventoryItem, Invoice, CompanyInfo } from '../types';

export const MOCK_COMPANY_INFO: CompanyInfo = {
    name: 'SOKER FP, C.A.',
    taxId: 'J-12345678-9',
    address: 'Av. Principal, Edif. Soker, Caracas',
    email: 'contacto@sokerfp.com',
    phone: '+58 212-555-1234'
};

export const MOCK_USERS: User[] = [
  { id: 'user-1', username: 'admin', firstName: 'Admin', lastName: 'Soker', email: 'admin@soker.com', role: UserRole.ADMIN, password: '54321' },
];

export const MOCK_CLIENTS: Client[] = [];

export const MOCK_INVENTORY: InventoryItem[] = [];

export const MOCK_SERVICES: ServiceOrder[] = [];

export const MOCK_INVOICES: Invoice[] = [];
