
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Client, ServiceOrder } from '../types';
import { CloseIcon, TrashIcon, EditIcon } from './ui/icons';

const ClientFormModal: React.FC<{
    editingClient: Client | null;
    onClose: () => void;
    onSave: (clientData: Omit<Client, 'id' | 'createdAt'>, id?: string) => void;
}> = ({ editingClient, onClose, onSave }) => {

    const initialFormState: Omit<Client, 'id' | 'createdAt'> = editingClient 
        ? { ...editingClient } 
        : { firstName: '', lastName: '', whatsapp: '', email: '', address: '', taxId: '' };

    const [formData, setFormData] = useState(initialFormState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.id]: e.target.value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.whatsapp) {
            alert('Nombres, Apellidos y WhatsApp son campos requeridos.');
            return;
        }
        onSave(formData, editingClient?.id);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="sticky top-0 bg-brand-bg-light z-10 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">{editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="block text-sm font-medium text-brand-text-dark">Nombres</label>
                            <input type="text" id="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="lastName" className="block text-sm font-medium text-brand-text-dark">Apellidos</label>
                            <input type="text" id="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="whatsapp" className="block text-sm font-medium text-brand-text-dark">WhatsApp</label>
                            <input type="tel" id="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
                        </div>
                         <div className="space-y-2">
                            <label htmlFor="taxId" className="block text-sm font-medium text-brand-text-dark">RIF / Cédula (Opcional)</label>
                            <input type="text" id="taxId" value={formData.taxId || ''} onChange={handleChange} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-brand-text-dark">Email (Opcional)</label>
                        <input type="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="address" className="block text-sm font-medium text-brand-text-dark">Dirección (Opcional)</label>
                        <input type="text" id="address" value={formData.address} onChange={handleChange} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-brand-orange text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">{editingClient ? 'Guardar Cambios' : 'Guardar Cliente'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{
    client: Client | null;
    onClose: () => void;
    onConfirm: () => void;
    hasServices: boolean;
}> = ({ client, onClose, onConfirm, hasServices }) => {
    if (!client) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
            <div className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-md">
                <div className="p-6 text-center">
                    <TrashIcon className="h-12 w-12 mx-auto text-red-500" />
                    <h3 className="mt-4 text-xl font-bold text-white">¿Estás seguro?</h3>
                    {hasServices ? (
                        <p className="mt-2 text-sm text-brand-text-dark">
                            No se puede eliminar al cliente <span className="font-bold text-brand-text">{client.firstName} {client.lastName}</span> porque tiene órdenes de servicio asociadas.
                        </p>
                    ) : (
                        <p className="mt-2 text-sm text-brand-text-dark">
                            Estás a punto de eliminar al cliente <span className="font-bold text-brand-text">{client.firstName} {client.lastName}</span>. Esta acción no se puede deshacer.
                        </p>
                    )}
                    <div className="mt-6 flex justify-center space-x-4">
                        <button onClick={onClose} type="button" className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">
                            {hasServices ? 'Entendido' : 'Cancelar'}
                        </button>
                        {!hasServices && (
                            <button onClick={onConfirm} type="button" className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-500 transition-colors">
                                Eliminar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const Clients: React.FC = () => {
    const { clients, services, addClient, deleteClient, updateClient } = useData();
    const { hasPermission } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const handleOpenModal = (client: Client | null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
    };

    const handleSave = (clientData: Omit<Client, 'id' | 'createdAt'>, id?: string) => {
        if (id) {
            updateClient(id, clientData);
        } else {
            addClient(clientData);
        }
        handleCloseModal();
    };

    const handleDeleteClick = (client: Client) => {
        setClientToDelete(client);
        setIsDeleteModalOpen(true);
    };
    
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setClientToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (clientToDelete) {
            deleteClient(clientToDelete.id);
            handleCloseDeleteModal();
        }
    };
    
    const clientHasServices = (clientId: string): boolean => {
        return services.some(service => service.client.id === clientId);
    }

    return (
        <div className="space-y-6">
            {isModalOpen && 
                <ClientFormModal
                    editingClient={editingClient}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            }
            {isDeleteModalOpen && clientToDelete &&
                <DeleteConfirmationModal
                    client={clientToDelete}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                    hasServices={clientHasServices(clientToDelete.id)}
                />
            }
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Clientes</h1>
                {hasPermission('clients', 'edit') && (
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Añadir Nuevo Cliente
                    </button>
                )}
            </div>

            <div className="bg-brand-bg-light rounded-lg shadow-lg border border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Nombre</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Contacto</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Dirección</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-brand-bg-light divide-y divide-gray-700">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-800/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-brand-text">{`${client.firstName} ${client.lastName}`}</div>
                                        <div className="text-sm text-brand-text-dark">{client.taxId || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dark">
                                        <div>{client.whatsapp || 'N/A'}</div>
                                        <div>{client.email || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dark">{client.address}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                        <div className="flex items-center space-x-4">
                                            {hasPermission('clients', 'edit') && (
                                                <button onClick={() => handleOpenModal(client)} className="text-brand-orange hover:text-orange-400 transition-colors">
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            {hasPermission('clients', 'delete') && (
                                                <button onClick={() => handleDeleteClick(client)} className="text-red-500 hover:text-red-400 transition-colors">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
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
