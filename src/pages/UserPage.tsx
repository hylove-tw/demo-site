// src/pages/UserPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserManager, MemberInfo } from '../hooks/useUserManager';

const UserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, updateUser, removeUser } = useUserManager();

  // 找出指定使用者
  const user = users.find(u => u.id === id);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [form, setForm] = useState<MemberInfo | null>(user || null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (form) {
      const { name, value } = e.target;
      // 處理公司資訊的欄位（格式：company.xxx）
      if (name.startsWith("company.")) {
        const key = name.split('.')[1];
        setForm({
          ...form,
          company: { ...form.company, [key]: value }
        });
      } else {
        setForm({ ...form, [name]: value });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form) {
      updateUser(form);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (user && window.confirm("確定要刪除此使用者？")) {
      removeUser(user.id);
      navigate("/users"); // 刪除後返回使用者列表
    }
  };

  if (!user) {
    return <div>找不到該使用者</div>;
  }

  return (
    <div>
      <h1>使用者詳細資訊</h1>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <h2>編輯使用者資訊</h2>
          <div>
            <label>姓名：</label>
            <input
              name="name"
              value={form?.name || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>電話：</label>
            <input
              name="phone"
              value={form?.phone || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Email：</label>
            <input
              type="email"
              name="email"
              value={form?.email || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <h3>公司資訊</h3>
          <div>
            <label>公司名稱：</label>
            <input
              name="company.name"
              value={form?.company.name || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>地址：</label>
            <input
              name="company.address"
              value={form?.company.address || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>統一編號：</label>
            <input
              name="company.id"
              value={form?.company.id || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>公司電話：</label>
            <input
              name="company.phone"
              value={form?.company.phone || ""}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>公司傳真：</label>
            <input
              name="company.fax"
              value={form?.company.fax || ""}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">儲存</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            取消
          </button>
        </form>
      ) : (
        <div>
          <p>
            <strong>姓名：</strong> {user.name}
          </p>
          <p>
            <strong>電話：</strong> {user.phone}
          </p>
          <p>
            <strong>Email：</strong> {user.email}
          </p>
          <h3>公司資訊</h3>
          <p>
            <strong>公司名稱：</strong> {user.company.name}
          </p>
          <p>
            <strong>地址：</strong> {user.company.address}
          </p>
          <p>
            <strong>統一編號：</strong> {user.company.id}
          </p>
          <p>
            <strong>公司電話：</strong> {user.company.phone} | <strong>傳真：</strong> {user.company.fax}
          </p>
          <button onClick={() => setIsEditing(true)}>編輯資訊</button>
          <button onClick={handleDelete}>刪除使用者</button>
        </div>
      )}
    </div>
  );
};

export default UserPage;