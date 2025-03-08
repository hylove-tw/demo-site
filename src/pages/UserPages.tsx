// src/pages/UsersPage.tsx
import React, {useState} from 'react';
import {useUserManager, MemberInfo} from '../hooks/useUserManager';
import {useNavigate} from 'react-router-dom';

const UsersPage: React.FC = () => {
    const {users, setCurrentUser, addUser, updateUser, removeUser} = useUserManager();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [form, setForm] = useState<MemberInfo | null>(null);
    const navigate = useNavigate();

    // 切換使用者
// 進入新增使用者狀態
    const handleAddUser = () => {
        setForm({
            id: '',
            name: '',
            phone: '',
            email: '',
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
    const handleEditUser = (user: MemberInfo) => {
        setForm(user);
        setIsEditing(true);
    };

    // 刪除使用者
    const handleDeleteUser = (id: string) => {
        if (window.confirm('確定要刪除此使用者？')) {
            removeUser(id);
        }
    };

    // 表單提交
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form) {
            if (!form.id) {
                // 新增使用者：自動產生 id 並加入用戶列表
                const newUser: MemberInfo = {...form, id: Date.now().toString()};
                addUser(newUser);
            } else {
                // 編輯使用者
                updateUser(form);
            }
            setIsEditing(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (form) {
            const {name, value} = e.target;
            if (name.startsWith('company.')) {
                const key = name.split('.')[1];
                setForm({
                    ...form,
                    company: {
                        ...form.company,
                        [key]: value,
                    },
                });
            } else {
                setForm({...form, [name]: value});
            }
        }
    };

    // 用戶切換後導向該用戶的詳細頁或儀表板
    const handleViewUserDetails = (id: string) => {
        navigate(`/users/${id}`);
    };

    return (
        <div>
            <h1>使用者管理</h1>
            <div>
                <button onClick={handleAddUser}>新增使用者</button>
            </div>

            {isEditing && form && (
                <form onSubmit={handleSubmit} style={{marginTop: '1rem'}}>
                    <h2>{form.id ? '編輯使用者' : '新增使用者'}</h2>
                    <div>
                        <label>姓名：</label>
                        <input name="name" value={form.name} onChange={handleInputChange} required/>
                    </div>
                    <div>
                        <label>電話：</label>
                        <input name="phone" value={form.phone} onChange={handleInputChange} required/>
                    </div>
                    <div>
                        <label>Email：</label>
                        <input name="email" type="email" value={form.email} onChange={handleInputChange} required/>
                    </div>
                    <h3>公司資訊</h3>
                    <div>
                        <label>公司名稱：</label>
                        <input name="company.name" value={form.company.name} onChange={handleInputChange} required/>
                    </div>
                    <div>
                        <label>地址：</label>
                        <input name="company.address" value={form.company.address} onChange={handleInputChange}
                               required/>
                    </div>
                    <div>
                        <label>統一編號：</label>
                        <input name="company.id" value={form.company.id} onChange={handleInputChange} required/>
                    </div>
                    <div>
                        <label>公司電話：</label>
                        <input name="company.phone" value={form.company.phone} onChange={handleInputChange}/>
                    </div>
                    <div>
                        <label>公司傳真：</label>
                        <input name="company.fax" value={form.company.fax} onChange={handleInputChange}/>
                    </div>
                    <button type="submit">儲存</button>
                    <button type="button" onClick={() => setIsEditing(false)}>
                        取消
                    </button>
                </form>
            )}

            {/* 列出所有使用者資訊 */}
            <h2>所有使用者</h2>
            <table border={1} cellPadding={5} style={{width: '100%', marginTop: '1rem'}}>
                <thead>
                <tr>
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
                        <td>{user.name}</td>
                        <td>{user.phone}</td>
                        <td>{user.email}</td>
                        <td>{user.company.name}</td>
                        <td>
                            <button onClick={() => setCurrentUser(user)}>選擇</button>
                            <button onClick={() => handleEditUser(user)}>編輯</button>
                            <button onClick={() => handleDeleteUser(user.id)}>刪除</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsersPage;