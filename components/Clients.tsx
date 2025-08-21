
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Client, ServiceOrder } from '../types';
import { CloseIcon, TrashIcon, EditIcon, EyeIcon } from './ui/icons';
import { STATUS_COLORS, STATUS_LABELS_ES } from '../constants';

const ClientFormView: React.FC<{
    editingClient: Client | null;
    onClose: () => void;
    onSave: (clientData: Omit<Client, 'id' | 'createdAt'>, id?: string) => void;
}> = ({ editingClient, onClose, onSave }) => {

    const initialFormState: Omit<Client, 'id' | 'createdAt'> = editingClient 
        ? { ...editingClient } 
        : { firstName: '', lastName: '', whatsapp: '', email: '', address: '', taxId: '' };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        setFormData(editingClient 
            ? { ...editingClient } 
            : { firstName: '', lastName: '', whatsapp: '', email: '', address: '', taxId: '' }
        );
    }, [editingClient]);


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
        <div className="bg-brand-orange/10 dark:bg-brand-bg-light rounded-lg shadow-lg border border-brand-orange/30 dark:border-gray-700/50 animate-fadeInUp">
            <div className="px-6 py-4 border-b border-brand-orange/20 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</h2>
                 <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">
                    Volver a la lista
                </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

const ClientDetailsView: React.FC<{
    client: Client;
    onClose: () => void;
    onEdit: (client: Client) => void;
}> = ({ client, onClose, onEdit }) => {
    const { services } = useData();

    const clientServices = useMemo(() => {
        return services.filter(s => s.client.id === client.id)
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [services, client.id]);

    return (
        <div className="bg-brand-orange/10 dark:bg-brand-bg-light rounded-lg shadow-lg border border-brand-orange/30 dark:border-gray-700/50 animate-fadeInUp">
            <div className="px-6 py-4 border-b border-brand-orange/20 dark:border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">Detalles de: {client.firstName} {client.lastName}</h2>
                <div className="flex items-center space-x-3 self-end md:self-auto">
                     <button onClick={() => onEdit(client)} className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-500 transition-colors flex items-center gap-2">
                        <EditIcon className="h-4 w-4" /> Editar
                    </button>
                    <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">
                        Volver a la lista
                    </button>
                </div>
            </div>
            <div className="p-6 space-y-8">
                {/* Client Info Section */}
                <div>
                    <h3 className="text-xl font-bold text-brand-orange mb-4">Información de Contacto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-brand-bg-dark/20 p-4 rounded-lg">
                        <p><strong className="text-brand-text-dark">Nombre Completo:</strong> {client.firstName} {client.lastName}</p>
                        <p><strong className="text-brand-text-dark">RIF / Cédula:</strong> {client.taxId || 'No especificado'}</p>
                        <p><strong className="text-brand-text-dark">WhatsApp:</strong> {client.whatsapp}</p>
                        <p><strong className="text-brand-text-dark">Email:</strong> {client.email || 'No especificado'}</p>
                        <p className="md:col-span-2"><strong className="text-brand-text-dark">Dirección:</strong> {client.address || 'No especificada'}</p>
                         <p className="md:col-span-2 text-sm text-brand-text-dark">Cliente desde: {new Date(client.createdAt).toLocaleDateString('es-ES')}</p>
                    </div>
                </div>
                
                {/* Service History Section */}
                <div>
                    <h3 className="text-xl font-bold text-brand-orange mb-4">Historial de Servicios ({clientServices.length})</h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-700">
                        <table className="min-w-full text-sm">
                            <thead className="text-left text-brand-text-dark bg-gray-800/50">
                                <tr>
                                    <th className="p-3 font-semibold">ID Servicio</th>
                                    <th className="p-3 font-semibold">Artefacto</th>
                                    <th className="p-3 font-semibold">Fecha Ingreso</th>
                                    <th className="p-3 font-semibold">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {clientServices.length > 0 ? clientServices.map(service => (
                                    <tr key={service.id}>
                                        <td className="p-3 font-mono text-xs">{service.id}</td>
                                        <td className="p-3">{service.applianceName}</td>
                                        <td className="p-3">{new Date(service.createdAt).toLocaleDateString('es-ES')}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[service.status]}`}>
                                                {STATUS_LABELS_ES[service.status]}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="p-4 text-center text-brand-text-dark italic">Este cliente no tiene servicios registrados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Clients: React.FC = () => {
    const { clients, services, addClient, deleteClient, updateClient } = useData();
    const { hasPermission } = useAuth();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleOpenForm = (client: Client | null) => {
        setEditingClient(client);
        setIsFormVisible(true);
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
        setEditingClient(null);
    };
    
    const handleViewDetails = (client: Client) => {
        setSelectedClient(client);
    };
    
    const handleCloseDetails = () => {
        setSelectedClient(null);
    };

    const filteredClients = useMemo(() => {
        if (!searchTerm.trim()) {
            return clients;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return clients.filter(client =>
            `${client.firstName} ${client.lastName}`.toLowerCase().includes(lowercasedTerm) ||
            (client.taxId && client.taxId.toLowerCase().includes(lowercasedTerm)) ||
            client.whatsapp.toLowerCase().includes(lowercasedTerm)
        );
    }, [clients, searchTerm]);
    
    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
    const pageCount = Math.ceil(filteredClients.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > pageCount) return;
        setCurrentPage(pageNumber);
    };

    const handleSave = (clientData: Omit<Client, 'id' | 'createdAt'>, id?: string) => {
        if (id) {
            updateClient(id, clientData);
        } else {
            addClient(clientData);
        }
        handleCloseForm();
        if(selectedClient && id === selectedClient.id) {
             setSelectedClient(prev => prev ? ({ ...prev, ...clientData }) : null);
        }
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
        <div className="space-y-6 animate-fadeInUp">
            {isDeleteModalOpen && clientToDelete &&
                <DeleteConfirmationModal
                    client={clientToDelete}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                    hasServices={clientHasServices(clientToDelete.id)}
                />
            }

            {isFormVisible ? (
                <ClientFormView
                    editingClient={editingClient}
                    onClose={handleCloseForm}
                    onSave={handleSave}
                />
            ) : selectedClient ? (
                <ClientDetailsView
                    client={selectedClient}
                    onClose={handleCloseDetails}
                    onEdit={handleOpenForm}
                />
            ) : (
                 <>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clientes</h1>
                            <p className="text-gray-600 dark:text-brand-text-dark mt-1">Busca y gestiona la información de tus clientes.</p>
                        </div>
                        {hasPermission('clients', 'edit') && (
                            <button
                                onClick={() => handleOpenForm(null)}
                                className="bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors self-start md:self-auto"
                            >
                                Añadir Nuevo Cliente
                            </button>
                        )}
                    </div>

                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, documento o WhatsApp..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-1/2 lg:w-1/3 bg-white dark:bg-brand-bg-light border border-gray-300 dark:border-gray-700 rounded-md p-2.5 text-gray-900 dark:text-brand-text focus:ring-brand-orange focus:border-brand-orange transition-colors"
                        />
                    </div>

                    <div className="bg-brand-orange/10 dark:bg-brand-bg-light rounded-lg shadow-lg border border-brand-orange/30 dark:border-gray-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-brand-orange/20 dark:divide-gray-700">
                                <thead className="bg-black/5 dark:bg-gray-800/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Nombre</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Contacto</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Dirección</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="dark:bg-brand-bg-light divide-y divide-brand-orange/20 dark:divide-gray-700">
                                    {currentClients.length > 0 ? (
                                        currentClients.map((client, index) => (
                                            <tr key={client.id} className="hover:bg-brand-orange/20 dark:hover:bg-gray-800/40 transition-colors animate-fadeInUp" style={{ animationDelay: `${Math.min(index * 50, 500)}ms`}}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-brand-text">{`${client.firstName} ${client.lastName}`}</div>
                                                    <div className="text-sm text-gray-600 dark:text-brand-text-dark">{client.taxId || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-brand-text-dark">
                                                    <div>{client.whatsapp || 'N/A'}</div>
                                                    <div>{client.email || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-brand-text-dark">{client.address}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                                    <div className="flex items-center space-x-4">
                                                        <button onClick={() => handleViewDetails(client)} className="text-blue-500 hover:text-blue-400 transition-colors">
                                                            <EyeIcon className="w-5 h-5" />
                                                        </button>
                                                        {hasPermission('clients', 'edit') && (
                                                            <button onClick={() => handleOpenForm(client)} className="text-brand-orange hover:text-orange-400 transition-colors">
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 px-6 text-gray-600 dark:text-brand-text-dark">
                                                No se encontraron clientes que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {pageCount > 1 && (
                            <div className="px-6 py-4 flex items-center justify-between border-t border-brand-orange/20 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-brand-text-dark">
                                    Página {currentPage} de {pageCount} ({filteredClients.length} resultados)
                                </span>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-md bg-gray-200 dark:bg-brand-bg-dark text-sm font-semibold text-gray-800 dark:text-brand-text enabled:hover:bg-gray-300 dark:enabled:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === pageCount}
                                        className="px-3 py-1 rounded-md bg-gray-200 dark:bg-brand-bg-dark text-sm font-semibold text-gray-800 dark:text-brand-text enabled:hover:bg-gray-300 dark:enabled:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Clients;
