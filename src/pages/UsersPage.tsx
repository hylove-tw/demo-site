// src/pages/UsersPage.tsx
import React, { useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { User, UserRole } from '../hooks/useUserManager';
import UserForm from '../components/UserForm';

const UsersPage: React.FC = () => {
  const { users, currentUser, setCurrentUser, addUser, updateUser, removeUser } = useUserContext();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [form, setForm] = useState<User | null>(null);

  // 切換當前使用者
  const handleSelectUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = users.find(u => u.id === selectedId);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  // 進入新增使用者狀態
  const handleAddUser = () => {
    setForm({
      id: '',
      name: '',
      phone: '',
      email: '',
      role: UserRole.Basic, // 預設角色
      company: {
        name: '',
        address: '',
        id: '',
        phone: '',
        fax: '',
      },
    });
    setIsEditing(true);
  };

  // 進入編輯使用者狀態
  const handleEditUser = (user: User) => {
    setForm(user);
    setIsEditing(true);
  };

  // 刪除使用者
  const handleDeleteUser = (id: string) => {
    if (window.confirm('確定要刪除此使用者？')) {
      removeUser(id);
    }
  };

  // 表單提交：若 id 為空則新增，否則更新
  const handleSubmit = (user: User) => {
    if (!user.id) {
      addUser({ ...user, id: Date.now().toString() });
    } else {
      updateUser(user);
    }
    setIsEditing(false);
  };

  return (
    <div>
      <h1>使用者管理</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label>切換使用者：</label>
        <select value={currentUser?.id || ''} onChange={handleSelectUser}>
          <option value="">請選擇使用者</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        {currentUser && (
          <>
            <button onClick={() => setIsEditing(true)}>編輯使用者資訊</button>
          </>
        )}
        <button onClick={handleAddUser}>新增使用者</button>
      </div>

      {isEditing && form ? (
        <UserForm initialInfo={form} onSave={handleSubmit} onCancel={() => setIsEditing(false)} />
      ) : (
        currentUser && (
          <div style={{ marginTop: '1rem' }}>
            <h2>目前使用者資訊</h2>
            <p>
              <strong>身分：</strong> {currentUser.role}
            </p>
            <p>
              <strong>姓名：</strong> {currentUser.name}
            </p>
            <p>
              <strong>電話：</strong> {currentUser.phone}
            </p>
            <p>
              <strong>Email：</strong> {currentUser.email}
            </p>
            <h3>公司資訊</h3>
            <p>
              <strong>公司名稱：</strong> {currentUser.company.name}
            </p>
            <p>
              <strong>地址：</strong> {currentUser.company.address}
            </p>
            <p>
              <strong>統一編號：</strong> {currentUser.company.id}
            </p>
            <p>
              <strong>公司電話：</strong> {currentUser.company.phone} |{' '}
              <strong>傳真：</strong> {currentUser.company.fax}
            </p>
          </div>
        )
      )}

      <h2 style={{ marginTop: '2rem' }}>所有使用者</h2>
      {users.length === 0 ? (
        <p>尚無使用者</p>
      ) : (
        <table border={1} cellPadding={5} style={{ width: '100%', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>身分</th>
              <th>姓名</th>
              <th>電話</th>
              <th>Email</th>
              <th>公司名稱</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.role}</td>
                <td>{user.name}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>{user.company.name}</td>
                <td>
                  <button onClick={() => setCurrentUser(user)}>切換</button>
                  <button onClick={() => handleEditUser(user)}>編輯</button>
                  <button onClick={() => handleDeleteUser(user.id)}>刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsersPage;