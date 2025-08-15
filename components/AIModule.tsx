import React, { useState, useMemo, useCallback, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { ServiceOrder, ServiceStatus, Client, User, UserRole, InvoiceStatus, Invoice } from '../types';
import { SparklesIcon, UploadIcon, CameraIcon, PlusCircleIcon, CloseIcon, FileIcon } from './ui/icons';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const AIServiceCard: React.FC<{
    service: ServiceOrder;
    onSend: (service: ServiceOrder) => void;
    isLoading: boolean;
    actionLabel: string;
    context: 'budget' | 'ready' | 'reminder';
}> = ({ service, onSend, isLoading, actionLabel, context }) => {
    
    const daysReady = context === 'reminder'
        ? Math.floor((new Date().getTime() - new Date(service.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

    return (
        <div className="bg-brand-bg-light p-4 rounded-lg shadow-lg border border-gray-700/50 flex flex-col justify-between animate-fadeInUp h-full">
            <div>
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-brand-text flex items-baseline min-w-0">
                        <span className="font-mono text-xs text-brand-text-dark/80 mr-2 shrink-0">#{service.id}</span>
                        <span className="truncate">{service.applianceName}</span>
                    </h3>
                    {context === 'reminder' && daysReady !== undefined && (
                         <span className="text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded shrink-0">{daysReady} DÍAS</span>
                    )}
                </div>
                 <p className="text-sm text-brand-text-dark mt-1">{service.client.firstName} {service.client.lastName}</p>
                 <p className="text-xs text-gray-500">
                    {context === 'budget' ? 'Ingresó' : 'Completado'}: {new Date(context === 'budget' ? service.createdAt : service.updatedAt).toLocaleDateString('es-ES')}
                 </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700/50 flex flex-col items-start gap-2">
                {service.lastNotificationSent && (
                    <p className="text-xs text-green-400/80">Última notificación: {new Date(service.lastNotificationSent).toLocaleDateString('es-ES')}</p>
                )}
                <button
                    onClick={() => onSend(service)}
                    disabled={isLoading}
                    className="w-full bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:bg-orange-900/70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <SparklesIcon className="h-5 w-5" />
                            <span>{actionLabel}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const HistoricalInvoiceExtractor: React.FC = () => {
    const { addHistoricalInvoice } = useData();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedJson, setExtractedJson] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
            setExtractedJson(null);
            setParsedData(null);
            setError(null);
        }
    };

    const handleExtract = async () => {
        if (!file) return;
        setIsExtracting(true);
        setError(null);
        setExtractedJson(null);
        setParsedData(null);

        const base64Data = preview?.split(',')[1];
        if (!base64Data) {
            setError('Error al leer el archivo.');
            setIsExtracting(false);
            return;
        }

        const filePart = { inlineData: { mimeType: file.type, data: base64Data } };
        const fullPrompt = `Actúa como un sistema experto en extracción de datos de facturas de un taller de reparaciones. Tu tarea es analizar el documento, extraer la información clave y devolverla en formato JSON.

### REGLAS DE EXTRACCIÓN:
1.  **Precisión:** Extrae la información exactamente como aparece.
2.  **Campos no encontrados:** Usa el valor \`null\` si un campo no se encuentra.
3.  **Fechas:** Normaliza las fechas a \`YYYY-MM-DD\`.
4.  **Números:** Extrae el costo total sin símbolos de moneda.

### ESTRUCTURA JSON REQUERIDA:
{
  "numero_factura": "String",
  "fecha_emision": "YYYY-MM-DD",
  "cliente_nombre": "String",
  "descripcion_servicio": "String",
  "costo_total": Number
}

Devuelve ÚNICAMENTE el JSON.`;
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [filePart, { text: fullPrompt }] },
            });
            let jsonString = response.text.trim().replace(/```json/g, '').replace(/```/g, '');
            setExtractedJson(jsonString);
            const parsed = JSON.parse(jsonString);
            if (parsed.error) {
                setError(parsed.error);
                setParsedData(null);
            } else if (!parsed.numero_factura || !parsed.costo_total) {
                setError("La IA no pudo extraer el número de factura o el costo total, campos que son obligatorios. Intente con una imagen más clara.");
                setParsedData(null);
            } else {
                setParsedData(parsed);
            }
        } catch (e) {
            console.error(e);
            setError("Error al procesar el documento. El formato de la respuesta no es válido o la API falló.");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleCreateInvoice = async () => {
        if (!parsedData) return;
        setIsCreating(true);

        try {
            const newInvoiceData: Omit<Invoice, 'id'> & { id: string } = {
                id: parsedData.numero_factura,
                issueDate: parsedData.fecha_emision || new Date().toISOString(),
                status: InvoiceStatus.PAID,
                clientName: parsedData.cliente_nombre || 'N/A',
                applianceDescription: parsedData.descripcion_servicio || 'N/A',
                totalAmount: parsedData.costo_total || 0,
                laborCost: 0,
                partsTotal: 0,
                subtotal: parsedData.costo_total || 0,
                taxAmount: 0,
            };
            addHistoricalInvoice(newInvoiceData);
            alert(`Factura histórica #${parsedData.numero_factura} registrada con éxito.`);
            navigate('/billing');
        } catch(e) {
            // Error is alerted in the useData hook.
            console.error(e);
        } finally {
            setIsCreating(false);
        }
    };

    const isPdf = file?.type === 'application/pdf';

    return (
        <div>
            <p className="text-brand-text-dark mb-6">Sube una factura antigua (imagen o PDF) para registrarla directamente en el sistema. La IA extraerá los datos y creará un registro de factura finalizado.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" />
                    {!preview ? (
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-brand-orange hover:bg-brand-bg-dark/50 transition-colors flex flex-col items-center justify-center h-64">
                            <UploadIcon className="h-12 w-12 text-gray-500 mb-4" />
                            <p className="text-brand-text">Cargar Factura Histórica</p>
                            <p className="text-sm text-brand-text-dark">Sube una imagen o PDF</p>
                        </div>
                    ) : (
                         <div className="relative group">
                            {isPdf ? (
                                <div className="rounded-lg w-full h-64 bg-brand-bg-dark flex flex-col items-center justify-center text-brand-text-dark p-4"><FileIcon className="h-16 w-16 mb-4" /><p className="font-semibold text-brand-text text-center break-all">{file?.name}</p><p className="text-xs mt-1">Documento PDF</p></div>
                            ) : (
                                <img src={preview} alt="Vista Previa" className="rounded-lg w-full h-64 object-contain bg-brand-bg-dark" />
                            )}
                            <div onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"><CloseIcon className="h-5 w-5"/></div>
                        </div>
                    )}
                    <button onClick={handleExtract} disabled={!file || isExtracting} className="w-full bg-brand-orange text-white px-4 py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:bg-orange-900/70 disabled:cursor-not-allowed text-lg">
                        {isExtracting ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><SparklesIcon className="h-6 w-6" /><span>Extraer Datos de Factura</span></>}
                    </button>
                </div>
                <div className="bg-brand-bg-dark/50 rounded-lg p-4 h-[21rem] flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-2">Resultados de la Extracción</h3>
                    <div className="flex-grow bg-black/30 rounded-md p-3 overflow-auto font-mono text-xs text-white relative">
                        {isExtracting && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
                        {error && <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>}
                        {extractedJson && <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(extractedJson), null, 2)}</pre>}
                        {!isExtracting && !error && !extractedJson && <p className="text-brand-text-dark italic">Los datos extraídos aparecerán aquí.</p>}
                    </div>
                     {parsedData && (
                        <button onClick={handleCreateInvoice} disabled={isCreating} className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-500 transition-colors flex items-center justify-center gap-2 disabled:bg-green-800 disabled:cursor-not-allowed">
                             {isCreating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><PlusCircleIcon className="h-5 w-5" /><span>Registrar Factura Histórica</span></>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const AIModule: React.FC = () => {
    const { services, updateService, companyInfo } = useData();
    const { hasPermission } = useAuth();
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [expandedColumns, setExpandedColumns] = useState({
        budget: false,
        ready: false,
        reminder: false,
    });
    const [activeTab, setActiveTab] = useState<'notifications' | 'historical_invoice'>('notifications');


    const toggleColumnExpansion = (column: keyof typeof expandedColumns) => {
        setExpandedColumns(prev => ({...prev, [column]: !prev[column]}));
    };

    const handleSendMessage = async (service: ServiceOrder, type: 'budget' | 'ready' | 'reminder') => {
        if (!hasPermission('ai', 'edit')) {
            alert("No tienes permiso para realizar esta acción.");
            return;
        }

        if (!service.client.whatsapp) {
            alert(`El cliente ${service.client.firstName} no tiene un número de WhatsApp registrado.`);
            return;
        }

        setLoadingStates(prev => ({ ...prev, [service.id]: true }));

        const whatsappWindow = window.open('', '_blank');
        if (whatsappWindow) {
            whatsappWindow.document.write('<html><head><title>Redireccionando...</title><style>body{font-family:sans-serif;background-color:#0D0D0D;color:#E0E0E0;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;text-align:center;}.spinner{border:4px solid rgba(255,255,255,0.3);border-radius:50%;border-top:4px solid #FF5B22;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 20px;}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style></head><body><div><div class="spinner"></div><p>Generando mensaje con IA y redireccionando a WhatsApp...</p></div></body></html>');
        } else {
            alert("Por favor, habilita las ventanas emergentes para continuar.");
            setLoadingStates(prev => ({ ...prev, [service.id]: false }));
            return;
        }

        let prompt = '';
        const daysReady = Math.floor((new Date().getTime() - new Date(service.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
        
        switch (type) {
            case 'budget':
                prompt = `Eres un asistente virtual para un taller de reparación llamado "${companyInfo.name}". Escribe un mensaje de WhatsApp amigable y profesional para notificar a un cliente que el presupuesto de su equipo está listo.
                Cliente: ${service.client.firstName} ${service.client.lastName}
                Artefacto: ${service.applianceName} (${service.applianceType})
                El mensaje debe informar que el diagnóstico ha sido completado y que su presupuesto está listo. Pídele que se comunique con nosotros para darle los detalles y obtener su aprobación. Incluye el nombre de la empresa y un saludo cordial. Sé conciso y directo.`;
                break;
            case 'ready':
                 prompt = `Eres un asistente virtual para un taller de reparación llamado "${companyInfo.name}". Escribe un mensaje de WhatsApp amigable y profesional para notificar a un cliente.
                Cliente: ${service.client.firstName} ${service.client.lastName}
                Artefacto: ${service.applianceName} (${service.applianceType})
                El mensaje debe informar que su artefacto está reparado y listo para ser retirado. Incluye el nombre de la empresa y un saludo cordial. Sé conciso.`;
                break;
            case 'reminder':
                prompt = `Eres un asistente virtual para un taller de reparación llamado "${companyInfo.name}". Escribe un recordatorio de WhatsApp amigable pero firme para un cliente.
                Cliente: ${service.client.firstName} ${service.client.lastName}
                Artefacto: ${service.applianceName} (${service.applianceType})
                Días desde que está listo: ${daysReady}
                El mensaje debe recordar amablemente al cliente que su artefacto ha estado listo para ser retirado por ${daysReady} días y que debe pasar a buscarlo. Mantén un tono cortés e incluye el nombre de la empresa. Sé conciso.`;
                break;
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            const messageText = response.text;
            const whatsappUrl = `https://wa.me/${service.client.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(messageText)}`;
            
            if (whatsappWindow) {
                whatsappWindow.location.href = whatsappUrl;
            }
            updateService(service.id, { lastNotificationSent: new Date().toISOString() });

        } catch (error) {
            console.error("Error generating message with Gemini:", error);
            if (whatsappWindow) {
                whatsappWindow.document.body.innerHTML = '<h3>Error al generar el mensaje.</h3><p>Por favor, cierra esta ventana e inténtalo de nuevo.</p>';
            }
            alert("Hubo un error al generar el mensaje. Por favor, inténtalo de nuevo.");
        } finally {
            setLoadingStates(prev => ({ ...prev, [service.id]: false }));
        }
    };
    
    const pendingBudgetServices = useMemo(() => services.filter(s => s.status === ServiceStatus.PENDING).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [services]);
    const readyForPickupServices = useMemo(() => services.filter(s => s.status === ServiceStatus.COMPLETED && !s.lastNotificationSent).sort((a,b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()), [services]);
    const needsReminderServices = useMemo(() => {
        const now = new Date().getTime();
        const fifteenDaysInMillis = 15 * 24 * 60 * 60 * 1000;
        const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
        return services.filter(s => {
            if (s.status !== ServiceStatus.COMPLETED) return false;
            const completedAt = new Date(s.updatedAt).getTime();
            if (now - completedAt <= fifteenDaysInMillis) return false;
            if (s.lastNotificationSent) {
                const lastSentAt = new Date(s.lastNotificationSent).getTime();
                if (now - lastSentAt < sevenDaysInMillis) return false; 
            }
            return true;
        }).sort((a,b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    }, [services]);
    
    const displayedPendingBudgetServices = expandedColumns.budget ? pendingBudgetServices : pendingBudgetServices.slice(0, 5);
    const displayedReadyForPickupServices = expandedColumns.ready ? readyForPickupServices : readyForPickupServices.slice(0, 5);
    const displayedNeedsReminderServices = expandedColumns.reminder ? needsReminderServices : needsReminderServices.slice(0, 5);
    
    const TabButton: React.FC<{
        tabId: typeof activeTab;
        children: React.ReactNode;
    }> = ({ tabId, children }) => (
         <button
            onClick={() => setActiveTab(tabId)}
            className={`px-3 py-3 font-semibold text-base border-b-2 transition-colors duration-300 ${
                activeTab === tabId
                    ? 'border-brand-orange text-brand-orange'
                    : 'border-transparent text-brand-text-dark hover:text-white'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <SparklesIcon className="h-8 w-8 text-brand-orange" />
                    <span>Automatización IA</span>
                </h1>
                <p className="text-brand-text-dark mt-1">Herramientas inteligentes para optimizar la gestión de tu taller.</p>
            </div>
            
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton tabId="notifications">Notificaciones a Clientes</TabButton>
                    <TabButton tabId="historical_invoice">Registrar Factura Histórica</TabButton>
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'notifications' && (
                     <div className="animate-fadeInUp" style={{animationDuration: '400ms'}}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <section className="space-y-4">
                                <h3 className="text-xl font-semibold text-white border-b-2 border-brand-orange/30 pb-2">Pendientes por Presupuesto</h3>
                                {pendingBudgetServices.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                            {displayedPendingBudgetServices.map(service => (
                                                <AIServiceCard 
                                                    key={service.id} service={service} onSend={(s) => handleSendMessage(s, 'budget')}
                                                    isLoading={loadingStates[service.id] || false} actionLabel="Notificar Presupuesto" context="budget"
                                                />
                                            ))}
                                        </div>
                                        {pendingBudgetServices.length > 5 && (
                                            <button onClick={() => toggleColumnExpansion('budget')} className="w-full text-center text-brand-orange hover:text-orange-400 font-semibold py-2 rounded-lg bg-brand-bg-light/50 hover:bg-brand-bg-light transition-colors">
                                                {expandedColumns.budget ? 'Ver Menos' : `Ver ${pendingBudgetServices.length - 5} Más`}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-16 bg-brand-bg-light rounded-lg border border-gray-700/50 h-full flex items-center justify-center">
                                        <p className="text-lg text-brand-text-dark">No hay servicios pendientes.</p>
                                    </div>
                                )}
                            </section>
                            
                            <section className="space-y-4">
                                <h3 className="text-xl font-semibold text-white border-b-2 border-brand-orange/30 pb-2">Completados para Notificar</h3>
                                {readyForPickupServices.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                            {displayedReadyForPickupServices.map(service => (
                                                <AIServiceCard 
                                                    key={service.id} service={service} onSend={(s) => handleSendMessage(s, 'ready')}
                                                    isLoading={loadingStates[service.id] || false} actionLabel="Enviar Notificación" context="ready"
                                                />
                                            ))}
                                        </div>
                                        {readyForPickupServices.length > 5 && (
                                            <button onClick={() => toggleColumnExpansion('ready')} className="w-full text-center text-brand-orange hover:text-orange-400 font-semibold py-2 rounded-lg bg-brand-bg-light/50 hover:bg-brand-bg-light transition-colors">
                                                {expandedColumns.ready ? 'Ver Menos' : `Ver ${readyForPickupServices.length - 5} Más`}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-16 bg-brand-bg-light rounded-lg border border-gray-700/50 h-full flex items-center justify-center">
                                        <p className="text-lg text-brand-text-dark">No hay servicios nuevos para notificar.</p>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-xl font-semibold text-white border-b-2 border-brand-orange/30 pb-2">Recordatorio (+15 días)</h3>
                                {needsReminderServices.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                            {displayedNeedsReminderServices.map(service => (
                                                <AIServiceCard 
                                                    key={service.id} service={service} onSend={(s) => handleSendMessage(s, 'reminder')}
                                                    isLoading={loadingStates[service.id] || false} actionLabel="Enviar Recordatorio" context="reminder"
                                                />
                                            ))}
                                        </div>
                                        {needsReminderServices.length > 5 && (
                                            <button onClick={() => toggleColumnExpansion('reminder')} className="w-full text-center text-brand-orange hover:text-orange-400 font-semibold py-2 rounded-lg bg-brand-bg-light/50 hover:bg-brand-bg-light transition-colors">
                                                {expandedColumns.reminder ? 'Ver Menos' : `Ver ${needsReminderServices.length - 5} Más`}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-16 bg-brand-bg-light rounded-lg border border-gray-700/50 h-full flex items-center justify-center">
                                        <p className="text-lg text-brand-text-dark">No hay servicios que necesiten recordatorio.</p>
                                    </div>
                                )}
                            </section>
                        </div>
                     </div>
                )}
                {activeTab === 'historical_invoice' && (
                    <div className="animate-fadeInUp" style={{animationDuration: '400ms'}}>
                        <HistoricalInvoiceExtractor />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIModule;