import React, { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { marked } from 'marked';
import { useData } from '../hooks/useData';
import { ChatBubbleOvalLeftEllipsisIcon, CloseIcon, PaperAirplaneIcon, SparklesIcon, MicrophoneIcon } from './ui/icons';

interface Message {
  role: 'user' | 'model';
  text: string;
}

// Browser SpeechRecognition polyfill
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const TypingIndicator: React.FC = () => (
    <div className="message message-ai">
        <div className="typing-indicator">
            <span />
            <span />
            <span />
        </div>
    </div>
);

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const chatRef = useRef<Chat | null>(null);
    const recognitionRef = useRef<any | null>(null);
    const { clients, services, invoices, inventory } = useData();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const recognitionIsSupported = !!SpeechRecognition;
    const wasListening = useRef(false);

    const prepareDataContext = useCallback((): string => {
        const clientMap = new Map(clients.map(c => [c.id, c]));

        const summary = {
            resumen_general: {
                fecha_actual: new Date().toLocaleDateString('es-ES'),
                total_clientes: clients.length,
                total_servicios: services.length,
                servicios_pendientes: services.filter(s => s.status === 'PENDING').length,
                servicios_completados: services.filter(s => s.status === 'COMPLETED').length,
                total_facturas: invoices.length,
                facturas_impagas: invoices.filter(i => i.status === 'UNPAID').length,
                total_items_inventario: inventory.length,
                items_sin_stock: inventory.filter(i => i.quantity === 0).length
            },
            clientes: clients.slice(0, 50).map(c => ({
                id: c.id,
                nombre: `${c.firstName} ${c.lastName}`,
                whatsapp: c.whatsapp,
                email: c.email,
                direccion: c.address,
                registro: c.createdAt
            })),
            servicios: services.slice(0, 100).map(s => {
                const client = clientMap.get(s.client.id);
                return {
                    id: s.id,
                    cliente_id: s.client.id,
                    cliente_nombre: client ? `${client.firstName} ${client.lastName}` : 'Desconocido',
                    artefacto: s.applianceName,
                    estado: s.status,
                    fecha_creacion: s.createdAt,
                    tecnico: s.technician?.username
                };
            }),
            facturas: invoices.slice(0, 100).map(i => ({
                id: i.id,
                servicio_id: i.serviceOrder?.id,
                cliente: i.clientName || `${i.serviceOrder?.client.firstName} ${i.serviceOrder?.client.lastName}`,
                estado: i.status,
                total: i.totalAmount,
                fecha: i.issueDate
            })),
            inventario: inventory.filter(i => i.quantity < 5).map(i => ({
                id: i.id,
                nombre: i.name,
                sku: i.sku,
                cantidad: i.quantity,
                precio: i.price
            }))
        };
        return JSON.stringify(summary, null, 2);
    }, [clients, services, invoices, inventory]);

    const sendMessage = useCallback(async (messageText: string) => {
        const trimmedInput = messageText.trim();
        if (!trimmedInput || isLoading || !chatRef.current) return;

        const newUserMessage: Message = { role: 'user', text: trimmedInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const dataContext = prepareDataContext();
            const fullPrompt = `Contexto de la aplicación (JSON):\n\`\`\`json\n${dataContext}\n\`\`\`\n\nPregunta del usuario:\n${trimmedInput}`;
            
            const response = await chatRef.current.sendMessage({ message: fullPrompt });
            const htmlContent = await marked.parse(response.text);

            const newAiMessage: Message = { role: 'model', text: htmlContent };
            setMessages(prev => [...prev, newAiMessage]);
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage: Message = { role: 'model', text: 'Lo siento, he encontrado un error al procesar tu solicitud. Por favor, inténtalo de nuevo.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, prepareDataContext]);

    useEffect(() => {
        if (wasListening.current && !isListening && userInput.trim()) {
            sendMessage(userInput);
        }
        wasListening.current = isListening;
    }, [isListening, userInput, sendMessage]);

    useEffect(() => {
        if (!recognitionIsSupported) {
            console.log("El reconocimiento de voz no es compatible con este navegador.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onstart = () => {
            setIsListening(true);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Error en reconocimiento de voz:', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setUserInput(transcript);
        };

        recognitionRef.current = recognition;
    }, [recognitionIsSupported]);

    const initializeChat = () => {
        const systemInstruction = `Eres chupamestepenco AI, un asistente virtual experto para el taller de reparación SOKER FP. Tu propósito es ayudar a los usuarios a consultar información del sistema y ofrecer consejos de gestión empresarial.
        
### REGLAS ESTRICTAS:
1.  **PUNTUAL Y DETALLADO:** Responde de manera concisa y directa a la pregunta del usuario. Proporciona detalles adicionales solo si se solicitan explícitamente.
2.  **BASADO EN DATOS:** Basa TODAS tus respuestas sobre clientes, servicios, facturación o inventario EXCLUSIVAMENTE en el contexto JSON proporcionado. Si la información no está ahí, responde amablemente "No tengo acceso a esa información en los datos proporcionados." NUNCA INVENTES DATOS.
3.  **CONTEXTO CRUZADO:** Cuando un usuario pregunte sobre un servicio, utiliza el \`cliente_id\` para buscar el nombre completo y los detalles de contacto en la lista de \`clientes\`. Siempre muestra el nombre del cliente en lugar de solo su ID. Si te preguntan por el contacto de un cliente (teléfono, dirección, etc.), búscalo en la lista de clientes.
4.  **CONSEJERO:** Cuando se te pida un consejo financiero o de gestión, actúa como un consultor de negocios. Analiza los datos proporcionados para identificar tendencias y ofrece recomendaciones concretas y accionables.
5.  **TONO:** Sé profesional, amigable y muy servicial.
6.  **FORMATO:** Utiliza formato Markdown (listas, **negritas**) para que tus respuestas sean claras.`;

        const chatSession = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });
        chatRef.current = chatSession;

        setMessages([{
            role: 'model',
            text: '¡Hola! Soy chupamestepenco AI. ¿En qué puedo ayudarte hoy? Puedes usar el micrófono para hablar conmigo.'
        }]);
    };
    
    useEffect(() => {
        if (isOpen && !chatRef.current) {
            initializeChat();
        }
    }, [isOpen]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        sendMessage(userInput);
    };
    
    const handleToggleListening = () => {
        if (!recognitionRef.current || isLoading) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setUserInput('');
            recognitionRef.current.start();
        }
    };

    const animationClass = isOpen ? 'animate-slideIn' : 'animate-slideOut';

    return (
        <>
            <button
                className="chat-bubble"
                onClick={() => setIsOpen(prev => !prev)}
                aria-label={isOpen ? "Cerrar asistente virtual" : "Abrir asistente virtual"}
            >
                {isOpen ? <CloseIcon className="w-8 h-8 text-white" /> : <SparklesIcon className="w-8 h-8 text-white" />}
            </button>
            <div className={`chat-panel ${isOpen ? animationClass : 'chat-panel-hidden'}`}>
                <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-brand-bg-dark border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-brand-orange" />
                        <h2 className="font-bold text-gray-900 dark:text-white text-lg">chupamestepenco AI</h2>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-brand-text-dark hover:text-gray-900 dark:hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div ref={chatContainerRef} className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}>
                            {msg.role === 'model' ? (
                                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                            ) : (
                                msg.text
                            )}
                        </div>
                    ))}
                    {isLoading && <TypingIndicator />}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-brand-bg-dark">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={isListening ? "Escuchando..." : "Escribe tu pregunta..."}
                            className="flex-grow bg-white dark:bg-brand-bg-light border border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 text-gray-900 dark:text-brand-text focus:ring-2 focus:ring-brand-orange focus:outline-none"
                            disabled={isLoading}
                            autoComplete="off"
                        />
                         {recognitionIsSupported && (
                             <button
                                type="button"
                                onClick={handleToggleListening}
                                className={`p-2.5 rounded-full transition-colors ${
                                    isListening
                                        ? 'bg-red-600 text-white animate-pulse'
                                        : 'bg-gray-200 dark:bg-brand-bg-light hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-brand-text'
                                }`}
                                aria-label={isListening ? 'Detener grabación' : 'Iniciar grabación'}
                            >
                                <MicrophoneIcon className="w-5 h-5" />
                            </button>
                         )}
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-brand-orange text-white rounded-full p-2.5 disabled:bg-orange-800 disabled:cursor-not-allowed transition-colors">
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Chatbot;