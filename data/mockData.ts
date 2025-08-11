import { User, UserRole, Client, ServiceOrder, ServiceStatus, InventoryItem, Invoice, InvoiceStatus, CompanyInfo } from '../types';

export const MOCK_COMPANY_INFO: CompanyInfo = {
    name: 'SOKER FP, C.A.',
    taxId: 'J-12345678-9',
    address: 'Av. Principal, Edif. Soker, Caracas',
    email: 'contacto@sokerfp.com',
    phone: '+58 212-555-1234'
};

export const MOCK_USERS: User[] = [
  { id: 'user-1', username: 'admin', firstName: 'Admin', lastName: 'Soker', email: 'admin@soker.com', role: UserRole.ADMIN, password: '54321' },
  { id: 'user-2', username: 'cajero', firstName: 'Cajero', lastName: 'Soker', email: 'cajero@soker.com', role: UserRole.CASHIER, password: '1234' },
  { id: 'user-3', username: 'tecnico1', firstName: 'Carlos', lastName: 'Vargas', email: 'tecnico@soker.com', role: UserRole.TECHNICIAN, password: '1234' },
  { id: 'user-4', username: 'jsmith', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@soker.com', role: UserRole.TECHNICIAN, password: '1234' },
];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const baseClients: Client[] = [
    { id: 'client-1', firstName: 'Santiago', lastName: 'Rodriguez', whatsapp: '3101234567', email: 'santiago.r@email.com', address: 'Cra 7 # 156-10, Bogotá', createdAt: new Date(2024, 4, 15).toISOString(), taxId: 'V-12345678-9' },
    { id: 'client-2', firstName: 'Valentina', lastName: 'Gomez', whatsapp: '3112345678', email: 'valentina.g@email.com', address: 'Cl 10 # 43A-30, Medellín', createdAt: new Date(2024, 4, 1).toISOString(), taxId: 'V-87654321-0' },
    { id: 'client-3', firstName: 'Matias', lastName: 'Gonzalez', whatsapp: '3123456789', email: 'matias.g@email.com', address: 'Av. 3 Nte # 23-45, Cali', createdAt: new Date(2024, 3, 20).toISOString() },
    { id: 'client-4', firstName: 'Isabella', lastName: 'Perez', whatsapp: '3134567890', email: 'isabella.p@email.com', address: 'Cra 51B # 82-254, Barranquilla', createdAt: new Date(2024, 3, 10).toISOString(), taxId: 'J-11223344-5' },
    { id: 'client-5', firstName: 'Sebastian', lastName: 'Martinez', whatsapp: '3145678901', email: 'sebastian.m@email.com', address: 'Cl 35 # 19-45, Bucaramanga', createdAt: new Date(2024, 2, 25).toISOString() },
    { id: 'client-6', firstName: 'Camila', lastName: 'Sanchez', whatsapp: '3206789012', email: 'camila.s@email.com', address: 'Cra 23 # 65-30, Manizales', createdAt: new Date(2024, 2, 5).toISOString() },
    { id: 'client-7', firstName: 'Nicolas', lastName: 'Ramirez', whatsapp: '3217890123', email: 'nicolas.r@email.com', address: 'Av. El Dorado # 26-33, Bogotá', createdAt: new Date(2024, 1, 18).toISOString() },
    { id: 'client-8', firstName: 'Mariana', lastName: 'Diaz', whatsapp: '3228901234', email: 'mariana.d@email.com', address: 'Poblado, Cra 34 # 7-50, Medellín', createdAt: new Date(2024, 1, 2).toISOString(), taxId: 'V-18273645-5' },
    { id: 'client-9', firstName: 'Samuel', lastName: 'Hernandez', whatsapp: '3009012345', email: 'samuel.h@email.com', address: 'Cl 5 # 38-12, Cali', createdAt: new Date(2024, 0, 28).toISOString() },
    { id: 'client-10', firstName: 'Daniela', lastName: 'Torres', whatsapp: '3011234567', email: 'daniela.t@email.com', address: 'Cra 43 # 75B-12, Barranquilla', createdAt: new Date(2024, 0, 10).toISOString() },
    { id: 'client-11', firstName: 'Alejandro', lastName: 'Vargas', whatsapp: '3022345678', email: 'alejandro.v@email.com', address: 'Calle 116 # 15-60, Bogotá', createdAt: new Date(2023, 11, 22).toISOString() },
    { id: 'client-12', firstName: 'Gabriela', lastName: 'Rojas', whatsapp: '3033456789', email: 'gabriela.r@email.com', address: 'Laureles, Av. Nutibara, Medellín', createdAt: new Date(2023, 11, 5).toISOString() },
    { id: 'client-13', firstName: 'Andres', lastName: 'Moreno', whatsapp: '3044567890', email: 'andres.m@email.com', address: 'Ciudad Jardin, Cra 105 # 14-02, Cali', createdAt: new Date(2023, 10, 15).toISOString(), taxId: 'V-15839402-1' },
    { id: 'client-14', firstName: 'Sofia', lastName: 'Castro', whatsapp: '3055678901', email: 'sofia.c@email.com', address: 'Cra 46 # 84-76, Barranquilla', createdAt: new Date(2023, 10, 1).toISOString() },
    { id: 'client-15', firstName: 'Felipe', lastName: 'Jimenez', whatsapp: '3109876543', email: 'felipe.j@email.com', address: 'Usaquén, Cra 9 # 110-20, Bogotá', createdAt: new Date(2023, 9, 20).toISOString() },
    { id: 'client-16', firstName: 'Laura', lastName: 'Ortiz', whatsapp: '3118765432', email: 'laura.o@email.com', address: 'Envigado, Dg 40 # 33-15, Medellín', createdAt: new Date(2023, 9, 8).toISOString() },
    { id: 'client-17', firstName: 'Juan Jose', lastName: 'Silva', whatsapp: '3127654321', email: 'juan.jose.s@email.com', address: 'Cra 66 # 9-11, Cali', createdAt: new Date(2023, 8, 12).toISOString() },
    { id: 'client-18', firstName: 'Valeria', lastName: 'Muñoz', whatsapp: '3136543210', email: 'valeria.m@email.com', address: 'Cl 72 # 53-20, Barranquilla', createdAt: new Date(2023, 8, 3).toISOString() },
    { id: 'client-19', firstName: 'Emiliano', lastName: 'Guerrero', whatsapp: '3145432109', email: 'emiliano.g@email.com', address: 'Chapinero, Cl 63 # 13-45, Bogotá', createdAt: new Date(2023, 7, 25).toISOString() },
    { id: 'client-20', firstName: 'Luciana', lastName: 'Mendoza', whatsapp: '3204321098', email: 'luciana.m@email.com', address: 'Sabaneta, Cra 45 # 75S-12, Medellín', createdAt: new Date(2023, 7, 14).toISOString() }
];

const firstNames = ['Carlos', 'Ana', 'Luis', 'Maria', 'Jorge', 'Lucia', 'Pedro', 'Laura', 'Javier', 'Sofia', 'Ricardo', 'Paula', 'Fernando', 'Elena', 'Miguel', 'Isabel', 'Raul', 'Carmen', 'David', 'Patricia', 'Adriana', 'Beatriz', 'Cristina', 'Diego', 'Eduardo', 'Francisco', 'Gloria', 'Hector', 'Irene', 'Juan'];
const lastNames = ['Garcia', 'Lopez', 'Martinez', 'Rodriguez', 'Perez', 'Sanchez', 'Gomez', 'Fernandez', 'Moreno', 'Jimenez', 'Diaz', 'Ruiz', 'Alvarez', 'Romero', 'Navarro', 'Torres', 'Dominguez', 'Vazquez', 'Ramos', 'Blanco', 'Serrano', 'Castro', 'Ortiz', 'Rubio', 'Sanz'];
const cities = [
    { city: 'Cartagena', state: 'Bolívar' }, { city: 'Cúcuta', state: 'Norte de Santander' }, { city: 'Soledad', state: 'Atlántico' }, { city: 'Ibagué', state: 'Tolima' },
    { city: 'Soacha', state: 'Cundinamarca' }, { city: 'Santa Marta', state: 'Magdalena' }, { city: 'Villavicencio', state: 'Meta' }, { city: 'Bello', state: 'Antioquia' },
    { city: 'Pereira', state: 'Risaralda' }, { city: 'Valledupar', state: 'Cesar' }
];

const now = new Date();
const oneYearAgo = new Date(new Date().setFullYear(now.getFullYear() - 1));

const generatedClients: Client[] = Array.from({ length: 70 }, (_, i) => {
    const firstName = getRandom(firstNames);
    const lastName = getRandom(lastNames);
    const cityInfo = getRandom(cities);
    const hasTaxId = Math.random() > 0.7; // 30% chance of having a taxId
    return {
        id: `client-${21 + i}`,
        firstName,
        lastName,
        whatsapp: `3${getRandomInt(10, 29)}${getRandomInt(1000000, 9999999)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        address: `Calle ${getRandomInt(1,150)} #${getRandomInt(10,99)}-${getRandomInt(10,99)}, ${cityInfo.city}`,
        createdAt: getRandomDate(oneYearAgo, now).toISOString(),
        taxId: hasTaxId ? `V-${getRandomInt(10000000, 28000000)}-${getRandomInt(0,9)}` : undefined
    };
});

export const MOCK_CLIENTS: Client[] = [...baseClients, ...generatedClients];

const baseInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Relé de Compresor', sku: 'SAMSUNG-RELAY-123', quantity: 5, price: 45500 },
  { id: 'inv-2', name: 'Bomba de Drenaje', sku: 'LG-PUMP-456', quantity: 2, price: 78000 },
  { id: 'inv-3', name: 'Resistencia Calefactora', sku: 'GE-HEATER-789', quantity: 8, price: 120250 },
  { id: 'inv-4', name: 'Válvula de Entrada de Agua', sku: 'BOSCH-VALVE-012', quantity: 0, price: 35000 },
];

