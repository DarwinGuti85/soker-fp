import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, UserRole } from '../types';
import { ROLE_LABELS_ES, USER_ROLES } from '../constants';
import { CloseIcon, EditIcon, TrashIcon } from './ui/icons';

const Users: React.FC = () => {
  const { user: currentUser, users, addUser, updateUser, deleteUser } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const initialUserState: Omit<User, 'id'> = { username: '', firstName: '', lastName: '', email: '', role: UserRole.CASHIER, password: '' };
  const [userFormData, setUserFormData] = useState(initialUserState);

  const roleColors: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'bg-red-500/20 text-red-400',
    [UserRole.CASHIER]: 'bg-blue-500/20 text-blue-400',
    [UserRole.TECHNICIAN]: 'bg-green-500/20 text-green-400',
  };

  const openAddModal = () => {
    setSelectedUser(null);
    setUserFormData(initialUserState);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setUserFormData({ ...user, password: '' });
    setIsModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };
  
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
    
    if (selectedUser) { // Editing
      const userToUpdate: User = { 
        ...selectedUser, 
        ...userFormData 
      };
      // For this mock app, password update is not handled post-creation
      // A real app would hash userFormData.password if it's not empty.
      updateUser(userToUpdate);
    } else { // Adding
       if (!userFormData.password || userFormData.password.length < 4) {
        alert("La contraseña es requerida y debe tener al menos 4 caracteres.");
        return;
      }
      addUser(userFormData);
    }
    closeModal();
  };
  
  const handleDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      closeModal();
    }
  };

  const UserModal = () => (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
      <div className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{selectedUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-white"><CloseIcon className="h-6 w-6" /></button>
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
            <button type="button" onClick={closeModal} className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
            <button type="submit" className="bg-brand-orange text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteConfirmationModal = () => (
     <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
      <div className="bg-brand-bg-light rounded-lg shadow-2xl border border-gray-700/50 w-full max-w-md">
         <div className="p-6 text-center">
            <TrashIcon className="h-12 w-12 mx-auto text-red-500" />
            <h3 className="mt-4 text-xl font-bold text-white">¿Estás seguro?</h3>
            <p className="mt-2 text-sm text-brand-text-dark">
              Estás a punto de eliminar al usuario <span className="font-bold text-brand-text">{selectedUser?.firstName} {selectedUser?.lastName}</span>. Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
                <button onClick={closeModal} type="button" className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
                <button onClick={handleDelete} type="button" className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-500 transition-colors">Eliminar</button>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {isModalOpen && <UserModal />}
      {isDeleteModalOpen && <DeleteConfirmationModal />}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
        <button onClick={openAddModal} className="bg-brand-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">
          Añadir Nuevo Usuario
        </button>
      </div>

      <div className="bg-brand-bg-light rounded-lg shadow-lg border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Nombre Completo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Usuario</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Rol</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-dark uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-brand-bg-light divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-text">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dark font-mono">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-dark">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}`}>
                      {ROLE_LABELS_ES[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <div className="flex items-center space-x-4">
                      <button onClick={() => openEditModal(user)} className="text-brand-orange hover:text-orange-400 transition-colors"><EditIcon className="w-5 h-5"/></button>
                      <button onClick={() => openDeleteModal(user)} disabled={currentUser?.id === user.id} className="text-red-500 hover:text-red-400 transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;