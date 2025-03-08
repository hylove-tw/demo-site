// src/hooks/useUserManager.ts
import { useState, useEffect } from 'react';

export interface CompanyInfo {
  name: string;
  address: string;
  id: string;
  phone: string;
  fax: string;
}

export interface MemberInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: CompanyInfo;
}

export function useUserManager() {
  const [users, setUsers] = useState<MemberInfo[]>([]);
  const [currentUser, setCurrentUser] = useState<MemberInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('memberInfos');
    if (stored) {
      const parsed = JSON.parse(stored) as MemberInfo[];
      setUsers(parsed);
      if (parsed.length > 0) {
        setCurrentUser(parsed[0]);
      }
    }
  }, []);

  const saveUsers = (users: MemberInfo[]) => {
    localStorage.setItem('memberInfos', JSON.stringify(users));
  };

  const addUser = (user: MemberInfo) => {
    const newUsers = [...users, user];
    setUsers(newUsers);
    saveUsers(newUsers);
    setCurrentUser(user);
  };

  const updateUser = (user: MemberInfo) => {
    const updatedUsers = users.map(u => (u.id === user.id ? user : u));
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    if (currentUser && currentUser.id === user.id) {
      setCurrentUser(user);
    }
  };

  const removeUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    if (currentUser && currentUser.id === id) {
      setCurrentUser(updatedUsers[0] || null);
    }
  };

  return { users, currentUser, setCurrentUser, addUser, updateUser, removeUser };
}