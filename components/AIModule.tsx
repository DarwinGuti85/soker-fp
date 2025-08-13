import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { ServiceOrder, ServiceStatus } from '../types';
import { SparklesIcon } from './ui/icons';

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

const AIModule: React.FC = () => {
    const { services, updateService, companyInfo } = useData();
    const { hasPermission } = useAuth();
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [expandedColumns, setExpandedColumns] = useState({
        budget: false,
        ready: false,
        reminder: false,
    });

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
    
    // FULL lists of services
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
    
    // SLICED lists for display
    const displayedPendingBudgetServices = expandedColumns.budget ? pendingBudgetServices : pendingBudgetServices.slice(0, 10);
    const displayedReadyForPickupServices = expandedColumns.ready ? readyForPickupServices : readyForPickupServices.slice(0, 10);
    const displayedNeedsReminderServices = expandedColumns.reminder ? needsReminderServices : needsReminderServices.slice(0, 10);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <SparklesIcon className="h-8 w-8 text-brand-orange" />
                    <span>Notificaciones</span>
                </h1>
                <p className="text-brand-text-dark mt-1">Gestiona las notificaciones a clientes por WhatsApp.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               {/* Column for "Pending Budget" */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white border-b-2 border-brand-orange/30 pb-2">Pendientes por Presupuesto</h2>
                    {pendingBudgetServices.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                {displayedPendingBudgetServices.map(service => (
                                    <AIServiceCard 
                                        key={service.id}
                                        service={service}
                                        onSend={(s) => handleSendMessage(s, 'budget')}
                                        isLoading={loadingStates[service.id] || false}
                                        actionLabel="Notificar Presupuesto"
                                        context="budget"
                                    />
                                ))}
                            </div>
                            {pendingBudgetServices.length > 10 && (
                                <button
                                    onClick={() => toggleColumnExpansion('budget')}
                                    className="w-full text-center text-brand-orange hover:text-orange-400 font-semibold py-2 rounded-lg bg-brand-bg-light/50 hover:bg-brand-bg-light transition-colors"
                                >
                                    {expandedColumns.budget ? 'Ver Menos' : `Ver ${pendingBudgetServices.length - 10} Más`}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16 bg-brand-bg-light rounded-lg border border-gray-700/50 h-full flex items-center justify-center">
                            <p className="text-lg text-brand-text-dark">No hay servicios pendientes de presupuesto.</p>
                        </div>
                    )}
                </section>
                
                {/* Column for "Ready for Pickup" */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white border-b-2 border-brand-orange/30 pb-2">Completados para Notificar</h2>
                    {readyForPickupServices.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                {displayedReadyForPickupServices.map(service => (
                                    <AIServiceCard 
                                        key={service.id}
                                        service={service}
                                        onSend={(s) => handleSendMessage(s, 'ready')}
                                        isLoading={loadingStates[service.id] || false}
                                        actionLabel="Enviar Notificación"
                                        context="ready"
                                    />
                                ))}
                            </div>
                             {readyForPickupServices.length > 10 && (
                                <button
                                    onClick={() => toggleColumnExpansion('ready')}
                                    className="w-full text-center text-brand-orange hover:text-orange-400 font-semibold py-2 rounded-lg bg-brand-bg-light/50 hover:bg-brand-bg-light transition-colors"
                                >
                                    {expandedColumns.ready ? 'Ver Menos' : `Ver ${readyForPickupServices.length - 10} Más`}
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16 bg-brand-bg-light rounded-lg border border-gray-700/50 h-full flex items-center justify-center">
                            <p className="text-lg text-brand-text-dark">No hay servicios nuevos para notificar.</p>
                        </div>
                    )}
                </section>

                {/* Column for "Pickup Reminders" */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white border-b-2 border-brand-orange/30 pb-2">Recordatorio (+15 días)</h2>
                     {needsReminderServices.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                {displayedNeedsReminderServices.map(service => (
                                    <AIServiceCard 
                                        key={service.id}
                                        service={service}
                                        onSend={(s) => handleSendMessage(s, 'reminder')}
                                        isLoading={loadingStates[service.id] || false}
                                        actionLabel="Enviar Recordatorio"
                                        context="reminder"
                                    />
                                ))}
                            </div>
                            {needsReminderServices.length > 10 && (
                                <button
                                    onClick={() => toggleColumnExpansion('reminder')}
                                    className="w-full text-center text-brand-orange hover:text-orange-400 font-semibold py-2 rounded-lg bg-brand-bg-light/50 hover:bg-brand-bg-light transition-colors"
                                >
                                    {expandedColumns.reminder ? 'Ver Menos' : `Ver ${needsReminderServices.length - 10} Más`}
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
    );
};

export default AIModule;