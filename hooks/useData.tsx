
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ServiceOrder, Client, InventoryItem, Invoice, User, UserRole, InvoiceStatus } from '../types';
import { MOCK_SERVICES, MOCK_CLIENTS, MOCK_INVENTORY, MOCK_INVOICES, MOCK_USERS } from '../data/mockData';

interface DataContextType {
  services: ServiceOrder[];
  clients: Client[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  users: User[];
  updateService: (serviceId: string, updates: Partial<ServiceOrder>) => void;
  addService: (serviceData: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void;
  addInventoryItem: (itemData: Omit<InventoryItem, 'id'>) => void;
  addClient: (clientData: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  addInvoice: (invoiceData: Omit<Invoice, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<ServiceOrder[]>(MOCK_SERVICES);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [users] = useState<User[]>(MOCK_USERS);

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


  return (
    <DataContext.Provider value={{ services, clients, inventory, invoices, users, updateService, addService, updateInventoryItem, addInventoryItem, addClient, updateInvoice, addInvoice }}>
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
