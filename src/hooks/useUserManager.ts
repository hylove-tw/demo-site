// src/hooks/useUserManager.ts
import {useState, useEffect} from 'react';

export interface CompanyInfo {
    name: string;
    address: string;
    id: string;
    phone: string;
    fax: string;
}

export enum UserRole {
    Admin = '管理者',
    Basic = '一般使用者',
}

export interface UserInfo {
    id: string;
    name: string;
    phone: string;
    email: string;
    company: CompanyInfo;
    role?: UserRole;
}

export function useUserManager() {
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('memberInfos');
        if (stored) {
            const parsed = JSON.parse(stored) as UserInfo[];
            setUsers(parsed);
            if (parsed.length > 0) {
                setCurrentUser(parsed[0]);
            }
        }
    }, []);

    const saveUsers = (users: UserInfo[]) => {
        localStorage.setItem('memberInfos', JSON.stringify(users));
    };

    const addUser = (user: UserInfo) => {
        const newUsers = [...users, user];
        setUsers(newUsers);
        saveUsers(newUsers);
        setCurrentUser(user);
    };

    const updateUser = (user: UserInfo) => {
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

    return {users, currentUser, setCurrentUser, addUser, updateUser, removeUser};
}