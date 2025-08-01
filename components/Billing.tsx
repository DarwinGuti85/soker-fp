
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { Invoice, ServiceOrder, InvoiceStatus } from '../types';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS_ES, INVOICE_STATUSES } from '../constants';
import { EyeIcon, CloseIcon } from './ui/icons';

// Inform TypeScript that jsPDF and html2canvas will be available on the window object
declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
    }
}

const Billing: React.FC = () => {
  const { invoices, services, addInvoice, updateInvoice } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  const [serviceToBill, setServiceToBill] = useState<ServiceOrder | null>(null);
  const [laborCost, setLaborCost] = useState(0);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const action = searchParams.get('action');
    const serviceId = searchParams.get('serviceId');

    if (action === 'create' && serviceId) {
        const service = services.find(s => s.id === serviceId);
        const existingInvoice = invoices.find(inv => inv.serviceOrder.id === serviceId);

        if (service && !existingInvoice) {
            setServiceToBill(service);
            setLaborCost(150000); // Default labor cost
            setIsNewInvoiceModalOpen(true);
        }
        // Clean up URL params to prevent re-triggering
        navigate('/billing', { replace: true });
    }
  }, [searchParams, navigate, services, invoices]);


  const filteredInvoices = useMemo(() => {
    const sortedInvoices = [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    if (!searchTerm.trim()) {
      return sortedInvoices;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return sortedInvoices.filter(invoice =>
      invoice.id.toLowerCase().includes(lowercasedFilter) ||
      `${invoice.serviceOrder.client.firstName} ${invoice.serviceOrder.client.lastName}`.toLowerCase().includes(lowercasedFilter) ||
      invoice.serviceOrder.id.toLowerCase().includes(lowercasedFilter)
    );
  }, [invoices, searchTerm]);
  
  const handleOpenDetailsModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateInvoice = (updatedData: Partial<Invoice>) => {
    if (!selectedInvoice) return;
    updateInvoice(selectedInvoice.id, updatedData);
    setSelectedInvoice(prev => prev ? { ...prev, ...updatedData } : null);
  };

  const DetailItem: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
      <div className={className}>
        <h4 className="text-sm font-semibold text-brand-text-dark uppercase tracking-wider">{label}</h4>
        <div className="text-brand-text mt-1">{children}</div>
      </div>
  );

  const NewInvoiceModal = () => {
    if (!serviceToBill) return null;
    
    const partsSubtotal = useMemo(() => 
        serviceToBill.partsUsed?.reduce((sum, part) => sum + part.price, 0) || 0,
    [serviceToBill.partsUsed]);

    const grandTotal = partsSubtotal + laborCost;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        addInvoice({
            serviceOrder: serviceToBill,
            issueDate: new Date().toISOString(),
            totalAmount: grandTotal,
            status: InvoiceStatus.UNPAID,
        });

        setIsNewInvoiceModalOpen(false);
        setServiceToBill(null);
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <form onSubmit={handleFormSubmit} className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Crear Factura</h2>
                    <button type="button" onClick={() => setIsNewInvoiceModalOpen(false)} className="text-gray-400 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-grow space-y-6">
                    {/* Service & Client Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-brand-orange border-b border-brand-orange/30 pb-2">Servicio #{serviceToBill.id}</h3>
                            <DetailItem label="Artefacto">{serviceToBill.applianceName} ({serviceToBill.applianceType})</DetailItem>
                            <DetailItem label="Descripción del Problema">{serviceToBill.clientDescription}</DetailItem>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-brand-orange border-b border-brand-orange/30 pb-2">Cliente</h3>
                            <DetailItem label="Nombre">{`${serviceToBill.client.firstName} ${serviceToBill.client.lastName}`}</DetailItem>
                            <DetailItem label="Contacto">{serviceToBill.client.whatsapp}</DetailItem>
                        </div>
                    </div>
                    
                    {/* Technician Notes & Parts */}
                    <div className="pt-6 border-t border-gray-700 space-y-6">
                        <DetailItem label="Diagnóstico del Técnico">
                            <p className="text-brand-text-dark bg-brand-bg-dark/50 p-3 rounded-md whitespace-pre-wrap mt-1">
                                {serviceToBill.technicianNotes || 'No hay notas disponibles.'}
                            </p>
                        </DetailItem>
                        <div>
                           <h4 className="text-sm font-semibold text-brand-text-dark uppercase tracking-wider mb-2">Repuestos Utilizados</h4>
                            {serviceToBill.partsUsed && serviceToBill.partsUsed.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border border-gray-700">
                                    <table className="min-w-full text-sm">
                                        <thead className="text-left text-brand-text-dark bg-gray-800/50">
                                            <tr>
                                                <th className="p-3 font-semibold">Repuesto</th>
                                                <th className="p-3 font-semibold text-right">Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {serviceToBill.partsUsed.map((part) => (
                                                <tr key={part.id}>
                                                    <td className="p-3 text-brand-text">{part.name}</td>
                                                    <td className="p-3 text-brand-text-dark text-right">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(part.price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-brand-text-dark italic bg-brand-bg-dark/50 p-3 rounded-md">No se utilizaron repuestos.</p>
                            )}
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="pt-6 border-t border-gray-700 space-y-4">
                       <h3 className="text-lg font-bold text-brand-orange">Resumen de Costos</h3>
                       <div className="bg-brand-bg-dark/50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center text-brand-text-dark">
                                <span>Subtotal de Repuestos:</span>
                                <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(partsSubtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="laborCost" className="text-brand-text-dark">Costo de Mano de Obra / Servicio:</label>
                                <input 
                                    type="number" 
                                    id="laborCost" 
                                    value={laborCost}
                                    onChange={e => setLaborCost(Number(e.target.value) || 0)}
                                    className="w-48 bg-brand-bg-dark border border-gray-600 rounded-md p-2 text-right text-brand-text focus:ring-brand-orange focus:border-brand-orange"
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="flex justify-between items-center text-white text-xl font-bold pt-3 border-t border-gray-600">
                                <span>Gran Total:</span>
                                <span className="text-brand-orange">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(grandTotal)}</span>
                            </div>
                       </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-700 flex justify-end space-x-4">
                    <button type="button" onClick={() => setIsNewInvoiceModalOpen(false)} className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
                    <button type="submit" className="bg-brand-orange text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">Crear Factura</button>
                </div>
            </form>
        </div>
    );
  };
  
  const InvoiceDetailsModal = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
      totalAmount: selectedInvoice?.totalAmount || 0,
      status: selectedInvoice?.status || InvoiceStatus.UNPAID,
    });

    useEffect(() => {
        if (selectedInvoice) {
            setFormData({
                totalAmount: selectedInvoice.totalAmount,
                status: selectedInvoice.status,
            });
        }
    }, [selectedInvoice]);

    if (!selectedInvoice) return null;

    const handleSave = () => {
        handleUpdateInvoice(formData);
        setIsEditing(false);
    };

    const handleDownloadPdf = async () => {
        if (!selectedInvoice || !printRef.current) return;
        setIsPrinting(true);
        
        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;

        try {
            const canvas = await html2canvas(printRef.current, {
                scale: 2, // Higher resolution for better quality
                useCORS: true,
                backgroundColor: '#1A1A1A', // Match the modal background
                onclone: (documentClone: Document) => { // Ensure text is visible in the canvas
                    Array.from(documentClone.querySelectorAll('.text-brand-text, .text-brand-text-dark, .text-white, .text-brand-orange')).forEach(el => {
                        const style = window.getComputedStyle(el);
                        (el as HTMLElement).style.color = style.color;
                    });
                }
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps= pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Factura-${selectedInvoice.id}.pdf`);
    
        } catch (error) {
            console.error("Error al generar el PDF:", error);
            alert("Hubo un error al generar el PDF.");
        } finally {
            setIsPrinting(false);
        }
    };

    return (
      <>
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 print:hidden" aria-modal="true" role="dialog">
            <div className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center no-print">
                    <h2 className="text-2xl font-bold text-white">Detalles de Factura: {selectedInvoice.id}</h2>
                    <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div ref={printRef} className="p-8 overflow-y-auto flex-grow bg-brand-bg-light">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-brand-orange border-b border-brand-orange/30 pb-2">Cliente</h3>
                      <DetailItem label="Nombre">{`${selectedInvoice.serviceOrder.client.firstName} ${selectedInvoice.serviceOrder.client.lastName}`}</DetailItem>
                      <DetailItem label="Contacto">{selectedInvoice.serviceOrder.client.whatsapp} / {selectedInvoice.serviceOrder.client.email}</DetailItem>
                       <DetailItem label="Dirección">{selectedInvoice.serviceOrder.client.address}</DetailItem>
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-lg font-bold text-brand-orange border-b border-brand-orange/30 pb-2">Servicio</h3>
                       <DetailItem label="ID de Servicio">{selectedInvoice.serviceOrder.id}</DetailItem>
                       <DetailItem label="Artefacto">{selectedInvoice.serviceOrder.applianceName} ({selectedInvoice.serviceOrder.applianceType})</DetailItem>
                       <DetailItem label="Descripción del Problema">{selectedInvoice.serviceOrder.clientDescription}</DetailItem>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-700 space-y-6">
                      <div>
                          <h3 className="text-lg font-bold text-brand-orange border-b border-brand-orange/30 pb-2 mb-2">Diagnóstico del Técnico</h3>
                          <p className="text-brand-text-dark bg-brand-bg-dark/50 p-3 rounded-md whitespace-pre-wrap">
                              {selectedInvoice.serviceOrder.technicianNotes || 'No hay notas disponibles.'}
                          </p>
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-brand-orange border-b border-brand-orange/30 pb-2 mb-2">Repuestos Utilizados</h3>
                          {selectedInvoice.serviceOrder.partsUsed && selectedInvoice.serviceOrder.partsUsed.length > 0 ? (
                              <div className="overflow-x-auto rounded-lg border border-gray-700">
                                  <table className="min-w-full text-sm">
                                      <thead className="text-left text-brand-text-dark bg-gray-800/50">
                                          <tr>
                                              <th className="p-3 font-semibold">Repuesto</th>
                                              <th className="p-3 font-semibold">SKU</th>
                                              <th className="p-3 font-semibold text-right">Precio Unitario</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-700">
                                          {selectedInvoice.serviceOrder.partsUsed.map((part) => (
                                              <tr key={part.id}>
                                                  <td className="p-3 text-brand-text">{part.name}</td>
                                                  <td className="p-3 text-brand-text-dark font-mono">{part.sku}</td>
                                                  <td className="p-3 text-brand-text-dark text-right">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(part.price)}</td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          ) : (
                              <p className="text-brand-text-dark italic bg-brand-bg-dark/50 p-3 rounded-md">No se utilizaron repuestos para este servicio.</p>
                          )}
                      </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-bold text-brand-orange border-b border-brand-orange/30 pb-2 mb-4">Resumen de Factura</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <DetailItem label="Fecha de Emisión">{new Date(selectedInvoice.issueDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</DetailItem>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-brand-text-dark uppercase tracking-wider">Monto Total</h4>
                        {isEditing ? (
                          <input 
                            type="number"
                            value={formData.totalAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                            className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 mt-1 focus:ring-brand-orange focus:border-brand-orange"
                          />
                        ) : (
                          <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(selectedInvoice.totalAmount)}</p>
                        )}
                      </div>
                      
                      <div>
                         <h4 className="text-sm font-semibold text-brand-text-dark uppercase tracking-wider">Estado</h4>
                         {isEditing ? (
                           <select
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({...prev, status: e.target.value as InvoiceStatus}))}
                             className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 mt-1 focus:ring-brand-orange focus:border-brand-orange"
                           >
                            {INVOICE_STATUSES.map(status => (
                              <option key={status} value={status}>{INVOICE_STATUS_LABELS_ES[status]}</option>
                            ))}
                           </select>
                         ) : (
                          <span className={`px-3 py-1 mt-1 inline-flex text-sm leading-5 font-semibold rounded-full ${INVOICE_STATUS_COLORS[selectedInvoice.status]}`}>
                              {INVOICE_STATUS_LABELS_ES[selectedInvoice.status]}
                          </span>
                         )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-700 flex justify-end items-center space-x-3 no-print">
                   {isEditing ? (
                     <>
                      <button onClick={() => setIsEditing(false)} className="bg-gray-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-500">Cancelar</button>
                      <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-500">Guardar Cambios</button>
                     </>
                   ) : (
                     <>
                      <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-500">Editar</button>
                      <button onClick={handleDownloadPdf} disabled={isPrinting} className="bg-gray-200 text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-wait">
                        {isPrinting ? 'Generando PDF...' : 'Descargar PDF'}
                      </button>
                      <button onClick={() => setIsDetailsModalOpen(false)} className="bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600">Cerrar</button>
                     </>
                   )}
                </div>
            </div>
        </div>
      </>
    );
  };


  return (
    <div className="space-y-6">
      {isNewInvoiceModalOpen && <NewInvoiceModal />}
      {isDetailsModalOpen && <InvoiceDetailsModal />}

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Facturación</h1>
            <p className="text-brand-text-dark mt-1">Gestiona y consulta todas las facturas.</p>
        </div>
        <button 
          onClick={() => alert('Para crear una factura, ve a la sección de Servicios, selecciona un servicio completado y haz clic en "Facturar".')}
          className="bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors self-start md:self-center"
        >
          Crear Nueva Factura
        </button>
      </div>

      <div className="space-y-4">
         <input 
            type="text"
            placeholder="Buscar por # Factura, Cliente, o # Servicio..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 bg-brand-bg-light border border-gray-700 rounded-md p-2.5 text-brand-text focus:ring-brand-orange focus:border-brand-orange"
        />
        
        <div className="bg-brand-bg-light rounded-lg shadow-lg border border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Factura #</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Cliente</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Fecha de Emisión</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Estado</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Acciones</th>
                    </tr>
                    </thead>
                    <tbody className="bg-brand-bg-light divide-y divide-gray-700">
                    {filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-800/40 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-text">{invoice.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-brand-text">{`${invoice.serviceOrder.client.firstName} ${invoice.serviceOrder.client.lastName}`}</div>
                                <div className="text-xs text-brand-text-dark">Servicio: {invoice.serviceOrder.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dark">{new Date(invoice.issueDate).toLocaleDateString('es-ES')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dark">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(invoice.totalAmount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                                    {INVOICE_STATUS_LABELS_ES[invoice.status]}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                <button onClick={() => handleOpenDetailsModal(invoice)} className="text-brand-orange hover:text-orange-400 transition-colors">
                                    <EyeIcon className="w-5 h-5"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                 {filteredInvoices.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-sm text-brand-text-dark">No se encontraron facturas con ese criterio.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
