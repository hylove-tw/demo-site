// src/pages/UserPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserManager, MemberInfo, UserRole } from '../hooks/useUserManager';
import UserForm from '../components/UserForm';

const UserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, updateUser, removeUser } = useUserManager();
  const user = users.find(u => u.id === id);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  if (!user) {
    return <div>找不到該使用者</div>;
  }

  const handleSave = (updatedUser: MemberInfo) => {
    updateUser(updatedUser);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("確定要刪除此使用者嗎？")) {
      removeUser(user.id);
      navigate("/users");
    }
  };

  return (
    <div>
      <h1>使用者詳細資訊</h1>
      {isEditing ? (
        <UserForm
          initialInfo={user}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div>
          <p><strong>身分：</strong> {user.role}</p>
          <p><strong>姓名：</strong> {user.name}</p>
          <p><strong>電話：</strong> {user.phone}</p>
          <p><strong>Email：</strong> {user.email}</p>
          <h3>公司資訊</h3>
          <p><strong>公司名稱：</strong> {user.company.name}</p>
          <p><strong>地址：</strong> {user.company.address}</p>
          <p><strong>統一編號：</strong> {user.company.id}</p>
          <p>
            <strong>公司電話：</strong> {user.company.phone} |{' '}
            <strong>傳真：</strong> {user.company.fax}
          </p>
          <button onClick={() => setIsEditing(true)}>編輯資訊</button>
          <button onClick={handleDelete}>刪除使用者</button>
        </div>
      )}
    </div>
  );
};

export default UserPage;