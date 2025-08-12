import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, UserRole, Permissions, Module, PermissionSet } from '../types';
import { MOCK_USERS } from '../data/mockData';

const initialPermissions: Permissions = {
  [UserRole.CASHIER]: {
    dashboard: { view: true, edit: false, delete: false },
    services: { view: true, edit: true, delete: false },
    clients: { view: true, edit: true, delete: false },
    billing: { view: true, edit: true, delete: false },
    inventory: { view: true, edit: false, delete: false },
    settings: { view: false, edit: false, delete: false },
    users: { view: false, edit: false, delete: false },
    ai: { view: true, edit: true, delete: false },
  },
  [UserRole.TECHNICIAN]: {
    dashboard: { view: true, edit: false, delete: false },
    services: { view: true, edit: true, delete: false },
    clients: { view: true, edit: false, delete: false },
    billing: { view: false, edit: false, delete: false },
    inventory: { view: true, edit: true, delete: false },
    settings: { view: false, edit: false, delete: false },
    users: { view: false, edit: false, delete: false },
    ai: { view: false, edit: false, delete: false },
  },
};

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (emailOrUsername: string, password: string) => Promise<User | null>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  permissions: Permissions;
  updatePermissions: (role: Exclude<UserRole, UserRole.ADMIN>, module: Module, permission: keyof PermissionSet, value: boolean) => void;
  hasPermission: (module: Module, permission: keyof PermissionSet) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [permissions, setPermissions] = useState<Permissions>(initialPermissions);

  const login = useCallback(async (emailOrUsername: string, password: string): Promise<User | null> => {
    const normalizedInput = emailOrUsername.toLowerCase().trim();
    
    const targetUser = users.find(
      u => u.email.toLowerCase() === normalizedInput || u.username.toLowerCase() === normalizedInput
    );

    // Check if user exists and password matches
    if (targetUser && targetUser.password === password) {
      setCurrentUser(targetUser);
      return targetUser;
    }

    return null;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);
  
  const addUser = useCallback((newUser: Omit<User, 'id' | 'password'> & { password?: string }) => {
    const userToAdd: User = { 
      ...newUser, 
      id: `user-${Date.now()}`,
      password: newUser.password 
    };
    setUsers(prev => [...prev, userToAdd]);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => {
        if (u.id === updatedUser.id) {
            const finalUpdatedUser = { ...u, ...updatedUser };
            if (!updatedUser.password || updatedUser.password.trim() === '') {
                finalUpdatedUser.password = u.password;
            }
            return finalUpdatedUser;
        }
        return u;
    }));
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const updatePermissions = useCallback((
    role: Exclude<UserRole, UserRole.ADMIN>, 
    module: Module, 
    permission: keyof PermissionSet, 
    value: boolean
  ) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role][module],
          [permission]: value,
        },
      },
    }));
  }, []);

  const hasPermission = useCallback((module: Module, permission: keyof PermissionSet): boolean => {
      if (!currentUser) return false;
      if (currentUser.role === UserRole.ADMIN) return true;
      
      return permissions[currentUser.role]?.[module]?.[permission] ?? false;
  }, [permissions, currentUser]);


  return (
    <AuthContext.Provider value={{ user: currentUser, users, login, logout, addUser, updateUser, deleteUser, permissions, updatePermissions, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};