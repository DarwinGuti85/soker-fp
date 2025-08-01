
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { ServiceStatus, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { ServicesIcon, ClientsIcon, InventoryIcon, ClockIcon, PackageIcon, BanknotesIcon, CheckCircleIcon } from './ui/icons';
import { STATUS_COLORS, STATUS_LABELS_ES, SERVICE_STATUSES, STATUS_HEX_COLORS } from '../constants';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <div className="bg-brand-bg-light p-5 rounded-lg shadow-lg border border-gray-700/50 flex items-center space-x-4">
    <div className="bg-brand-orange/10 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-brand-text-dark">{title}</p>
      <div className="flex items-baseline space-x-2 mt-1">
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);


const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { services, clients, inventory, users, invoices } = useData();
  
  // --- Data Processing for Cards & Charts ---
  
  // 1. Current Month Metrics for Cards
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const pendingServices = services.filter(s => s.status === ServiceStatus.PENDING).length;
  const awaitingPartsServices = services.filter(s => s.status === ServiceStatus.AWAITING_PARTS).length;
  const newClientsThisMonth = clients.filter(c => c.createdAt && new Date(c.createdAt) >= startOfCurrentMonth).length;
  
  const completedServicesThisMonth = services
    .filter(s => s.status === ServiceStatus.COMPLETED && new Date(s.updatedAt) >= startOfCurrentMonth)
    .length;
    
  const monthlyIncome = invoices
    .filter(i => new Date(i.issueDate) >= startOfCurrentMonth)
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  
  // 2. Performance Data for Main Chart (Last 6 months)
  const performanceData = Array.from({ length: 6 }).map((_, i) => {
    const targetMonthDate = new Date();
    targetMonthDate.setDate(1); // Start from the first day of the current month
    targetMonthDate.setMonth(targetMonthDate.getMonth() - i);
    const month = targetMonthDate.getMonth();
    const year = targetMonthDate.getFullYear();
    
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const statusCounts = services.filter(s => {
      const updatedAt = new Date(s.updatedAt);
      return updatedAt >= startOfMonth && updatedAt <= endOfMonth;
    }).reduce((acc, service) => {
      acc[service.status] = (acc[service.status] || 0) + 1;
      return acc;
    }, {} as Record<ServiceStatus, number>);
    
    return {
      name: targetMonthDate.toLocaleString('es-ES', { month: 'short' }).replace('.', '').toUpperCase(),
      [STATUS_LABELS_ES.PENDING]: statusCounts[ServiceStatus.PENDING] || 0,
      [STATUS_LABELS_ES.IN_PROGRESS]: statusCounts[ServiceStatus.IN_PROGRESS] || 0,
      [STATUS_LABELS_ES.AWAITING_PARTS]: statusCounts[ServiceStatus.AWAITING_PARTS] || 0,
      [STATUS_LABELS_ES.COMPLETED]: statusCounts[ServiceStatus.COMPLETED] || 0,
      [STATUS_LABELS_ES.CANCELED]: statusCounts[ServiceStatus.CANCELED] || 0,
    };
  }).reverse();

  // 3. Services by status (for Donut chart)
  const servicesByStatus = services.reduce((acc, service) => {
    acc[service.status] = (acc[service.status] || 0) + 1;
    return acc;
  }, {} as Record<ServiceStatus, number>);
  
  const statusChartData = SERVICE_STATUSES.map(status => ({
      name: STATUS_LABELS_ES[status],
      value: servicesByStatus[status] || 0,
      color: STATUS_HEX_COLORS[status],
  })).filter(item => item.value > 0);
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Do not render labels for very small slices to avoid clutter
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold pointer-events-none"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // 4. Workload per technician
  const technicianWorkload = users.filter(u => u.role === UserRole.TECHNICIAN).map(tech => ({
      name: tech.firstName,
      servicios: services.filter(s => s.technician.id === tech.id && s.status !== ServiceStatus.COMPLETED && s.status !== ServiceStatus.CANCELED).length
  }));
  
  // 5. Recent Activity
  const lowStockItems = inventory.filter(item => item.quantity <= 2);
  const recentServices = [...services].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Panel de Control
        </h1>
        <p className="text-brand-text-dark mt-1">Un resumen del estado actual de tu negocio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="xl:col-span-1"><StatCard title="Pendientes" value={pendingServices} icon={<ClockIcon className="h-6 w-6 text-brand-orange" />} /></div>
        <div className="xl:col-span-1"><StatCard title="Repuestos" value={awaitingPartsServices} icon={<PackageIcon className="h-6 w-6 text-brand-orange" />} /></div>
        <div className="xl:col-span-2"><StatCard title="Ingresos (Mes)" value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(monthlyIncome)} icon={<BanknotesIcon className="h-6 w-6 text-brand-orange" />} /></div>
        <div className="xl:col-span-1"><StatCard title="Nuevos Clientes (Mes)" value={newClientsThisMonth} icon={<ClientsIcon className="h-6 w-6 text-brand-orange" />} /></div>
        <div className="xl:col-span-1"><StatCard title="Completados (Mes)" value={completedServicesThisMonth} icon={<CheckCircleIcon className="h-6 w-6 text-brand-orange" />} /></div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <div className="xl:col-span-3 bg-brand-bg-light p-6 rounded-lg shadow-lg border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4">Rendimiento Mensual (Últimos 6 Meses)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="#A0A0A0" tick={{fill: '#A0A0A0', fontSize: 12}} />
              <YAxis stroke="#A0A0A0" allowDecimals={false} label={{ value: 'Servicios', angle: -90, position: 'insideLeft', fill: '#A0A0A0', style: {fontSize: '14px'} }} tick={{fill: '#A0A0A0', fontSize: 12}}/>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }} 
                labelStyle={{ color: '#E0E0E0' }}
              />
              <Legend wrapperStyle={{fontSize: "14px"}}/>
              <Line type="monotone" name={STATUS_LABELS_ES.PENDING} dataKey={STATUS_LABELS_ES.PENDING} stroke={STATUS_HEX_COLORS.PENDING} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name={STATUS_LABELS_ES.IN_PROGRESS} dataKey={STATUS_LABELS_ES.IN_PROGRESS} stroke={STATUS_HEX_COLORS.IN_PROGRESS} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name={STATUS_LABELS_ES.AWAITING_PARTS} dataKey={STATUS_LABELS_ES.AWAITING_PARTS} stroke={STATUS_HEX_COLORS.AWAITING_PARTS} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name={STATUS_LABELS_ES.COMPLETED} dataKey={STATUS_LABELS_ES.COMPLETED} stroke={STATUS_HEX_COLORS.COMPLETED} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name={STATUS_LABELS_ES.CANCELED} dataKey={STATUS_LABELS_ES.CANCELED} stroke={STATUS_HEX_COLORS.CANCELED} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="xl:col-span-1 bg-brand-bg-light p-6 rounded-lg shadow-lg border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Distribución de Estados</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie 
                      data={statusChartData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={85} 
                      fill="#8884d8" 
                      paddingAngle={5}
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                        {statusChartData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }} itemStyle={{ color: '#E0E0E0' }}/>
                    <Legend iconSize={10} wrapperStyle={{fontSize: "12px", paddingTop: "20px"}}/>
                </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="xl:col-span-1 bg-brand-bg-light p-6 rounded-lg shadow-lg border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4">Carga de Trabajo (Activos)</h2>
           <ResponsiveContainer width="100%" height={300}>
                <BarChart data={technicianWorkload} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis type="number" stroke="#A0A0A0" tick={{fill: '#A0A0A0', fontSize: 12}} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#A0A0A0" width={80} tick={{fill: '#A0A0A0', fontSize: 12}}/>
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333' }} labelStyle={{ color: '#E0E0E0' }}/>
                    <Bar dataKey="servicios" fill="#FF5B22" radius={[0, 4, 4, 0]} barSize={20} name="Servicios" />
                </BarChart>
            </ResponsiveContainer>
        </div>

         <div className="xl:col-span-1 bg-brand-bg-light p-6 rounded-lg shadow-lg border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-brand-orange mb-2">ÚLTIMAS ÓRDENES</h3>
                    <ul className="space-y-2">
                        {recentServices.map(s => (
                            <li key={s.id} className="text-sm text-brand-text-dark flex justify-between">
                                <span className="truncate pr-2">{s.client.firstName} - {s.applianceName}</span>
                                <span className={`font-mono text-xs ${STATUS_COLORS[s.status].split(' ')[1]}`}>{STATUS_LABELS_ES[s.status]}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-sm font-semibold text-brand-orange mb-2">ALERTAS DE INVENTARIO</h3>
                     <ul className="space-y-2">
                        {lowStockItems.length > 0 ? lowStockItems.slice(0, 5).map(i => (
                            <li key={i.id} className="text-sm text-brand-text-dark flex justify-between">
                                <span className="truncate pr-2">{i.name}</span>
                                <span className="font-bold text-red-500">{i.quantity} en stock</span>
                            </li>
                        )) : <p className="text-sm text-brand-text-dark">No hay alertas.</p>}
                    </ul>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