const partPrefixes = ['Kit de', 'Sensor de', 'Motor para', 'Tarjeta Lógica', 'Filtro de', 'Correa para', 'Válvula de', 'Bomba de', 'Fusible Térmico', 'Termostato', 'Panel de Control', 'Resistencia', 'Manguera de', 'Sello de', 'Rodamiento', 'Capacitor', 'Magnetrón para', 'Plato Giratorio para', 'Interruptor de Puerta', 'Dispensador de Hielo'];
const applianceTypes = ['Lavadora', 'Secadora', 'Refrigerador', 'Congelador', 'Estufa', 'Horno', 'Microondas', 'Aire Acondicionado', 'Licuadora', 'Nevera', 'Lavavajillas'];
const brands = ['Samsung', 'LG', 'Whirlpool', 'GE', 'Mabe', 'Electrolux', 'Bosch', 'Haceb', 'Frigidaire', 'Oster', 'Kalley', 'Challenger', 'Abba'];

const generatedInventory: InventoryItem[] = Array.from({ length: 364 }, (_, i) => {
    const prefix = getRandom(partPrefixes);
    const appliance = getRandom(applianceTypes);
    const brand = getRandom(brands);
    
    const name = `${prefix} ${appliance} ${brand}`;
    const sku = `${brand.substring(0, 3).toUpperCase()}-${appliance.substring(0, 3).toUpperCase()}-${getRandomInt(10000, 99999)}`;
    const quantity = getRandomInt(0, 45); // Random quantity between 0 and 45
    const price = getRandomInt(5000, 180000); // Random price between 5,000 and 180,000 COP
    
    return {
        id: `inv-${5 + i}`, // Start ID after base items
        name,
        sku,
        quantity,
        price,
    };
});

