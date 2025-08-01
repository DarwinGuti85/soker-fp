
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Client } from '../types';
import { CloseIcon } from './ui/icons';

const Clients: React.FC = () => {
  const { clients, addClient } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialNewClientState: Omit<Client, 'id' | 'createdAt'> = { firstName: '', lastName: '', whatsapp: '', email: '', address: '' };
  const [newClientData, setNewClientData] = useState(initialNewClientState);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.firstName || !newClientData.lastName || !newClientData.whatsapp) {
      alert('Nombres, Apellidos y WhatsApp son campos requeridos.');
      return;
    }
    
    addClient(newClientData);

    setNewClientData(initialNewClientState);
    setIsModalOpen(false);
  };

  const Modal = () => (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-brand-bg-light z-10 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Añadir Nuevo Cliente</h2>
          <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleCreateClient} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-brand-text-dark">Nombres</label>
              <input type="text" id="firstName" value={newClientData.firstName} onChange={e => setNewClientData({...newClientData, firstName: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-brand-text-dark">Apellidos</label>
              <input type="text" id="lastName" value={newClientData.lastName} onChange={e => setNewClientData({...newClientData, lastName: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="whatsapp" className="block text-sm font-medium text-brand-text-dark">WhatsApp</label>
              <input type="tel" id="whatsapp" value={newClientData.whatsapp} onChange={e => setNewClientData({...newClientData, whatsapp: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
            </div>
          </div>
          <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-brand-text-dark">Email (Opcional)</label>
              <input type="email" id="email" value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" />
          </div>
           <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-brand-text-dark">Dirección (Opcional)</label>
              <input type="text" id="address" value={newClientData.address} onChange={e => setNewClientData({...newClientData, address: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
            <button type="submit" className="bg-brand-orange text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">Guardar Cliente</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {isModalOpen && <Modal />}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Clientes</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors"
        >
          Añadir Nuevo Cliente
        </button>
      </div>
      
      <div className="bg-brand-bg-light rounded-lg shadow-lg border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Contacto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Dirección</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-brand-bg-light divide-y divide-gray-700">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-brand-text">{`${client.firstName} ${client.lastName}`}</div>
                    <div className="text-sm text-brand-text-dark">{client.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dark">
                    <div>WhatsApp: {client.whatsapp || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dark">{client.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <a href="#" className="text-brand-orange hover:text-orange-400">Editar</a>
                    <a href="#" className="text-red-500 hover:text-red-400">Eliminar</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;
