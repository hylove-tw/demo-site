// src/pages/UsersPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import UserForm from '../components/UserForm';
import { User, UserRole } from '../hooks/useUserManager';

const UsersPage: React.FC = () => {
  const {
    users,
    currentUser,
    setCurrentUser,
    addUser,
    updateUser,
    removeUser,
  } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

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

  const handleEditUser = (user: User) => {
    setForm(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteConfirmUser(user);
  };

  const confirmDelete = () => {
    if (deleteConfirmUser) {
      removeUser(deleteConfirmUser.id);
      setDeleteConfirmUser(null);
    }
  };

  const handleSubmit = (user: User) => {
    if (!user.id) {
      addUser({ ...user, id: Date.now().toString() });
    } else {
      updateUser(user);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto">
      {/* 麵包屑 */}
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li>
            <Link to="/">首頁</Link>
          </li>
          <li>受測者管理</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold">受測者管理</h1>
        <button className="btn btn-primary mt-4 sm:mt-0" onClick={handleAddUser}>
          新增受測者
        </button>
      </div>

      {/* 目前受測者資訊 */}
      {currentUser && (
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">目前受測者</h2>
              <span className="badge badge-primary">{currentUser.role}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-base-content/60">姓名</p>
                <p className="font-medium">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">電話</p>
                <p className="font-medium">{currentUser.phone || '未設定'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Email</p>
                <p className="font-medium">{currentUser.email || '未設定'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">公司</p>
                <p className="font-medium">
                  {currentUser.company.name || '未設定'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 受測者列表 */}
      <h2 className="text-2xl font-bold mb-4">所有受測者</h2>
      {users.length === 0 ? (
        <div className="text-center py-8 text-base-content/60">
          <p>尚無受測者</p>
          <p className="text-sm mt-2">請點擊上方按鈕新增受測者</p>
        </div>
      ) : (
        <>
          {/* 桌面版表格 */}
          <div className="hidden md:block overflow-x-auto bg-base-100 rounded-lg shadow">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>身分</th>
                  <th>姓名</th>
                  <th>電話</th>
                  <th>Email</th>
                  <th>公司</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={currentUser?.id === user.id ? 'bg-base-200' : ''}
                  >
                    <td>
                      <span className="badge badge-outline badge-sm">
                        {user.role}
                      </span>
                    </td>
                    <td className="font-medium">{user.name}</td>
                    <td>{user.phone || '-'}</td>
                    <td>{user.email || '-'}</td>
                    <td>{user.company.name || '-'}</td>
                    <td>
                      <div className="flex space-x-2">
                        {currentUser?.id !== user.id && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setCurrentUser(user)}
                          >
                            切換
                          </button>
                        )}
                        {currentUser?.id === user.id && (
                          <span className="badge badge-success">使用中</span>
                        )}
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleEditUser(user)}
                        >
                          編輯
                        </button>
                        <button
                          className="btn btn-sm btn-error btn-outline"
                          onClick={() => handleDeleteUser(user)}
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 手機版卡片 */}
          <div className="md:hidden space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className={`card bg-base-100 shadow ${
                  currentUser?.id === user.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <span className="badge badge-outline badge-sm">
                        {user.role}
                      </span>
                    </div>
                    {currentUser?.id === user.id && (
                      <span className="badge badge-success">使用中</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <p className="text-base-content/60">電話</p>
                      <p>{user.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-base-content/60">公司</p>
                      <p>{user.company.name || '-'}</p>
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-3">
                    {currentUser?.id !== user.id && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setCurrentUser(user)}
                      >
                        切換
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleEditUser(user)}
                    >
                      編輯
                    </button>
                    <button
                      className="btn btn-sm btn-error btn-outline"
                      onClick={() => handleDeleteUser(user)}
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 編輯/新增 Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative max-w-2xl">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleCancel}
            >
              ✕
            </button>
            <UserForm
              initialInfo={form || undefined}
              onSave={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
          <div className="modal-backdrop" onClick={handleCancel} />
        </div>
      )}

      {/* 刪除確認 Modal */}
      {deleteConfirmUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">確認刪除</h3>
            <p className="py-4">
              確定要刪除受測者「<span className="font-semibold">{deleteConfirmUser.name}</span>」嗎？
              <br />
              <span className="text-sm text-base-content/60">此操作無法復原。</span>
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteConfirmUser(null)}
              >
                取消
              </button>
              <button className="btn btn-error" onClick={confirmDelete}>
                確認刪除
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setDeleteConfirmUser(null)}
          />
        </div>
      )}
    </div>
  );
};

export default UsersPage;