export const MOCK_INVENTORY: InventoryItem[] = [...baseInventory, ...generatedInventory];

const baseServices: ServiceOrder[] = [
  {
    id: 'service-1', client: MOCK_CLIENTS[0], applianceName: 'Refrigerador', applianceType: 'Samsung RF28HFE', clientDescription: 'No enfría correctamente. El compresor parece funcionar constantemente.', technicianNotes: 'Revisado el compresor, se detecta fuga de gas. Se necesita recarga y sellado.', status: ServiceStatus.IN_PROGRESS, technician: MOCK_USERS[2], createdAt: '2024-05-10T10:00:00Z', updatedAt: '2024-05-11T14:30:00Z'
  },
  {
    id: 'service-2', client: MOCK_CLIENTS[1], applianceName: 'Lavadora', applianceType: 'LG WM3700HWA', clientDescription: 'Fuga de agua por la parte inferior durante el ciclo de centrifugado.', technicianNotes: 'Pendiente de revisión inicial.', status: ServiceStatus.PENDING, createdAt: '2024-05-12T11:00:00Z', updatedAt: '2024-05-12T11:00:00Z'
  },
  {
    id: 'service-3', client: MOCK_CLIENTS[2], applianceName: 'Horno', applianceType: 'GE Profile', clientDescription: 'La resistencia de calentamiento no funciona.', technicianNotes: 'Se reemplazó la resistencia (parte GE-HEATER-789). El equipo funciona correctamente.', status: ServiceStatus.COMPLETED, technician: MOCK_USERS[2], createdAt: '2024-04-20T09:00:00Z', updatedAt: '2024-04-22T16:00:00Z', partsUsed: [MOCK_INVENTORY[2]]
  },
  {
    id: 'service-4', client: MOCK_CLIENTS[3], applianceName: 'Lavavajillas', applianceType: 'Bosch 300 Series', clientDescription: 'Código de error E24. Posible problema de drenaje.', technicianNotes: 'Se necesita la bomba de drenaje. Pedido realizado, en espera de la pieza.', status: ServiceStatus.AWAITING_PARTS, technician: MOCK_USERS[3], createdAt: '2024-05-01T15:00:00Z', updatedAt: '2024-05-02T10:00:00Z'
  },
];

