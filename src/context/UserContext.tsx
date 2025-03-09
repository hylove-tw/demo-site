// src/context/UserContext.tsx
import React, { createContext, useContext, PropsWithChildren } from 'react';
import { useUserManager, User } from '../hooks/useUserManager';

export interface UserContextType {
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  removeUser: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const userManager = useUserManager();
  return (
    <UserContext.Provider value={userManager}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext 必須在 UserProvider 內使用');
  }
  return context;
};