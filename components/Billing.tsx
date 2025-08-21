import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Invoice, ServiceOrder, InvoiceStatus, ServiceStatus } from '../types';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS_ES, INVOICE_STATUSES } from '../constants';
import { EyeIcon, CloseIcon, SaveIcon } from './ui/icons';

declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
    }
}

const NewInvoiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    serviceToBill: ServiceOrder | null;
}> = ({ isOpen, onClose, serviceToBill }) => {
    const { addInvoice } = useData();
    const [laborCost, setLaborCost] = useState(0);

    const partsTotal = useMemo(() =>
        serviceToBill?.partsUsed?.reduce((sum, part) => sum + part.price, 0) || 0,
        [serviceToBill]
    );

    const subtotal = laborCost + partsTotal;
    const taxAmount = subtotal * 0.16;
    const totalAmount = subtotal + taxAmount;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceToBill || laborCost < 0) {
            alert("El costo de la mano de obra no puede ser negativo.");
            return;
        };

        addInvoice({
            serviceOrder: serviceToBill,
            issueDate: new Date().toISOString(),
            status: InvoiceStatus.UNPAID,
            laborCost,
            partsTotal,
            subtotal,
            taxAmount,
            totalAmount,
        });
        onClose();
    };
    
    useEffect(() => {
        if(isOpen) {
            setLaborCost(0);
        }
    }, [isOpen]);

    if (!isOpen || !serviceToBill) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <form onSubmit={handleFormSubmit} className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-5xl max-h-[95vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Crear Nueva Factura</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-grow space-y-8">
                    {/* Client and Service Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-brand-text-dark uppercase tracking-wider text-sm mb-2">Facturar a:</h4>
                            <p className="font-bold text-lg text-white">{`${serviceToBill.client.firstName} ${serviceToBill.client.lastName}`}</p>
                            <p className="text-sm text-brand-text-dark">{serviceToBill.client.taxId || 'Sin RIF/Cédula'}</p>
                            <p className="text-sm text-brand-text-dark">{serviceToBill.client.address || 'Sin Dirección'}</p>
                        </div>
                        <div className="text-left md:text-right">
                             <h4 className="font-bold text-brand-text-dark uppercase tracking-wider text-sm mb-2">Servicio Asociado:</h4>
                            <p className="font-bold text-lg text-white">#{serviceToBill.id}</p>
                            <p className="text-sm text-brand-text">{serviceToBill.applianceName}</p>
                            <p className="text-xs text-brand-text-dark">Finalizado: {new Date(serviceToBill.updatedAt).toLocaleDateString('es-ES')}</p>
                        </div>
                    </div>
                    
                    {/* Invoice Items Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-700">
                        <table className="min-w-full text-sm">
                            <thead className="text-left text-brand-text-dark bg-gray-800/50">
                                <tr>
                                    <th className="p-3 font-semibold">Descripción</th>
                                    <th className="p-3 font-semibold text-right">Precio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {serviceToBill.partsUsed && serviceToBill.partsUsed.map(part => (
                                     <tr key={part.id}>
                                        <td className="p-3">{part.name} <span className="text-xs text-brand-text-dark font-mono">({part.sku})</span></td>
                                        <td className="p-3 text-right font-mono">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(part.price)}</td>
                                     </tr>
                                ))}
                                <tr>
                                    <td className="p-3 align-top">
                                        <label htmlFor="laborCost" className="font-semibold text-brand-text">Mano de Obra</label>
                                        <p className="text-xs text-brand-text-dark">Costo total por el servicio técnico.</p>
                                    </td>
                                    <td className="p-3 text-right">
                                        <input 
                                            type="number" 
                                            id="laborCost" 
                                            value={laborCost}
                                            onChange={e => setLaborCost(Number(e.target.value) || 0)}
                                            className="w-32 bg-brand-bg-dark border border-gray-600 rounded-md p-2 text-right text-brand-text focus:ring-brand-orange focus:border-brand-orange"
                                            required
                                            min="0"
                                            step="any"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-2">
                             <div className="flex justify-between items-center text-brand-text-dark">
                                <span>Subtotal:</span>
                                <span className="font-mono">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(subtotal)}</span>
                            </div>
                             <div className="flex justify-between items-center text-brand-text-dark">
                                <span>IVA (16%):</span>
                                <span className="font-mono">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(taxAmount)}</span>
                            </div>
                             <div className="flex justify-between items-center text-white text-2xl font-bold pt-2 mt-2 border-t-2 border-brand-orange/50">
                                <span>Total:</span>
                                <span className="text-brand-orange font-mono">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-700 flex justify-end space-x-4 flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
                    <button type="submit" className="bg-brand-orange text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">Generar Factura</button>
                </div>
            </form>
        </div>
    );
};

const InvoiceDetailsView: React.FC<{
    invoice: Invoice;
    onClose: () => void;
}> = ({ invoice, onClose }) => {
    const { updateInvoice, companyInfo } = useData();
    const { hasPermission } = useAuth();
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const [newStatus, setNewStatus] = useState(invoice.status);

    useEffect(() => {
        setNewStatus(invoice.status);
        setIsEditingStatus(false);
    }, [invoice]);

    const handleSaveStatus = () => {
        updateInvoice(invoice.id, { status: newStatus });
        setIsEditingStatus(false);
    };

    const handleDownloadPdf = async () => {
        if (!invoice || !printRef.current) return;
        setIsPrinting(true);
        
        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;

        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#0D0D0D' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps= pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Factura-${invoice.id}.pdf`);
        } catch (error) {
            console.error("Error al generar el PDF:", error);
            alert("Hubo un error al generar el PDF.");
        } finally {
            setIsPrinting(false);
        }
    };

    const LineItem: React.FC<{ description: string; amount: number; isSub?: boolean }> = ({ description, amount, isSub=false }) => (
        <div className={`flex justify-between items-center py-2 ${!isSub ? 'border-b border-gray-700' : ''}`}>
            <span className={isSub ? 'text-sm' : ''}>{description}</span>
            <span className={`font-mono ${isSub ? 'text-sm' : ''}`}>{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount)}</span>
        </div>
    );
    
    const isHistorical = !invoice.serviceOrder;

    return (
        <div className="bg-brand-orange/10 dark:bg-brand-bg-light rounded-lg shadow-lg border border-brand-orange/30 dark:border-gray-700/50 animate-fadeInUp">
            <div className="px-6 py-4 border-b border-brand-orange/20 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detalles de Factura: {invoice.id}</h2>
                <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">
                    Volver a la lista
                </button>
            </div>
            
            <div className="p-4 sm:p-8">
                <div ref={printRef} className="bg-brand-bg-dark p-8 rounded-lg text-brand-text">
                    <header className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-gray-600 gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-white">{companyInfo.name}</h3>
                            <p className="text-sm text-brand-text-dark">RIF: {companyInfo.taxId}</p>
                            <p className="text-sm text-brand-text-dark">{companyInfo.address}</p>
                            <p className="text-sm text-brand-text-dark">{companyInfo.email} | {companyInfo.phone}</p>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                            <h2 className="text-3xl font-bold text-brand-orange uppercase">Factura</h2>
                            <p className="text-lg text-white font-mono">{invoice.id}</p>
                            <p className="text-sm text-brand-text-dark mt-2">Fecha: {new Date(invoice.issueDate).toLocaleDateString('es-ES')}</p>
                        </div>
                    </header>

                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-6">
                        <div>
                            <h4 className="font-bold text-brand-text-dark uppercase tracking-wider text-sm mb-2">Facturar a:</h4>
                            <p className="font-bold text-lg text-white">{isHistorical ? invoice.clientName : `${invoice.serviceOrder.client.firstName} ${invoice.serviceOrder.client.lastName}`}</p>
                            {!isHistorical && <p className="text-sm">{invoice.serviceOrder.client.taxId || 'N/A'}</p>}
                            {!isHistorical && <p className="text-sm">{invoice.serviceOrder.client.address}</p>}
                            {!isHistorical && <p className="text-sm">{invoice.serviceOrder.client.email}</p>}
                        </div>
                        <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                            <h4 className="font-bold text-brand-text-dark uppercase tracking-wider text-sm mb-2">Total a Pagar:</h4>
                            <p className="text-4xl font-bold text-brand-orange">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(invoice.totalAmount)}</p>
                            <span className={`mt-2 px-3 py-1 text-sm font-semibold rounded-full ${INVOICE_STATUS_COLORS[invoice.status]}`}>{INVOICE_STATUS_LABELS_ES[invoice.status]}</span>
                        </div>
                    </section>

                    <section>
                        <h4 className="font-bold text-brand-text-dark uppercase tracking-wider text-sm mb-2">Descripción del Servicio:</h4>
                        <div className="bg-brand-bg-light p-4 rounded-lg border border-gray-700">
                            {isHistorical ? (
                                <p>{invoice.applianceDescription}</p>
                            ) : (
                                <>
                                    <p><strong>Artefacto:</strong> {invoice.serviceOrder.applianceName} ({invoice.serviceOrder.applianceType})</p>
                                    <p><strong>Reporte Cliente:</strong> {invoice.serviceOrder.clientDescription}</p>
                                </>
                            )}
                        </div>
                    </section>

                    {!isHistorical ? (
                        <>
                        <section className="mt-6">
                            <table className="w-full text-sm">
                                <thead className="border-b-2 border-gray-600 text-brand-text-dark">
                                    <tr>
                                        <th className="text-left font-semibold uppercase py-2">Descripción</th>
                                        <th className="text-right font-semibold uppercase py-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-700">
                                        <td className="py-3">Mano de Obra</td>
                                        <td className="text-right font-mono">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(invoice.laborCost)}</td>
                                    </tr>
                                    {invoice.serviceOrder.partsUsed && invoice.serviceOrder.partsUsed.length > 0 && (
                                        <tr className="border-b border-gray-700">
                                            <td className="py-3">
                                                <p>Repuestos Utilizados:</p>
                                                <ul className="list-disc pl-5 mt-1 text-xs text-brand-text-dark">
                                                    {invoice.serviceOrder.partsUsed.map(p => <li key={p.id}>{p.name}</li>)}
                                                </ul>
                                            </td>
                                            <td className="text-right align-top pt-3 font-mono">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(invoice.partsTotal)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </section>
                        <section className="flex justify-end mt-6">
                            <div className="w-full max-w-xs text-sm">
                                <LineItem description="Subtotal" amount={invoice.subtotal} />
                                <LineItem description="IVA (16%)" amount={invoice.taxAmount} />
                                <div className="flex justify-between items-center py-2 mt-2 border-t-2 border-gray-600">
                                    <span className="text-base font-bold uppercase">Total</span>
                                    <span className="text-base font-bold font-mono">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(invoice.totalAmount)}</span>
                                </div>
                            </div>
                        </section>
                        </>
                    ) : (
                         <section className="flex justify-end mt-6">
                            <div className="w-full max-w-xs text-sm">
                                <div className="flex justify-between items-center py-2 mt-2 border-t-2 border-gray-600">
                                    <span className="text-base font-bold uppercase">Total</span>
                                    <span className="text-base font-bold font-mono">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(invoice.totalAmount)}</span>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-orange/20 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto flex items-center gap-2 justify-center sm:justify-start">
                    {hasPermission('billing', 'edit') && (
                        <>
                        {!isEditingStatus ? (
                            <button onClick={() => setIsEditingStatus(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-500">Cambiar Estado</button>
                        ) : (
                            <div className="flex items-center gap-2 w-full justify-center">
                                <select value={newStatus} onChange={e => setNewStatus(e.target.value as InvoiceStatus)} className="bg-brand-bg-dark border border-gray-600 rounded-md p-2 text-sm text-brand-text focus:ring-brand-orange focus:border-brand-orange flex-grow sm:flex-grow-0">
                                    {INVOICE_STATUSES.map(s => <option key={s} value={s}>{INVOICE_STATUS_LABELS_ES[s]}</option>)}
                                </select>
                                <button onClick={handleSaveStatus} className="bg-green-600 text-white p-2 rounded-md font-semibold hover:bg-green-500"><SaveIcon className="h-5 w-5"/></button>
                                <button onClick={() => setIsEditingStatus(false)} className="bg-gray-600 text-white p-2 rounded-md font-semibold hover:bg-gray-500"><CloseIcon className="h-5 w-5"/></button>
                            </div>
                        )}
                        </>
                    )}
                </div>
                <div className="w-full sm:w-auto flex items-center justify-center sm:justify-end space-x-3">
                    <button onClick={handleDownloadPdf} disabled={isPrinting} className="bg-gray-200 text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-wait">
                    {isPrinting ? 'Generando PDF...' : 'Descargar PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const SelectServiceToBillModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelectService: (service: ServiceOrder) => void;
}> = ({ isOpen, onClose, onSelectService }) => {
    const { services, invoices } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const billableServices = useMemo(() => {
        const invoicedServiceIds = new Set(invoices.map(inv => inv.serviceOrder?.id));
        const completedUnbilled = services.filter(s => 
            s.status === ServiceStatus.COMPLETED && 
            !invoicedServiceIds.has(s.id)
        );
        
        if (!searchTerm.trim()) {
            return completedUnbilled;
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        return completedUnbilled.filter(s => 
            s.id.toLowerCase().includes(lowercasedTerm) ||
            s.applianceName.toLowerCase().includes(lowercasedTerm) ||
            `${s.client.firstName} ${s.client.lastName}`.toLowerCase().includes(lowercasedTerm)
        );

    }, [services, invoices, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Seleccionar Servicio para Facturar</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 flex-grow flex flex-col gap-4 min-h-0">
                    <input 
                        type="text"
                        placeholder="Buscar por ID, artefacto o cliente..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2.5 text-brand-text focus:ring-brand-orange focus:border-brand-orange"
                    />
                    <div className="overflow-y-auto flex-grow">
                        {billableServices.length > 0 ? (
                            <ul className="space-y-2">
                                {billableServices.map(service => (
                                    <li key={service.id}>
                                        <button 
                                            onClick={() => onSelectService(service)}
                                            className="w-full text-left p-3 bg-brand-bg-dark/50 rounded-lg hover:bg-brand-orange/20 transition-colors flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-semibold text-brand-text">#{service.id} - {service.applianceName}</p>
                                                <p className="text-sm text-brand-text-dark">{service.client.firstName} {service.client.lastName}</p>
                                            </div>
                                            <div className="text-xs text-brand-text-dark">
                                                Completado: {new Date(service.updatedAt).toLocaleDateString('es-ES')}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-lg text-brand-text-dark">No hay servicios completados pendientes de facturación.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

const Billing: React.FC = () => {
  const { invoices, services } = useData();
  const { hasPermission } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isSelectServiceModalOpen, setIsSelectServiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  const [serviceToBill, setServiceToBill] = useState<ServiceOrder | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedInvoice) {
      const updatedInvoice = invoices.find(i => i.id === selectedInvoice.id);
      if (updatedInvoice) {
        setSelectedInvoice(updatedInvoice);
      } else {
        // Invoice might have been deleted
        setSelectedInvoice(null);
      }
    }
  }, [invoices]);

  useEffect(() => {
    const action = searchParams.get('action');
    const serviceId = searchParams.get('serviceId');

    if (action === 'create' && serviceId) {
        const service = services.find(s => s.id === serviceId);
        const existingInvoice = invoices.find(inv => inv.serviceOrder?.id === serviceId);

        if (service && !existingInvoice && hasPermission('billing', 'edit')) {
            setServiceToBill(service);
            setIsNewInvoiceModalOpen(true);
        }
        navigate('/billing', { replace: true });
    }
  }, [searchParams, navigate, services, invoices, hasPermission]);


  const filteredInvoices = useMemo(() => {
    const sortedInvoices = [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    if (!searchTerm.trim()) {
      return sortedInvoices;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return sortedInvoices.filter(invoice =>
      invoice.id.toLowerCase().includes(lowercasedFilter) ||
      (invoice.clientName && invoice.clientName.toLowerCase().includes(lowercasedFilter)) ||
      (invoice.serviceOrder && `${invoice.serviceOrder.client.firstName} ${invoice.serviceOrder.client.lastName}`.toLowerCase().includes(lowercasedFilter)) ||
      (invoice.serviceOrder && invoice.serviceOrder.id.toLowerCase().includes(lowercasedFilter))
    );
  }, [invoices, searchTerm]);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const pageCount = Math.ceil(filteredInvoices.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
      if (pageNumber < 1 || pageNumber > pageCount) return;
      setCurrentPage(pageNumber);
  };

  const handleOpenDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleCloseDetails = () => {
    setSelectedInvoice(null);
  };
  
  const handleCloseNewInvoiceModal = () => {
    setServiceToBill(null);
    setIsNewInvoiceModalOpen(false);
  }

  const handleSelectService = (service: ServiceOrder) => {
    setServiceToBill(service);
    setIsSelectServiceModalOpen(false);
    setIsNewInvoiceModalOpen(true);
  };

  const canEditBilling = hasPermission('billing', 'edit');

  return (
    <div className="space-y-6 animate-fadeInUp">
        {canEditBilling && (
            <>
                <NewInvoiceModal 
                    isOpen={isNewInvoiceModalOpen}
                    onClose={handleCloseNewInvoiceModal}
                    serviceToBill={serviceToBill}
                />
                <SelectServiceToBillModal
                    isOpen={isSelectServiceModalOpen}
                    onClose={() => setIsSelectServiceModalOpen(false)}
                    onSelectService={handleSelectService}
                />
            </>
        )}

        {selectedInvoice ? (
            <InvoiceDetailsView 
                invoice={selectedInvoice}
                onClose={handleCloseDetails}
            />
        ) : (
            <>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Facturación</h1>
                        <p className="text-gray-600 dark:text-brand-text-dark mt-1">Gestiona y consulta todas las facturas.</p>
                    </div>
                    {canEditBilling && (
                        <button 
                        onClick={() => setIsSelectServiceModalOpen(true)}
                        className="bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors self-start md:self-center"
                        >
                        Crear Nueva Factura
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <input 
                        type="text"
                        placeholder="Buscar por # Factura, Cliente, o # Servicio..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/2 lg:w-1/3 bg-white dark:bg-brand-bg-light border border-gray-300 dark:border-gray-700 rounded-md p-2.5 text-gray-900 dark:text-brand-text focus:ring-brand-orange focus:border-brand-orange"
                    />
                    
                    <div className="bg-brand-orange/10 dark:bg-brand-bg-light rounded-lg shadow-lg border border-brand-orange/30 dark:border-gray-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-brand-orange/20 dark:divide-gray-700">
                                <thead className="bg-black/5 dark:bg-gray-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Factura #</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Cliente</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Fecha de Emisión</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Total</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Acciones</th>
                                </tr>
                                </thead>
                                <tbody className="dark:bg-brand-bg-light divide-y divide-brand-orange/20 dark:divide-gray-700">
                                {currentInvoices.map((invoice, index) => (
                                    <tr key={invoice.id} className="hover:bg-brand-orange/20 dark:hover:bg-gray-800/40 transition-colors animate-fadeInUp" style={{ animationDelay: `${Math.min(index * 50, 500)}ms`}}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-brand-text">{invoice.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-brand-text">{invoice.clientName || `${invoice.serviceOrder?.client.firstName} ${invoice.serviceOrder?.client.lastName}`}</div>
                                            <div className="text-xs text-gray-600 dark:text-brand-text-dark">{invoice.serviceOrder ? `Servicio: ${invoice.serviceOrder.id}` : 'Servicio: Histórico'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-brand-text-dark">{new Date(invoice.issueDate).toLocaleDateString('es-ES')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-brand-text-dark">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(invoice.totalAmount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                                                {INVOICE_STATUS_LABELS_ES[invoice.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                            <button onClick={() => handleOpenDetails(invoice)} className="text-brand-orange hover:text-orange-400 transition-colors">
                                                <EyeIcon className="w-5 h-5"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {filteredInvoices.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-sm text-gray-600 dark:text-brand-text-dark">No se encontraron facturas con ese criterio.</p>
                                </div>
                            )}
                        </div>
                        {pageCount > 1 && (
                                <div className="px-6 py-4 flex items-center justify-between border-t border-brand-orange/20 dark:border-gray-700">
                                    <span className="text-sm text-gray-600 dark:text-brand-text-dark">
                                        Página {currentPage} de {pageCount} ({filteredInvoices.length} resultados)
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
                </div>
            </>
        )}
    </div>
  );
};

export default Billing;