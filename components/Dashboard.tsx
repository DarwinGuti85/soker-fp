
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { ServiceStatus, InvoiceStatus } from '../types';
import { useData } from '../hooks/useData';
import { useTheme } from '../hooks/useTheme';
import { INVOICE_STATUS_LABELS_ES, INVOICE_STATUSES, INVOICE_STATUS_HEX_COLORS } from '../constants';
import { BanknotesIcon, ServicesIcon, CheckCircleIcon, ClientsIcon, ClockIcon } from './ui/icons';

const KPI_Card: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
  <div className="bg-brand-orange/10 dark:bg-brand-bg-light p-5 rounded-lg shadow-md dark:shadow-lg border border-brand-orange/30 dark:border-gray-700/50 flex flex-col justify-between animate-fadeInUp">
    <div className="flex justify-between items-center">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-brand-text-dark uppercase tracking-wider">{title}</h3>
      <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-')}/20`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: `h-6 w-6 ${colorClass}` }) : icon}
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
  </div>
);

const ChartPanel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-brand-orange/10 dark:bg-brand-bg-light p-6 rounded-lg shadow-md dark:shadow-lg border border-brand-orange/30 dark:border-gray-700/50 animate-fadeInUp ${className}`}>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
    <div className="h-72">
      {children}
    </div>
  </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-brand-bg-dark/80 backdrop-blur-sm p-3 rounded-md border border-gray-300 dark:border-gray-600">
          <p className="label text-gray-900 dark:text-white font-bold">{`${label}`}</p>
          {payload.map((p: any, index: number) => (
             <p key={index} style={{ color: p.color || p.fill }}>{`${p.name}: ${p.dataKey === 'Ingresos' ? new Intl.NumberFormat('es-VE', {style: 'currency', currency: 'VES', minimumFractionDigits: 0}).format(p.value) : p.value.toLocaleString('es-VE')}`}</p>
          ))}
        </div>
      );
    }
    return null;
  };

const RADIAN = Math.PI / 180;

const Dashboard: React.FC = () => {
  const { services, clients, invoices } = useData();
  const { theme } = useTheme();

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill={theme === 'dark' ? 'white' : '#333'} textAnchor="middle" dominantBaseline="central" className="text-xs font-bold pointer-events-none">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const axisColor = theme === 'dark' ? '#A0A0A0' : '#6B7280';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  // --- Data Processing ---
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyIncome = invoices
    .filter(i => new Date(i.issueDate) >= startOfMonth)
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  const newServicesThisMonth = services
    .filter(s => new Date(s.createdAt) >= startOfMonth)
    .length;
  
  const completedServicesThisMonth = services
    .filter(s => s.status === ServiceStatus.COMPLETED && new Date(s.updatedAt) >= startOfMonth)
    .length;
  
  const newClientsThisMonth = clients
    .filter(c => new Date(c.createdAt) >= startOfMonth)
    .length;
    
  const totalPendingServices = services.filter(s => s.status === ServiceStatus.PENDING).length;

  const monthlyIncomeData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth();
    const year = d.getFullYear();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    end.setHours(23, 59, 59, 999);
    
    const total = invoices
      .filter(inv => {
        const issueDate = new Date(inv.issueDate);
        return issueDate >= start && issueDate <= end;
      })
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
      
    return {
      name: d.toLocaleString('es-ES', { month: 'short' }).replace('.', '').toUpperCase(),
      Ingresos: total,
    };
  }).reverse();

  const invoicesByStatus = invoices.reduce((acc, invoice) => {
    acc[invoice.status] = (acc[invoice.status] || 0) + 1;
    return acc;
  }, {} as Record<InvoiceStatus, number>);

  const invoiceStatusChartData = INVOICE_STATUSES.map(status => ({
    name: INVOICE_STATUS_LABELS_ES[status],
    value: invoicesByStatus[status] || 0,
    color: INVOICE_STATUS_HEX_COLORS[status],
  })).filter(item => item.value > 0);


  const servicesByAppliance = services.reduce((acc, service) => {
    const name = service.applianceName;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const applianceChartData = Object.entries(servicesByAppliance)
    .map(([name, count]) => ({ name, servicios: count as number }))
    .sort((a, b) => b.servicios - a.servicios)
    .slice(0, 7)
    .reverse();

  const today = new Date();
  const weeklyActivityData = Array.from({ length: 4 }).map((_, i) => {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() - (i * 7));
      const startOfWeek = new Date(endOfWeek);
      startOfWeek.setDate(endOfWeek.getDate() - 6);
      
      startOfWeek.setHours(0, 0, 0, 0);
      endOfWeek.setHours(23, 59, 59, 999);

      const count = services.filter(s => {
          const createdAt = new Date(s.createdAt);
          return createdAt >= startOfWeek && createdAt <= endOfWeek;
      }).length;
      
      return {
          name: `Semana ${4 - i}`,
          servicios: count
      };
  }).reverse();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard de Ventas</h1>
        <p className="text-gray-500 dark:text-brand-text-dark mt-1">Vista general de los indicadores más importantes.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPI_Card 
            title="Ingresos del Mes" 
            value={new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES', minimumFractionDigits: 0 }).format(monthlyIncome)} 
            icon={<BanknotesIcon />}
            colorClass="text-green-400"
        />
        <KPI_Card 
            title="Nuevos Servicios (Mes)" 
            value={newServicesThisMonth}
            icon={<ServicesIcon />}
            colorClass="text-blue-400"
        />
        <KPI_Card 
            title="Completados (Mes)" 
            value={completedServicesThisMonth}
            icon={<CheckCircleIcon />}
            colorClass="text-brand-orange"
        />
        <KPI_Card 
            title="Nuevos Clientes (Mes)" 
            value={newClientsThisMonth}
            icon={<ClientsIcon />}
            colorClass="text-purple-400"
        />
        <KPI_Card 
            title="Servicios Pendientes" 
            value={totalPendingServices}
            icon={<ClockIcon />}
            colorClass="text-yellow-400"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPanel title="Ingresos Mensuales (Últimos 6 Meses)" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyIncomeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('es-VE', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 91, 34, 0.1)' }} />
              <Bar dataKey="Ingresos" fill="#FF5B22" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        
        <ChartPanel title="Estado de Facturas" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={invoiceStatusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} fill="#8884d8" paddingAngle={5} labelLine={false} label={renderCustomizedLabel}>
                {invoiceStatusChartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{fontSize: "12px", paddingTop: "20px", color: axisColor}}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
        
        <ChartPanel title="Top 7 Tipos de Artefacto" className="lg:col-span-1">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={applianceChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke={axisColor} width={90} tick={{ fill: axisColor, fontSize: 12 }} tickLine={false} axisLine={false} interval={0} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 91, 34, 0.1)' }} />
              <Bar dataKey="servicios" name="Servicios" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Actividad de Servicios (Últimas 4 Semanas)" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyActivityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                  <linearGradient id="colorServicios" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5B22" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF5B22" stopOpacity={0}/>
                  </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="servicios" name="Servicios" stroke="#FF5B22" fillOpacity={1} fill="url(#colorServicios)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </div>
  );
};

export default Dashboard;
