
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { InventoryItem } from '../types';
import { CloseIcon, EditIcon } from './ui/icons';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

// Component for individual chart panels
const ChartPanel: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-brand-orange/10 dark:bg-brand-bg-light p-4 rounded-lg shadow-lg border border-brand-orange/30 dark:border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div style={{ width: '100%', height: 250 }}>
            {children}
        </div>
    </div>
);

const ItemModal: React.FC<{
    editingItem: InventoryItem | null;
    onClose: () => void;
    onSave: (itemData: Omit<InventoryItem, 'id'>, id?:string) => void;
}> = ({ editingItem, onClose, onSave }) => {
    const initialFormState: Omit<InventoryItem, 'id'> = { name: '', sku: '', quantity: 0, price: 0 };
    const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>(
        editingItem ? { ...editingItem } : initialFormState
    );

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.sku) {
            alert('Nombre y SKU son requeridos.');
            return;
        }
        onSave(formData, editingItem?.id);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-lg">
                <div className="sticky top-0 bg-brand-bg-light z-10 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">{editingItem ? 'Editar Artículo' : 'Añadir Nuevo Artículo'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-brand-text-dark">Nombre del Artículo</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="sku" className="block text-sm font-medium text-brand-text-dark">SKU</label>
                        <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleFormChange} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="quantity" className="block text-sm font-medium text-brand-text-dark">Cantidad</label>
                            <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleFormChange} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required min="0" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="price" className="block text-sm font-medium text-brand-text-dark">Precio</label>
                            <input type="number" id="price" name="price" value={formData.price} onChange={handleFormChange} className="w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required min="0" step="any" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-brand-orange text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Inventory: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem } = useData();
  const { hasPermission } = useAuth();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState('');

  const axisColor = theme === 'dark' ? '#A0A0A0' : '#6B7280';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const tooltipStyle = { 
      backgroundColor: theme === 'dark' ? '#1A1A1A' : '#FFFFFF', 
      borderColor: theme === 'dark' ? '#333' : '#CCC',
      color: theme === 'dark' ? '#E0E0E0' : '#333'
  };

  const filteredItems = useMemo(() => {
    if (!filter) return inventory;
    return inventory.filter(item => 
        item.name.toLowerCase().includes(filter.toLowerCase()) || 
        item.sku.toLowerCase().includes(filter.toLowerCase())
    );
  }, [inventory, filter]);

  // Chart Data Calculations
  const chartData = useMemo(() => {
    // 1. Stock Distribution
    const stockStatus = {
        inStock: inventory.filter(i => i.quantity > 5).length,
        lowStock: inventory.filter(i => i.quantity > 0 && i.quantity <= 5).length,
        outOfStock: inventory.filter(i => i.quantity === 0).length,
    };
    const stockDistributionData = [
        { name: 'En Stock (>5)', value: stockStatus.inStock, color: '#22c55e' },
        { name: 'Stock Bajo (1-5)', value: stockStatus.lowStock, color: '#f59e0b' },
        { name: 'Sin Stock', value: stockStatus.outOfStock, color: '#ef4444' },
    ];

    // 2. Top 5 Most Valuable Items
    const topValuableItems = [...inventory]
        .map(item => ({ name: item.name, 'Valor Total': item.price * item.quantity }))
        .sort((a, b) => b['Valor Total'] - a['Valor Total'])
        .slice(0, 5);
        
    // 3. Items by Quantity Range
    const quantityRanges = {
        '0': inventory.filter(i => i.quantity === 0).length,
        '1-10': inventory.filter(i => i.quantity >= 1 && i.quantity <= 10).length,
        '11-25': inventory.filter(i => i.quantity >= 11 && i.quantity <= 25).length,
        '26+': inventory.filter(i => i.quantity > 25).length,
    };
    const quantityRangeData = [
        { name: '0', Cantidad: quantityRanges['0'] },
        { name: '1-10', Cantidad: quantityRanges['1-10'] },
        { name: '11-25', Cantidad: quantityRanges['11-25'] },
        { name: '26+', Cantidad: quantityRanges['26+'] },
    ];

    return { stockDistributionData, topValuableItems, quantityRangeData };
  }, [inventory]);


  const handleOpenModal = (item: InventoryItem | null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };
  
  const handleSaveItem = (itemData: Omit<InventoryItem, 'id'>, id?: string) => {
    if (id) {
        updateInventoryItem(id, itemData);
    } else {
        addInventoryItem(itemData);
    }
    handleCloseModal();
  };

  const canEdit = hasPermission('inventory', 'edit');

  return (
    <div className="space-y-6">
      {isModalOpen && canEdit && <ItemModal editingItem={editingItem} onClose={handleCloseModal} onSave={handleSaveItem} />}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventario</h1>
        {canEdit && (
            <button onClick={() => handleOpenModal(null)} className="bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">
            Añadir Nuevo Artículo
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Filters and Table */}
        <div className="lg:col-span-2 space-y-4">
            <input 
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full bg-white dark:bg-brand-bg-light border border-gray-300 dark:border-gray-700 rounded-md p-2.5 text-gray-900 dark:text-brand-text focus:ring-brand-orange focus:border-brand-orange"
            />
            <div className="bg-brand-orange/10 dark:bg-brand-bg-light rounded-lg shadow-lg border border-brand-orange/30 dark:border-gray-700/50 overflow-hidden">
                <div className="overflow-y-auto h-[calc(100vh-280px)] custom-scrollbar">
                    <table className="min-w-full divide-y divide-brand-orange/20 dark:divide-gray-700">
                        <thead className="bg-black/5 dark:bg-gray-800/50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Nombre del Artículo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">SKU</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Cantidad</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Precio</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="dark:bg-brand-bg-light divide-y divide-brand-orange/20 dark:divide-gray-700">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-brand-orange/20 dark:hover:bg-gray-800/40 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-brand-text">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-brand-text-dark font-mono">{item.sku}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${item.quantity > 5 ? 'text-green-500' : item.quantity > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-brand-text-dark">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(item.price)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                {canEdit ? (
                                    <button onClick={() => handleOpenModal(item)} className="text-brand-orange hover:text-orange-400 transition-colors">
                                        <EditIcon className="w-5 h-5"/>
                                    </button>
                                ) : (
                                    <span className="text-gray-500">-</span>
                                )}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Sidebar: Charts */}
        <div className="lg:col-span-1 space-y-6">
            <ChartPanel title="Distribución de Stock">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData.stockDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                             {chartData.stockDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle}/>
                        <Legend iconSize={10} wrapperStyle={{fontSize: "12px", paddingTop: "20px", color: axisColor}}/>
                    </PieChart>
                </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Top 5 Artículos Más Valiosos">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.topValuableItems} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis type="number" stroke={axisColor} tick={{fill: axisColor, fontSize: 10}} tickFormatter={(value) => new Intl.NumberFormat('es-CO', { notation: 'compact', compactDisplay: 'short' }).format(value as number)}/>
                        <YAxis type="category" dataKey="name" stroke={axisColor} width={80} tick={{fill: axisColor, fontSize: 10}} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(value) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(value as number)} contentStyle={tooltipStyle}/>
                        <Bar dataKey="Valor Total" fill="#FF5B22" radius={[0, 4, 4, 0]} barSize={15} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPanel>

             <ChartPanel title="Artículos por Cantidad">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.quantityRangeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="name" stroke={axisColor} tick={{fill: axisColor, fontSize: 12}} />
                        <YAxis stroke={axisColor} allowDecimals={false} tick={{fill: axisColor, fontSize: 12}}/>
                        <Tooltip contentStyle={tooltipStyle}/>
                        <Bar dataKey="Cantidad" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartPanel>
        </div>
      </div>
      <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
          .dark .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #FF5B22; border-radius: 10px; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4A4A4A; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6A6A6A; }
      `}</style>
    </div>
  );
};

export default Inventory;
