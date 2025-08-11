
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceOrder, UserRole, ServiceStatus, InventoryItem, Client, User } from '../types';
import { STATUS_COLORS, STATUS_LABELS_ES, SERVICE_STATUSES } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { CloseIcon, WhatsAppIcon, EditIcon, SaveIcon, PlusCircleIcon, TrashIcon } from './ui/icons';

const ServiceCard: React.FC<{ service: ServiceOrder; onDetailsClick: () => void }> = ({ service, onDetailsClick }) => {
  const statusColorClass = STATUS_COLORS[service.status].split(' ')[0].replace('bg-', 'border-');

  return (
    <button 
      onClick={onDetailsClick} 
      className={`
        w-full text-left bg-brand-bg-light border-l-4 ${statusColorClass} 
        p-4 rounded-lg shadow-lg hover:shadow-brand-orange/20 
        transform hover:-translate-y-1 transition-all duration-300 
        cursor-pointer group space-y-3 animate-fadeInUp
      `}
      style={{ animationDelay: `${Math.random() * 0.2}s` }}
    >
      <div className="flex justify-between items-start gap-4">
        <h3 className="font-bold text-brand-text group-hover:text-brand-orange transition-colors duration-300 flex items-baseline min-w-0">
          <span className="font-mono text-xs text-brand-text-dark/80 mr-2 shrink-0">#{service.id}</span>
          <span className="truncate">{service.applianceName}</span>
        </h3>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[service.status]} transition-opacity duration-300 shrink-0`}>
          {STATUS_LABELS_ES[service.status]}
        </span>
      </div>
      <div>
        <p className="text-sm text-brand-text-dark">{`${service.client.firstName} ${service.client.lastName}`}</p>
        <p className="text-xs text-gray-500">{service.applianceType}</p>
      </div>
      <div className="text-xs text-brand-text-dark pt-2 border-t border-gray-700/50">
        <p><strong>Técnico:</strong> {service.technician ? `${service.technician.firstName} ${service.technician.lastName}`: 'Sin Asignar'}</p>
        <p><strong>Ingreso:</strong> {new Date(service.createdAt).toLocaleDateString('es-ES')}</p>
      </div>
    </button>
  );
};

const DetailsModalContent: React.FC<{ serviceId: string, onClose: () => void }> = ({ serviceId, onClose }) => {
    const { services, inventory, updateService, updateInventoryItem, invoices, users } = useData();
    const { hasPermission } = useAuth();
    const navigate = useNavigate();
    const technicians = users.filter(u => u.role === UserRole.TECHNICIAN);
    
    const currentService = services.find(s => s.id === serviceId);

    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState(currentService?.status);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [newNotes, setNewNotes] = useState(currentService?.technicianNotes);
    const [isAddingPart, setIsAddingPart] = useState(false);
    const [partSearch, setPartSearch] = useState('');
    const [isEditingTechnician, setIsEditingTechnician] = useState(false);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(currentService?.technician?.id || '');

    const canEditService = hasPermission('services', 'edit');

    useEffect(() => {
        if (currentService) {
            setNewStatus(currentService.status);
            setNewNotes(currentService.technicianNotes);
            setSelectedTechnicianId(currentService.technician?.id || '');
        }
    }, [currentService]);

    if (!currentService) {
      useEffect(() => {
        onClose();
      }, [onClose]);
      return null;
    }

    const handleSaveStatus = () => {
        if(newStatus) {
            updateService(currentService.id, { status: newStatus });
            setIsEditingStatus(false);
        }
    };

    const handleSaveNotes = () => {
        if(newNotes !== undefined) {
            updateService(currentService.id, { technicianNotes: newNotes });
            setIsEditingNotes(false);
        }
    };
    
    const handleSaveTechnician = () => {
        const technicianToAssign = technicians.find(t => t.id === selectedTechnicianId);
        updateService(currentService.id, { technician: technicianToAssign });
        setIsEditingTechnician(false);
    };

    const handleAddPart = (part: InventoryItem) => {
        if (part.quantity > 0) {
            const updatedParts = [...(currentService.partsUsed || []), part];
            updateService(currentService.id, { partsUsed: updatedParts });
            updateInventoryItem(part.id, { quantity: part.quantity - 1 });
        } else {
            alert('Este repuesto no tiene stock disponible.');
        }
    };

    const handleRemovePart = (partToRemove: InventoryItem) => {
        const updatedParts = currentService.partsUsed?.filter(p => p.id !== partToRemove.id);
        const currentPartState = inventory.find(p => p.id === partToRemove.id);
        if (currentPartState) {
            updateService(currentService.id, { partsUsed: updatedParts });
            updateInventoryItem(partToRemove.id, { quantity: currentPartState.quantity + 1 });
        }
    };

    const availableParts = useMemo(() => {
        const usedPartIds = new Set(currentService.partsUsed?.map(p => p.id));
        return inventory.filter(p => 
            p.quantity > 0 && 
            !usedPartIds.has(p.id) &&
            (p.name.toLowerCase().includes(partSearch.toLowerCase()) || p.sku.toLowerCase().includes(partSearch.toLowerCase()))
        );
    }, [inventory, currentService.partsUsed, partSearch]);

    const handleBillService = () => {
        navigate(`/billing?action=create&serviceId=${currentService.id}`);
        onClose();
    };

    const isCompleted = currentService.status === ServiceStatus.COMPLETED;
    const existingInvoice = invoices.find(inv => inv.serviceOrder.id === currentService.id);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Detalles del Servicio #{currentService.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"> <CloseIcon className="h-6 w-6" /> </button>
                </div>
                
                {/* Body */}
                <div className="p-6 overflow-y-auto flex-grow space-y-6">
                    {/* Status */}
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-brand-orange">Estado</h3>
                        {!isEditingStatus ? (
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-sm leading-5 font-semibold rounded-full ${STATUS_COLORS[currentService.status]}`}>{STATUS_LABELS_ES[currentService.status]}</span>
                                {canEditService && <button onClick={() => setIsEditingStatus(true)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"><EditIcon className="h-4 w-4" /></button>}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <select value={newStatus} onChange={e => setNewStatus(e.target.value as ServiceStatus)} className="bg-brand-bg-dark border border-gray-600 rounded-md py-1 px-2 text-sm text-brand-text focus:ring-brand-orange focus:border-brand-orange">
                                    {SERVICE_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS_ES[s]}</option>)}
                                </select>
                                <button onClick={handleSaveStatus} className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-green-500">Guardar</button>
                                <button onClick={() => setIsEditingStatus(false)} className="bg-gray-600 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-gray-500">Cancelar</button>
                            </div>
                        )}
                    </div>
                    
                    {/* Client & Appliance Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Client Info */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-brand-orange border-b border-brand-orange/30 pb-2 flex justify-between items-center">
                                <span>Cliente</span>
                                {currentService.client.whatsapp && <a href={`https://wa.me/${currentService.client.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md font-semibold hover:bg-green-500 transition-colors text-xs"><WhatsAppIcon className="h-4 w-4" /><span>Contactar</span></a>}
                            </h3>
                            <p><strong className="text-brand-text-dark">Nombre:</strong> {`${currentService.client.firstName} ${currentService.client.lastName}`}</p>
                            <p><strong className="text-brand-text-dark">Email:</strong> {currentService.client.email || 'No tiene'}</p>
                        </div>
                        {/* Appliance Info */}
                        <div className="space-y-2">
                             <h3 className="text-lg font-bold text-brand-orange border-b border-brand-orange/30 pb-2">Artefacto</h3>
                            <p><strong className="text-brand-text-dark">Tipo:</strong> {currentService.applianceName}</p>
                            <p><strong className="text-brand-text-dark">Marca/Modelo:</strong> {currentService.applianceType}</p>
                        </div>
                    </div>

                     {/* Technician Assignment */}
                    <div className="space-y-2 pt-4 border-t border-gray-700/50">
                        <div className="flex items-center gap-4">
                           <h3 className="text-lg font-bold text-brand-orange">Técnico Asignado</h3>
                           {!isEditingTechnician ? (
                                <div className="flex items-center gap-2">
                                    <p className="text-brand-text">
                                        {currentService.technician ? `${currentService.technician.firstName} ${currentService.technician.lastName}` : 'Sin asignar'}
                                    </p>
                                    {canEditService && <button onClick={() => setIsEditingTechnician(true)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"><EditIcon className="h-4 w-4" /></button>}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <select 
                                        value={selectedTechnicianId} 
                                        onChange={e => setSelectedTechnicianId(e.target.value)} 
                                        className="bg-brand-bg-dark border border-gray-600 rounded-md py-1 px-2 text-sm text-brand-text focus:ring-brand-orange focus:border-brand-orange"
                                    >
                                        <option value="">-- Sin Asignar --</option>
                                        {technicians.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                                    </select>
                                    <button onClick={handleSaveTechnician} className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-green-500">Guardar</button>
                                    <button onClick={() => setIsEditingTechnician(false)} className="bg-gray-600 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-gray-500">Cancelar</button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Notes */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-brand-orange border-b border-brand-orange/30 pb-2">Diagnóstico y Notas</h3>
                        <div>
                            <h4 className="font-semibold text-brand-text">Descripción del Cliente</h4>
                            <p className="text-brand-text-dark bg-brand-bg-dark/50 p-3 rounded-md whitespace-pre-wrap mt-1">{currentService.clientDescription}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-brand-text">Notas del Técnico</h4>
                                {!isEditingNotes ? (
                                    <>
                                    {canEditService && <button onClick={() => setIsEditingNotes(true)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"><EditIcon className="h-4 w-4" /></button>}
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleSaveNotes} className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold hover:bg-green-500"><SaveIcon className="h-3 w-3" /> Guardar</button>
                                        <button onClick={() => setIsEditingNotes(false)} className="flex items-center bg-gray-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold hover:bg-gray-500">Cancelar</button>
                                    </div>
                                )}
                            </div>
                            {isEditingNotes ? (
                                <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} rows={4} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange"></textarea>
                            ) : (
                                <p className="text-brand-text-dark bg-brand-bg-dark/50 p-3 rounded-md whitespace-pre-wrap min-h-[6rem]">{currentService.technicianNotes || 'Sin notas.'}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Parts */}
                    <div className="space-y-2">
                         <div className="flex items-center gap-4">
                             <h3 className="text-lg font-bold text-brand-orange border-b border-brand-orange/30 pb-2">Repuestos Utilizados</h3>
                             {canEditService && <button onClick={() => setIsAddingPart(true)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md font-semibold hover:bg-blue-500 text-xs transition-colors"><PlusCircleIcon className="h-4 w-4" />Añadir Repuesto</button>}
                         </div>
                         {isAddingPart && (
                            <div className="p-3 bg-brand-bg-dark/50 rounded-lg space-y-2">
                                <input type="text" placeholder="Buscar repuesto por nombre o SKU..." value={partSearch} onChange={e => setPartSearch(e.target.value)} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 mb-2 focus:ring-brand-orange focus:border-brand-orange"/>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                    {availableParts.map(part => (
                                        <div key={part.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-md">
                                            <div>
                                                <p className="text-sm font-medium">{part.name}</p>
                                                <p className="text-xs text-brand-text-dark">Stock: {part.quantity} - {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(part.price)}</p>
                                            </div>
                                            <button onClick={() => handleAddPart(part)} className="bg-green-600 text-white p-1 rounded-full hover:bg-green-500"><PlusCircleIcon className="h-5 w-5" /></button>
                                        </div>
                                    ))}
                                    {availableParts.length === 0 && <p className="text-center text-xs text-gray-400 p-2">No se encontraron repuestos o ya fueron añadidos.</p>}
                                </div>
                                <button onClick={() => { setIsAddingPart(false); setPartSearch(''); }} className="text-xs text-gray-400 hover:text-white mt-2">Cerrar búsqueda</button>
                            </div>
                         )}
                         <div className="overflow-x-auto rounded-lg border border-gray-700 mt-2">
                             <table className="min-w-full text-sm">
                                 <thead className="text-left text-brand-text-dark bg-gray-800/50"><tr><th className="p-3 font-semibold">Repuesto</th><th className="p-3 font-semibold">SKU</th><th className="p-3 font-semibold text-right">Precio</th><th className="p-3 font-semibold text-center">Acción</th></tr></thead>
                                 <tbody className="divide-y divide-gray-700">
                                     {currentService.partsUsed && currentService.partsUsed.length > 0 ? currentService.partsUsed.map(part => (
                                         <tr key={part.id}>
                                             <td className="p-3">{part.name}</td><td className="p-3 font-mono">{part.sku}</td>
                                             <td className="p-3 text-right">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(part.price)}</td>
                                             <td className="p-3 text-center">
                                                {canEditService ? (
                                                    <button onClick={() => handleRemovePart(part)} className="text-red-500 hover:text-red-400 p-1"><TrashIcon className="h-4 w-4" /></button>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                             </td>
                                         </tr>
                                     )) : (<tr><td colSpan={4} className="p-4 text-center text-brand-text-dark italic">No se han añadido repuestos.</td></tr>)}
                                 </tbody>
                             </table>
                         </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-700 flex justify-end items-center space-x-3">
                    {isCompleted && hasPermission('billing', 'edit') && (existingInvoice ? <button disabled className="bg-gray-500 text-white px-6 py-2 rounded-md font-semibold cursor-not-allowed">Facturado</button> : <button onClick={handleBillService} className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-500 transition-colors">Facturar</button>)}
                    <button type="button" onClick={onClose} className="bg-brand-orange text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

const FilterButton: React.FC<{
  status: ServiceStatus | 'ALL';
  label: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
}> = ({ status, label, isActive, onClick, count }) => {
  const baseClasses = "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2";
  const activeClasses = "bg-brand-orange text-white shadow-md";
  const inactiveClasses = "bg-brand-bg-light text-brand-text-dark hover:bg-gray-700 hover:text-white";

  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {label}
      <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-brand-bg-dark'}`}>
        {count}
      </span>
    </button>
  );
};

const NewOrderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { clients, addService, addClient } = useData();

  const initialNewServiceState = { clientId: '', applianceName: '', applianceType: '', clientDescription: '' };
  const [newServiceData, setNewServiceData] = useState(initialNewServiceState);

  const initialNewClientState: Omit<Client, 'id' | 'createdAt'> = { firstName: '', lastName: '', whatsapp: '', email: '', address: '' };
  const [newClientData, setNewClientData] = useState(initialNewClientState);
  
  const [isNewClientFormVisible, setIsNewClientFormVisible] = useState(false);

  // State for client search combobox
  const [clientQuery, setClientQuery] = useState('');
  const [isClientListVisible, setIsClientListVisible] = useState(false);
  const clientSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset all local state when the modal is closed
    if (!isOpen) {
      setNewServiceData(initialNewServiceState);
      setNewClientData(initialNewClientState);
      setIsNewClientFormVisible(false);
      setClientQuery('');
      setIsClientListVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Close dropdown when clicking outside of it
    const handleClickOutside = (event: MouseEvent) => {
        if (clientSearchRef.current && !clientSearchRef.current.contains(event.target as Node)) {
            setIsClientListVisible(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddNewClient = () => {
    if (!newClientData.firstName || !newClientData.lastName || !newClientData.whatsapp) {
      alert('Nombres, apellidos y WhatsApp son requeridos para el nuevo cliente.');
      return;
    }
    const newClient = addClient(newClientData);
    setNewServiceData(prev => ({ ...prev, clientId: newClient.id }));
    setNewClientData(initialNewClientState);
    setIsNewClientFormVisible(false);
  };
  
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === newServiceData.clientId);

    if (!client || !newServiceData.applianceName || !newServiceData.clientDescription) {
      alert('Por favor complete todos los campos requeridos, incluyendo la selección de un cliente.');
      return;
    }
    
    addService({
        client,
        applianceName: newServiceData.applianceName,
        applianceType: newServiceData.applianceType,
        clientDescription: newServiceData.clientDescription,
        technicianNotes: 'Pendiente de revisión inicial.',
        status: ServiceStatus.PENDING,
    });
    onClose();
  };

  const filteredClients = useMemo(() => {
      if (!clientQuery) return clients;
      const lowerQuery = clientQuery.toLowerCase();
      return clients.filter(c => 
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(lowerQuery) ||
          c.whatsapp.includes(lowerQuery)
      );
  }, [clients, clientQuery]);

  const selectedClient = clients.find(c => c.id === newServiceData.clientId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-brand-bg-light z-10 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Nueva Orden de Servicio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleCreateService} className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2 relative" ref={clientSearchRef}>
            <label htmlFor="client-search" className="block text-sm font-medium text-brand-text-dark">Cliente</label>
            <input
                id="client-search"
                type="text"
                placeholder="Buscar cliente por nombre o WhatsApp..."
                value={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : clientQuery}
                onChange={(e) => {
                    setClientQuery(e.target.value);
                    setNewServiceData(prev => ({...prev, clientId: ''})); // Clear selection on type
                    setIsClientListVisible(true);
                }}
                onFocus={() => setIsClientListVisible(true)}
                className="w-full bg-brand-bg-dark border border-gray-600 text-brand-text rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange"
                autoComplete="off"
                required={!newServiceData.clientId}
            />
            {isClientListVisible && (
                 <div className="absolute z-20 w-full mt-1 bg-brand-bg-dark border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                        {filteredClients.map(c => (
                            <li
                                key={c.id}
                                onMouseDown={() => {
                                    setNewServiceData(prev => ({ ...prev, clientId: c.id }));
                                    setClientQuery('');
                                    setIsClientListVisible(false);
                                    setIsNewClientFormVisible(false);
                                }}
                                className="px-4 py-2 text-brand-text hover:bg-brand-orange/20 cursor-pointer"
                            >
                                {c.firstName} {c.lastName} - {c.whatsapp}
                            </li>
                        ))}
                        {filteredClients.length === 0 && clientQuery && (
                            <li className="px-4 py-2 text-brand-text-dark italic">No se encontraron clientes.</li>
                        )}
                        <li
                            onMouseDown={() => {
                                setIsNewClientFormVisible(true);
                                setIsClientListVisible(false);
                                setNewServiceData(prev => ({...prev, clientId: ''}));
                                setClientQuery('');
                            }}
                            className="px-4 py-2 text-brand-orange font-semibold hover:bg-brand-orange/20 cursor-pointer border-t border-gray-600"
                        >
                            Añadir nuevo cliente...
                        </li>
                    </ul>
                </div>
            )}
          </div>

          {isNewClientFormVisible && (
            <div className="p-4 border border-dashed border-gray-600 rounded-lg space-y-4">
               <h3 className="font-semibold text-lg text-brand-orange">Nuevo Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nombres" value={newClientData.firstName} onChange={e => setNewClientData({...newClientData, firstName: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required/>
                <input type="text" placeholder="Apellidos" value={newClientData.lastName} onChange={e => setNewClientData({...newClientData, lastName: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required/>
                <input type="tel" placeholder="WhatsApp" value={newClientData.whatsapp} onChange={e => setNewClientData({...newClientData, whatsapp: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required/>
                <input type="email" placeholder="Email (Opcional)" value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" />
                <input type="text" placeholder="Dirección (Opcional)" value={newClientData.address} onChange={e => setNewClientData({...newClientData, address: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange col-span-2" />
              </div>
               <button type="button" onClick={handleAddNewClient} className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-green-500">Guardar Cliente</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="applianceName" className="block text-sm font-medium text-brand-text-dark">Nombre del Artefacto</label>
              <input type="text" id="applianceName" value={newServiceData.applianceName} onChange={e => setNewServiceData({...newServiceData, applianceName: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="applianceType" className="block text-sm font-medium text-brand-text-dark">Marca / Modelo</label>
              <input type="text" id="applianceType" value={newServiceData.applianceType} onChange={e => setNewServiceData({...newServiceData, applianceType: e.target.value})} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="clientDescription" className="block text-sm font-medium text-brand-text-dark">Descripción del Problema (Cliente)</label>
            <textarea id="clientDescription" value={newServiceData.clientDescription} onChange={e => setNewServiceData({...newServiceData, clientDescription: e.target.value})} rows={4} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required></textarea>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
            <button type="submit" className="bg-brand-orange text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">Crear Orden</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  const { services } = useData();
  const { hasPermission } = useAuth();
  
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  const [activeFilter, setActiveFilter] = useState<ServiceStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = useMemo(() => {
    let filtered = services;

    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(s => s.status === activeFilter);
    }

    if (searchTerm.trim() !== '') {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.applianceName.toLowerCase().includes(lowercasedTerm) ||
        `${s.client.firstName} ${s.client.lastName}`.toLowerCase().includes(lowercasedTerm) ||
        s.id.toLowerCase().includes(lowercasedTerm)
      );
    }
    return filtered.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [services, activeFilter, searchTerm]);

  const handleShowDetails = (service: ServiceOrder) => {
    setSelectedServiceId(service.id);
    setIsDetailsModalOpen(true);
  };
  
  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedServiceId(null);
  }

  const getStatusCount = (status: ServiceStatus | 'ALL') => {
    if (status === 'ALL') return services.length;
    return services.filter(s => s.status === status).length;
  }

  return (
    <div className="space-y-6">
      {hasPermission('services', 'edit') && <NewOrderModal isOpen={isNewOrderModalOpen} onClose={() => setIsNewOrderModalOpen(false)} />}
      {isDetailsModalOpen && selectedServiceId && <DetailsModalContent serviceId={selectedServiceId} onClose={handleCloseDetails} />}

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Órdenes de Servicio</h1>
          <p className="text-brand-text-dark mt-1">Filtra y gestiona las órdenes de trabajo.</p>
        </div>
        {hasPermission('services', 'edit') && (
        <button 
          onClick={() => setIsNewOrderModalOpen(true)}
          className="bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors self-start md:self-auto"
        >
          Nueva Orden de Servicio
        </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-brand-bg-dark/50 p-3 rounded-xl backdrop-blur-sm border border-gray-800 space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <FilterButton 
              status="ALL" 
              label="Todos"
              isActive={activeFilter === 'ALL'}
              onClick={() => setActiveFilter('ALL')}
              count={getStatusCount('ALL')}
            />
            {SERVICE_STATUSES.map(status => (
                <FilterButton 
                  key={status} 
                  status={status} 
                  label={STATUS_LABELS_ES[status]}
                  isActive={activeFilter === status}
                  onClick={() => setActiveFilter(status)}
                  count={getStatusCount(status)}
                />
            ))}
        </div>
        <div>
           <input
            type="text"
            placeholder="Buscar por artefacto, cliente, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-bg-light border border-gray-700 rounded-md p-2.5 text-brand-text focus:ring-brand-orange focus:border-brand-orange transition-colors"
          />
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredServices.map(service => (
          <ServiceCard key={service.id} service={service} onDetailsClick={() => handleShowDetails(service)} />
        ))}
      </div>
      
      {filteredServices.length === 0 && (
         <div className="text-center py-16">
            <p className="text-lg text-brand-text-dark">No se encontraron órdenes de servicio.</p>
            <p className="text-sm text-gray-500">Intenta cambiar los filtros o el término de búsqueda.</p>
        </div>
      )}

    </div>
  );
};

export default Services;
