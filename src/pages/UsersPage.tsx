// src/pages/UsersPage.tsx
import React, { useState } from 'react';
import { useUserContext } from '../context/UserContext';
import UserForm from '../components/UserForm';
import { User, UserRole } from '../hooks/useUserManager';

const UsersPage: React.FC = () => {
  const { users, currentUser, setCurrentUser, addUser, updateUser, removeUser } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
      role: UserRole.Basic,
      company: {
        name: '',
        address: '',
        id: '',
        phone: '',
        fax: '',
      },
    });
    setIsModalOpen(true);
  };

  // 進入編輯使用者狀態
  const handleEditUser = (user: User) => {
    setForm(user);
    setIsModalOpen(true);
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
    setIsModalOpen(false);
  };

  // 關閉 Modal
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">使用者管理</h1>
      <div className="mb-4 flex flex-col md:flex-row items-center md:justify-between">
        <div className="form-control w-full md:w-1/3">
          <label className="label">
            <span className="label-text">切換使用者</span>
          </label>
          <select
            className="select select-bordered"
            value={currentUser?.id || ''}
            onChange={handleSelectUser}
          >
            <option value="">請選擇使用者</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="btn btn-primary" onClick={handleAddUser}>
            新增使用者
          </button>
        </div>
      </div>

      {currentUser && !isModalOpen && (
        <div className="card bg-base-100 shadow-md mb-8">
          <div className="card-body">
            <h2 className="card-title">目前使用者資訊</h2>
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
            <div className="divider">公司資訊</div>
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
              <strong>公司電話：</strong> {currentUser.company.phone} | <strong>傳真：</strong> {currentUser.company.fax}
            </p>
          </div>
        </div>
      )}

      {/* 所有使用者列表 */}
      <h2 className="text-2xl font-bold mb-2">所有使用者</h2>
      {users.length === 0 ? (
        <p>尚無使用者</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
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
                    <div className="flex space-x-1">
                      <button className="btn btn-sm btn-primary" onClick={() => setCurrentUser(user)}>
                        切換
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEditUser(user)}>
                        編輯
                      </button>
                      <button className="btn btn-sm btn-error" onClick={() => handleDeleteUser(user.id)}>
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal - 使用 DaisyUI 的 modal 組件 */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <label
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleCancel}
            >
              ✕
            </label>
            <UserForm initialInfo={form || undefined} onSave={handleSubmit} onCancel={handleCancel} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;