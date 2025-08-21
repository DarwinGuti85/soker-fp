
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { User, UserRole, CompanyInfo, Module, PermissionSet } from '../types';
import { ROLE_LABELS_ES, USER_ROLES, MODULES, MODULE_LABELS_ES } from '../constants';
import { CloseIcon, EditIcon, TrashIcon, SaveIcon } from './ui/icons';

const UserFormView: React.FC<{
  onClose: () => void;
  onSave: (userData: Omit<User, 'id'>, id?: string) => void;
  selectedUser: User | null;
}> = ({ onClose, onSave, selectedUser }) => {
  const initialUserState: Omit<User, 'id'> = { username: '', firstName: '', lastName: '', email: '', role: UserRole.CASHIER, password: '' };
  const [userFormData, setUserFormData] = useState(selectedUser ? { ...selectedUser, password: '' } : initialUserState);

  React.useEffect(() => {
    setUserFormData(selectedUser ? { ...selectedUser, password: '' } : initialUserState);
  }, [selectedUser]);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.firstName || !userFormData.lastName || !userFormData.username || !userFormData.email || !userFormData.role) {
      alert("Todos los campos excepto la contraseña (al editar) son requeridos.");
      return;
    }
    
    if (!selectedUser && (!userFormData.password || userFormData.password.length < 4)) {
      alert("La contraseña es requerida y debe tener al menos 4 caracteres.");
      return;
    }
    onSave(userFormData, selectedUser?.id);
  };

  return (
    <div className="bg-brand-orange/10 dark:bg-brand-bg-light rounded-lg shadow-lg border border-brand-orange/30 dark:border-gray-700/50 animate-fadeInUp">
        <div className="px-6 py-4 border-b border-brand-orange/20 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h2>
            <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">Volver a Ajustes</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-brand-text-dark">Nombres</label>
              <input type="text" id="firstName" name="firstName" value={userFormData.firstName} onChange={handleFormChange} className="mt-1 w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
            </div>
             <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-brand-text-dark">Apellidos</label>
              <input type="text" id="lastName" name="lastName" value={userFormData.lastName} onChange={handleFormChange} className="mt-1 w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-brand-text-dark">Nombre de Usuario</label>
              <input type="text" id="username" name="username" value={userFormData.username} onChange={handleFormChange} className="mt-1 w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-text-dark">Email</label>
              <input type="email" id="email" name="email" value={userFormData.email} onChange={handleFormChange} className="mt-1 w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required />
            </div>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-brand-text-dark">Rol</label>
            <select id="role" name="role" value={userFormData.role} onChange={handleFormChange} className="mt-1 w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange">
              {USER_ROLES.map(role => <option key={role} value={role}>{ROLE_LABELS_ES[role]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-text-dark">{selectedUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</label>
            <input type="password" id="password" name="password" value={userFormData.password || ''} onChange={handleFormChange} className="mt-1 w-full bg-brand-bg-dark border border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required={!selectedUser} />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
            <button type="submit" className="bg-brand-orange text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">Guardar</button>
          </div>
        </form>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
}> = ({ isOpen, onClose, onConfirm, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
      <div className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-md">
        <div className="p-6 text-center">
          <TrashIcon className="h-12 w-12 mx-auto text-red-500" />
          <h3 className="mt-4 text-xl font-bold text-white">¿Estás seguro?</h3>
          <p className="mt-2 text-sm text-brand-text-dark">
            Estás a punto de eliminar al usuario <span className="font-bold text-brand-text">{user.firstName} {user.lastName}</span>. Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <button onClick={onClose} type="button" className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
            <button onClick={onConfirm} type="button" className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-500 transition-colors">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PermissionsManager: React.FC = () => {
    const { permissions, updatePermissions } = useAuth();
    const editableRoles = USER_ROLES.filter(role => role !== UserRole.ADMIN) as Exclude<UserRole, UserRole.ADMIN>[];

    const handlePermissionChange = (role: Exclude<UserRole, UserRole.ADMIN>, module: Module, permission: keyof PermissionSet, checked: boolean) => {
        updatePermissions(role, module, permission, checked);
    };

    return (
        <div className="bg-brand-orange/10 dark:bg-brand-bg-light rounded-lg shadow-lg border border-brand-orange/30 dark:border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Gestión de Permisos</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-orange/20 dark:divide-gray-700">
                    <thead className="bg-black/5 dark:bg-gray-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Módulo</th>
                            {editableRoles.map(role => (
                                <th key={role} scope="col" colSpan={3} className="px-6 py-3 text-center text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider border-l border-brand-orange/20 dark:border-gray-700">{ROLE_LABELS_ES[role]}</th>
                            ))}
                        </tr>
                        <tr>
                            <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider"></th>
                            {editableRoles.map(role => (
                                <React.Fragment key={role}>
                                    <th scope="col" className="py-2 text-center text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider border-l border-brand-orange/20 dark:border-gray-700">Ver</th>
                                    <th scope="col" className="py-2 text-center text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Editar</th>
                                    <th scope="col" className="py-2 text-center text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Elim.</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-orange/20 dark:divide-gray-700">
                        {MODULES.map(module => (
                            <tr key={module} className="hover:bg-brand-orange/20 dark:hover:bg-gray-800/40">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-brand-text">{MODULE_LABELS_ES[module]}</td>
                                {editableRoles.map(role => (
                                    <React.Fragment key={role}>
                                        {(['view', 'edit', 'delete'] as const).map(permission => (
                                            <td key={`${role}-${module}-${permission}`} className="px-6 py-4 whitespace-nowrap text-center text-sm border-l border-brand-orange/20 dark:border-gray-700">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded bg-gray-100 dark:bg-brand-bg-dark border-gray-400 dark:border-gray-600 text-brand-orange focus:ring-brand-orange"
                                                    checked={permissions[role]?.[module]?.[permission] ?? false}
                                                    onChange={(e) => handlePermissionChange(role, module, permission, e.target.checked)}
                                                    disabled={module === 'dashboard' && permission !== 'view'}
                                                />
                                            </td>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-gray-500 dark:text-brand-text-dark mt-4 italic">El rol de Administrador tiene todos los permisos por defecto y no puede ser modificado.</p>
        </div>
    );
};


const Settings: React.FC = () => {
    const { user: currentUser, users, addUser, updateUser, deleteUser, hasPermission } = useAuth();
    const { companyInfo, updateCompanyInfo } = useData();
  
    const [isUserFormVisible, setIsUserFormVisible] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [companyForm, setCompanyForm] = useState<CompanyInfo>(companyInfo);
    const [showCompanySuccess, setShowCompanySuccess] = useState(false);
    
    useEffect(() => {
        setCompanyForm(companyInfo);
    }, [companyInfo]);

    const handleCompanyInfoSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateCompanyInfo(companyForm);
        setShowCompanySuccess(true);
        setTimeout(() => setShowCompanySuccess(false), 2500);
    };
    
    const handleCompanyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCompanyForm(prev => ({...prev, [name]: value}));
    };

    const roleColors: Record<UserRole, string> = {
        [UserRole.ADMIN]: 'bg-red-500/20 text-red-400',
        [UserRole.CASHIER]: 'bg-blue-500/20 text-blue-400',
        [UserRole.TECHNICIAN]: 'bg-green-500/20 text-green-400',
    };

    const openAddUserForm = () => {
        setSelectedUser(null);
        setIsUserFormVisible(true);
    };

    const openEditUserForm = (user: User) => {
        setSelectedUser(user);
        setIsUserFormVisible(true);
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };
  
    const closeForms = () => {
        setIsUserFormVisible(false);
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
    };
  
    const handleSaveUser = (userData: Omit<User, 'id'>, id?: string) => {
        if (id) {
            const userToUpdate: User = { id, ...userData };
            updateUser(userToUpdate);
        } else {
            addUser(userData);
        }
        closeForms();
    };
  
    const handleDelete = () => {
        if (selectedUser) {
            deleteUser(selectedUser.id);
            closeForms();
        }
    };

    const canEditUsers = hasPermission('users', 'edit');
    const canDeleteUsers = hasPermission('users', 'delete');

    if(isUserFormVisible){
        return <UserFormView 
            onClose={closeForms}
            onSave={handleSaveUser}
            selectedUser={selectedUser}
        />
    }

    return (
        <div className="space-y-8">
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeForms}
                onConfirm={handleDelete}
                user={selectedUser}
            />

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ajustes del Sistema</h1>
            </div>
            
            <div className="bg-brand-orange/10 dark:bg-brand-bg-light rounded-lg shadow-lg border border-brand-orange/30 dark:border-gray-700/50 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Información de la Empresa</h2>
                <form onSubmit={handleCompanyInfoSave} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-brand-text-dark">Nombre / Razón Social</label>
                        <input type="text" name="name" id="name" value={companyForm.name} onChange={handleCompanyFormChange} className="mt-1 w-full bg-gray-50 dark:bg-brand-bg-dark border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required/>
                    </div>
                     <div>
                        <label htmlFor="taxId" className="block text-sm font-medium text-gray-600 dark:text-brand-text-dark">RIF</label>
                        <input type="text" name="taxId" id="taxId" value={companyForm.taxId} onChange={handleCompanyFormChange} className="mt-1 w-full bg-gray-50 dark:bg-brand-bg-dark border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required/>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-600 dark:text-brand-text-dark">Dirección Fiscal</label>
                        <input type="text" name="address" id="address" value={companyForm.address} onChange={handleCompanyFormChange} className="mt-1 w-full bg-gray-50 dark:bg-brand-bg-dark border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                           <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-brand-text-dark">Email de Contacto</label>
                           <input type="email" name="email" id="email" value={companyForm.email} onChange={handleCompanyFormChange} className="mt-1 w-full bg-gray-50 dark:bg-brand-bg-dark border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required/>
                       </div>
                       <div>
                           <label htmlFor="phone" className="block text-sm font-medium text-gray-600 dark:text-brand-text-dark">Teléfono de Contacto</label>
                           <input type="tel" name="phone" id="phone" value={companyForm.phone} onChange={handleCompanyFormChange} className="mt-1 w-full bg-gray-50 dark:bg-brand-bg-dark border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-brand-orange focus:border-brand-orange" required/>
                       </div>
                    </div>
                     <div className="flex items-center gap-4 pt-2">
                       <button type="submit" className="bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2">
                           <SaveIcon className="h-4 w-4" />
                           Guardar Información
                       </button>
                       {showCompanySuccess && <p className="text-green-400 text-sm animate-pulseGlow">¡Guardado con éxito!</p>}
                    </div>
                </form>
            </div>
            
            <PermissionsManager />

            {hasPermission('users', 'view') && (
            <div className="bg-brand-orange/10 dark:bg-brand-bg-light rounded-lg shadow-lg border border-brand-orange/30 dark:border-gray-700/50 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
                    {canEditUsers && (
                        <button onClick={openAddUserForm} className="bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">
                            Añadir Nuevo Usuario
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-orange/20 dark:divide-gray-700">
                        <thead className="bg-black/5 dark:bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Nombre Completo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Usuario</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Rol</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-brand-text-dark uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-orange/20 dark:divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-brand-orange/20 dark:hover:bg-gray-800/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-brand-text">{user.firstName} {user.lastName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-brand-text-dark font-mono">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-brand-text-dark">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}`}>
                                            {ROLE_LABELS_ES[user.role]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                        <div className="flex items-center space-x-4">
                                            {canEditUsers && <button onClick={() => openEditUserForm(user)} className="text-brand-orange hover:text-orange-400 transition-colors"><EditIcon className="w-5 h-5"/></button>}
                                            {canDeleteUsers && <button onClick={() => openDeleteModal(user)} disabled={currentUser?.id === user.id} className="text-red-500 hover:text-red-400 transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"><TrashIcon className="w-5 h-5"/></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
        </div>
    );
};

export default Settings;