const appliances = [
    { name: 'Microondas', type: 'Panasonic NN-SN966S' }, { name: 'Aire Acondicionado', type: 'Midea U Inverter' }, { name: 'Licuadora', type: 'Vitamix 5200' },
    { name: 'Estufa', type: 'Frigidaire Gallery' }, { name: 'Aspiradora', type: 'Dyson V15' }, { name: 'Cafetera', type: 'Keurig K-Elite' },
    { name: 'Tostadora', type: 'Breville BTA840XL' }, { name: 'Plancha', type: 'Rowenta Steamforce' },
];

const generatedServices: ServiceOrder[] = Array.from({ length: 720 }, (_, i) => {
    const client = getRandom(MOCK_CLIENTS);
    const status = getRandom(Object.values(ServiceStatus));
    const appliance = getRandom(appliances);

    let technician: User | undefined = getRandom(MOCK_USERS.filter(u => u.role === UserRole.TECHNICIAN));
    if (status === ServiceStatus.PENDING && Math.random() > 0.5) {
        technician = undefined;
    }
    
    const createdAtDate = getRandomDate(oneYearAgo, now);
    let updatedAtDate = new Date(createdAtDate);
    
    if (status !== ServiceStatus.PENDING) {
        updatedAtDate.setDate(updatedAtDate.getDate() + getRandomInt(1, 14));
        if (updatedAtDate > now) {
            updatedAtDate = now;
        }
    }
    
    const service: ServiceOrder = {
        id: `service-${i + 5}`,
        client,
        technician,
        status,
        applianceName: appliance.name,
        applianceType: appliance.type,
        clientDescription: `El cliente reporta que el ${appliance.name} tiene un ruido extraño.`,
        technicianNotes: status === ServiceStatus.PENDING ? 'Pendiente de diagnóstico.' : 'Se realizó mantenimiento preventivo.',
        createdAt: createdAtDate.toISOString(),
        updatedAt: updatedAtDate.toISOString(),
    };

    if (service.status === ServiceStatus.COMPLETED && Math.random() > 0.4) {
        const numberOfParts = getRandomInt(1, 3);
        const availableParts = MOCK_INVENTORY.filter(p => p.quantity > 0);
        if (availableParts.length > 0) {
            service.partsUsed = Array.from({ length: numberOfParts }, () => getRandom(availableParts));
            const partNames = service.partsUsed.map(p => p.name).join(', ');
            service.technicianNotes = `Diagnóstico completo. Se reemplazaron las siguientes piezas: ${partNames}. El equipo ahora funciona correctamente.`;
        }
    }

    return service;
});

export const MOCK_SERVICES: ServiceOrder[] = [...baseServices, ...generatedServices];

// --- MOCK INVOICES ---
const completedServices = MOCK_SERVICES.filter(s => s.status === ServiceStatus.COMPLETED);

export const MOCK_INVOICES: Invoice[] = completedServices.slice(0, 45).map((service, index) => {
    const isPaid = Math.random() > 0.3; // 70% chance of being paid
    const issueDate = new Date(service.updatedAt);

    const revisionPrice = 50000;
    const laborCost = getRandomInt(80000, 250000);
    const partsTotal = service.partsUsed?.reduce((sum, part) => sum + part.price, 0) || 0;
    const subtotal = revisionPrice + laborCost + partsTotal;
    const taxAmount = subtotal * 0.16;
    const totalAmount = subtotal + taxAmount;
    
    return {
        id: `FACT-${String(1001 + index).padStart(4, '0')}`,
        serviceOrder: service,
        issueDate: issueDate.toISOString(),
        status: isPaid ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
        revisionPrice,
        laborCost,
        partsTotal,
        subtotal,
        taxAmount,
        totalAmount
    };
});