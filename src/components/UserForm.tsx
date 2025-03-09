// src/components/UserForm.tsx
import React, { useState } from 'react';
import { User, UserRole } from '../hooks/useUserManager';

interface UserFormProps {
  initialInfo?: User;
  onSave: (info: User) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initialInfo, onSave, onCancel }) => {
  const [form, setForm] = useState<User>(
    initialInfo || {
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
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('company.')) {
      const key = name.split('.')[1];
      setForm({
        ...form,
        company: {
          ...form.company,
          [key]: value,
        },
      });
    } else if (name === 'role') {
      setForm({ ...form, role: value as UserRole });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{form.id ? '編輯使用者' : '新增使用者'}</h2>
      <div>
        <label>身分：</label>
        <select name="role" value={form.role} onChange={handleInputChange}>
          {Object.values(UserRole).map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>姓名：</label>
        <input name="name" value={form.name} onChange={handleInputChange} required />
      </div>
      <div>
        <label>電話：</label>
        <input name="phone" value={form.phone} onChange={handleInputChange} required />
      </div>
      <div>
        <label>Email：</label>
        <input name="email" type="email" value={form.email} onChange={handleInputChange} required />
      </div>
      <h3>公司資訊</h3>
      <div>
        <label>公司名稱：</label>
        <input name="company.name" value={form.company.name} onChange={handleInputChange} required />
      </div>
      <div>
        <label>地址：</label>
        <input name="company.address" value={form.company.address} onChange={handleInputChange} required />
      </div>
      <div>
        <label>統一編號：</label>
        <input name="company.id" value={form.company.id} onChange={handleInputChange} required />
      </div>
      <div>
        <label>公司電話：</label>
        <input name="company.phone" value={form.company.phone} onChange={handleInputChange} />
      </div>
      <div>
        <label>公司傳真：</label>
        <input name="company.fax" value={form.company.fax} onChange={handleInputChange} />
      </div>
      <button type="submit">儲存</button>
      <button type="button" onClick={onCancel}>
        取消
      </button>
    </form>
  );
};

export default UserForm;