// src/components/UserForm.tsx
import React, {useState} from 'react';
import {User, UserRole} from "../hooks/useUserManager";

interface UserFormProps {
    initialInfo?: User;
    onSave: (info: User) => void;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({initialInfo, onSave, onCancel}) => {
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

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;
        if (name.startsWith('company.')) {
            const key = name.split('.')[1];
            setForm({
                ...form,
                company: {...form.company, [key]: value},
            });
        } else if (name === 'role') {
            setForm({...form, role: value as UserRole});
        } else {
            setForm({...form, [name]: value});
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 若 id 為空則自動產生一個 id
        onSave({...form});
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-base-200 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">{form.id ? '編輯使用者' : '新增使用者'}</h2>

            <div className="form-control mb-4">
                <label className="label">
                    <span className="label-text">身分</span>
                </label>
                <select
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    className="select select-bordered"
                >
                    {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-control mb-4">
                <label className="label">
                    <span className="label-text">姓名</span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="請輸入姓名"
                    className="input input-bordered"
                    required
                />
            </div>

            <div className="form-control mb-4">
                <label className="label">
                    <span className="label-text">電話</span>
                </label>
                <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="請輸入電話"
                    className="input input-bordered"
                    required
                />
            </div>

            <div className="form-control mb-4">
                <label className="label">
                    <span className="label-text">Email</span>
                </label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="請輸入 Email"
                    className="input input-bordered"
                    required
                />
            </div>

            <div className="divider">公司資訊</div>

            <div className="form-control mb-4">
                <label className="label">
                    <span className="label-text">公司名稱</span>
                </label>
                <input
                    type="text"
                    name="company.name"
                    value={form.company.name}
                    onChange={handleInputChange}
                    placeholder="請輸入公司名稱"
                    className="input input-bordered"
                    required
                />
            </div>

            <div className="form-control mb-4">
                <label className="label">
                    <span className="label-text">地址</span>
                </label>
                <input
                    type="text"
                    name="company.address"
                    value={form.company.address}
                    onChange={handleInputChange}
                    placeholder="請輸入公司地址"
                    className="input input-bordered"
                    required
                />
            </div>

            <div className="form-control mb-4">
                <label className="label">
                    <span className="label-text">統一編號</span>
                </label>
                <input
                    type="text"
                    name="company.id"
                    value={form.company.id}
                    onChange={handleInputChange}
                    placeholder="請輸入統一編號"
                    className="input input-bordered"
                    required
                />
            </div>

            <div className="form-control mb-4">
                <label className="label">
                    <span className="label-text">公司電話</span>
                </label>
                <input
                    type="text"
                    name="company.phone"
                    value={form.company.phone}
                    onChange={handleInputChange}
                    placeholder="請輸入公司電話"
                    className="input input-bordered"
                />
            </div>

            <div className="form-control mb-4">
                <label className="label">
                    <span className="label-text">公司傳真</span>
                </label>
                <input
                    type="text"
                    name="company.fax"
                    value={form.company.fax}
                    onChange={handleInputChange}
                    placeholder="請輸入公司傳真"
                    className="input input-bordered"
                />
            </div>

            <div className="flex justify-end space-x-2">
                <button type="submit" className="btn btn-primary">
                    儲存
                </button>
                <button type="button" onClick={onCancel} className="btn btn-secondary">
                    取消
                </button>
            </div>
        </form>
    );
};

export default UserForm;