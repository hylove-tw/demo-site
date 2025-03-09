// src/hooks/useUserManager.ts
import { useState, useEffect } from 'react';

export enum UserRole {
  Admin = '管理者',
  Basic = '一般使用者',
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  company: {
    name: string;
    address: string;
    id: string;
    phone: string;
    fax: string;
  };
}

const USER_LIST_KEY = 'userList';
const CURRENT_USER_KEY = 'currentUser';

function loadUsers(): User[] {
  const stored = localStorage.getItem(USER_LIST_KEY);
  return stored ? (JSON.parse(stored) as User[]) : [];
}

function loadCurrentUser(initialUsers: User[]): User | null {
  const storedCurrent = localStorage.getItem(CURRENT_USER_KEY);
  if (storedCurrent) {
    return JSON.parse(storedCurrent) as User;
  }
  return initialUsers.length > 0 ? initialUsers[0] : null;
}

export function useUserManager() {
  // 在初始值中讀取 localStorage
  const initialUsers = loadUsers();
  const initialCurrentUser = loadCurrentUser(initialUsers);

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(initialCurrentUser);

  // 當 users 改變時，同步存入 localStorage
  useEffect(() => {
    localStorage.setItem(USER_LIST_KEY, JSON.stringify(users));
  }, [users]);

  // 當 currentUser 改變時，同步存入 localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const addUser = (user: User) => {
    const newUsers = [...users, user];
    setUsers(newUsers);
    setCurrentUser(user);
  };

  const updateUser = (user: User) => {
    const updatedUsers = users.map(u => (u.id === user.id ? user : u));
    setUsers(updatedUsers);
    if (currentUser && currentUser.id === user.id) {
      setCurrentUser(user);
    }
  };

  const removeUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    if (currentUser && currentUser.id === id) {
      setCurrentUser(updatedUsers[0] || null);
    }
  };

  return { users, currentUser, setCurrentUser, addUser, updateUser, removeUser };
}