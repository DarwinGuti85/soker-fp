import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ServiceOrder, Client, InventoryItem, Invoice, User, UserRole, InvoiceStatus, CompanyInfo } from '../types';
import { MOCK_SERVICES, MOCK_CLIENTS, MOCK_INVENTORY, MOCK_INVOICES, MOCK_USERS, MOCK_COMPANY_INFO } from '../data/mockData';

interface DataContextType {
  services: ServiceOrder[];
  clients: Client[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  users: User[];
  companyInfo: CompanyInfo;
  updateCompanyInfo: (newInfo: CompanyInfo) => void;
  updateService: (serviceId: string, updates: Partial<ServiceOrder>) => void;
  addService: (serviceData: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void;
  addInventoryItem: (itemData: Omit<InventoryItem, 'id'>) => void;
  addClient: (clientData: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (clientId: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'taxId'>> & { taxId?: string }) => void;
  deleteClient: (clientId: string) => void;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  addInvoice: (invoiceData: Omit<Invoice, 'id'>) => void;
  addHistoricalInvoice: (invoiceData: Omit<Invoice, 'id'> & { id: string }) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<ServiceOrder[]>(MOCK_SERVICES);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [users] = useState<User[]>(MOCK_USERS);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(MOCK_COMPANY_INFO);

  const updateCompanyInfo = useCallback((newInfo: CompanyInfo) => {
    setCompanyInfo(newInfo);
  }, []);

  const updateService = useCallback((serviceId: string, updates: Partial<ServiceOrder>) => {
    setServices(prev =>
      prev.map(s =>
        s.id === serviceId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      )
    );
  }, []);
  
  const addService = useCallback((serviceData: Omit<ServiceOrder, 'id'|'createdAt'|'updatedAt'>) => {
    const newService: ServiceOrder = {
        ...serviceData,
        id: `service-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    setServices(prev => [newService, ...prev]);
  }, []);

  const updateInventoryItem = useCallback((itemId: string, updates: Partial<InventoryItem>) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, []);
  
  const addInventoryItem = useCallback((itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
    };
    setInventory(prev => [newItem, ...prev]);
  }, []);

  const addClient = useCallback((clientData: Omit<Client, 'id'|'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  }, []);
  
  const updateClient = useCallback((clientId: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
      setClients(prev =>
          prev.map(client =>
              client.id === clientId ? { ...client, ...updates } : client
          )
      );
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    // Prevent deleting clients that are associated with services.
    // In a real DB, this would be a foreign key constraint.
    const isClientInUse = services.some(service => service.client.id === clientId);
    if (isClientInUse) {
        alert('No se puede eliminar un cliente que tiene órdenes de servicio asociadas.');
        return;
    }
    setClients(prev => prev.filter(c => c.id !== clientId));
  }, [services]);
  
  const updateInvoice = useCallback((invoiceId: string, updates: Partial<Invoice>) => {
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId ? { ...inv, ...updates } : inv
      )
    );
  }, []);

  const addInvoice = useCallback((invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `FACT-${String(1001 + invoices.length).padStart(4, '0')}`,
    };
    setInvoices(prev => [newInvoice, ...prev]);
  }, [invoices.length]);

  const addHistoricalInvoice = useCallback((invoiceData: Omit<Invoice, 'id'> & { id: string }) => {
    const existing = invoices.find(inv => inv.id === invoiceData.id);
    if (existing) {
        const errorMsg = `Error: La factura con el ID ${invoiceData.id} ya existe.`;
        alert(errorMsg);
        throw new Error(errorMsg);
    }
    const newInvoice: Invoice = {
      ...invoiceData
    };
    setInvoices(prev => [newInvoice, ...prev]);
  }, [invoices]);


  return (
    <DataContext.Provider value={{ services, clients, inventory, invoices, users, companyInfo, updateCompanyInfo, updateService, addService, updateInventoryItem, addInventoryItem, addClient, updateClient, deleteClient, updateInvoice, addInvoice, addHistoricalInvoice }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};