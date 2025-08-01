import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (emailOrUsername: string, password: string) => Promise<User | null>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

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
      // In a real app, hash the password here. For this mock, we just add it for creation logic.
      password: newUser.password 
    };
    setUsers(prev => [...prev, userToAdd]);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => {
        if (u.id === updatedUser.id) {
            const finalUpdatedUser = { ...u, ...updatedUser };

            // If a new password wasn't provided in the form (it comes as empty string),
            // keep the old password. Otherwise, update it.
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


  return (
    <AuthContext.Provider value={{ user: currentUser, users, login, logout, addUser, updateUser, deleteUser }}>
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